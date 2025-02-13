from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data
from api.decorator import roles_required
from common.api_utils import (
    FormClassificationIdPath,
)
from data import crud, marshal
from enums import RoleEnum
from models import FormClassificationOrm, FormTemplateOrm
from validation.formClassifications import (
    FormClassificationModel,
    FormClassificationOptionalId,
)
from validation.formTemplates import FormTemplateList

# /api/forms/classifications
api_form_classifications = APIBlueprint(
    name="form_classifications",
    import_name=__name__,
    url_prefix="/forms/classifications",
    abp_tags=[Tag(name="Form Classifications", description="")],
    abp_security=[{"jwt": []}],
)


# /api/forms/classifications [GET]
@api_form_classifications.get("", responses={200: FormClassificationModel})
def get_all_form_classifications():
    """Get All Form Classifications"""
    form_classifications = crud.read_all(FormClassificationOrm)
    return [marshal.marshal(f, shallow=True) for f in form_classifications], 200


# /api/forms/classifications [POST]
@api_form_classifications.post("")
@roles_required([RoleEnum.ADMIN])
def create_form_classification(body: FormClassificationOptionalId):
    """Create Form Classification"""
    if body.id is not None:
        if crud.read(FormClassificationOrm, id=body.id):
            return abort(
                409,
                description=f"Form Classification with id=({body.id}) already exists.",
            )
    if crud.read(FormClassificationOrm, name=body.name):
        return abort(
            409,
            description=f"Form Classification with name=({body.name}) already exists.",
        )

    form_classification = marshal.unmarshal(FormClassificationOrm, body.model_dump())
    crud.create(form_classification, refresh=True)
    return marshal.marshal(form_classification, shallow=True), 201


# /api/forms/classifications/<string:form_classification_id> [GET]
@api_form_classifications.get("/<string:form_classification_id>")
def get_form_classification(path: FormClassificationIdPath):
    """Get Form Classification"""
    form_classification = crud.read(
        FormClassificationOrm, id=path.form_classification_id
    )
    if form_classification is None:
        return abort(
            400,
            description=f"No Form Classification with id=({path.form_classification_id}) found.",
        )

    return marshal.marshal(form_classification), 200


# /api/forms/classifications/<string:form_classification_id> [PUT]
@api_form_classifications.put(
    "/<string:form_classification_id>", responses={200: FormClassificationModel}
)
def edit_form_classification_name(
    path: FormClassificationIdPath, body: FormClassificationModel
):
    """Edit Form Classification"""
    if body.id != path.form_classification_id:
        return abort(400, "Cannot change id.")

    form_classification = crud.read(FormClassificationOrm, id=body.id)
    # TODO: The POST endpoint for creating a new Form Classification checks for naming conflicts with
    # existing Form Classifications, but this PUT endpoint does not. We should check for naming
    # conflicts here as well.
    if form_classification is None:
        return abort(
            404,
            description=f"No Form Classification with id=({path.form_classification_id}) found.",
        )

    form_classification.name = body.name
    data.db_session.commit()
    data.db_session.refresh(form_classification)

    return marshal.marshal(form_classification, True), 201


# /api/forms/classifications/summary [GET]
@api_form_classifications.get("/summary", responses={200: FormTemplateList})
def get_form_classification_summary():
    """
    Get Form Classification Summary
    Get a list containing the most recent Form Template version of each Form Classification.
    """
    form_classifications = crud.read_all(FormClassificationOrm)
    valid_templates = []

    for form_classification in form_classifications:
        possible_templates = crud.find(
            FormTemplateOrm,
            FormTemplateOrm.form_classification_id == form_classification.id,
        )

        if len(possible_templates) == 0:
            continue

        latest_template = None
        for possible_template in possible_templates:
            if (
                latest_template is None
                or possible_template.date_created > latest_template.date_created
            ):
                latest_template = possible_template

        # only include questions that don't already have answers.
        # this endpoint is used by Android when you go to Patients > Create New Form.
        if latest_template is not None:
            valid_questions = [] 
            for question in latest_template.questions:
                if question.is_blank:
                    valid_questions.append(question)
            latest_template.questions = valid_questions
            valid_templates.append(latest_template)

    marshaled_templates = [] 
    for template in valid_templates:
        marshaled_templates.append(marshal.marshal(template, shallow=False, if_include_versions=True))
    return marshaled_templates, 200


# /api/forms/classifications/<string:form_classification_id>/templates [GET]
@api_form_classifications.get(
    "/<string:form_classification_id>/templates", responses={200: FormTemplateList}
)
def get_form_classification_templates(path: FormClassificationIdPath):
    """
    Get Form Classification Templates
    Get a list of all Form Template versions of a particular Form Classification.
    """
    form_templates = crud.read_all(
        FormTemplateOrm,
        form_classification_id=path.form_classification_id,
    )
    return [marshal.marshal(f, shallow=True) for f in form_templates], 200
