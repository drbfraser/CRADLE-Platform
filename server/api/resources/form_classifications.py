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
from validation import CradleBaseModel
from validation.formTemplates import ClassificationValidator

# /api/forms/classifications
api_form_classifications = APIBlueprint(
    name="form_classifications",
    import_name=__name__,
    url_prefix="/forms/classifications",
    abp_tags=[Tag(name="Form Classifications", description="")],
)


# /api/forms/classifications [GET]
@api_form_classifications.get("")
def get_all_form_classifications():
    form_classifications = crud.read_all(FormClassificationOrm)
    return [marshal.marshal(f, shallow=True) for f in form_classifications], 200


# /api/forms/classifications [POST]
@api_form_classifications.post("")
@roles_required([RoleEnum.ADMIN])
def create_form_classification(body: ClassificationValidator):
    # Note: This validation logic is left out of the Pydantic validation system
    # because it relies on the database, which the unit tests do not have access to (Issue #689)
    if body.id is not None:
        if crud.read(FormClassificationOrm, id=body.id):
            return abort(409, description="Form classification already exists.")
    if crud.read(FormClassificationOrm, name=body.name):
        return abort(
            409,
            description="Form classification with the same name already exists.",
        )

    form_classification = marshal.unmarshal(FormClassificationOrm, body.model_dump())
    crud.create(form_classification, refresh=True)
    return marshal.marshal(form_classification, shallow=True), 201


# /api/forms/classifications/<string:form_classification_id> [GET]
@api_form_classifications.get("/<string:form_classification_id>")
def get_form_classification(path: FormClassificationIdPath):
    form_classification = crud.read(
        FormClassificationOrm, id=path.form_classification_id
    )
    if form_classification is None:
        return abort(
            400,
            description=f"No form classification with ID: {path.form_classification_id}",
        )

    return marshal.marshal(form_classification), 200


class FormClassificationPutBody(CradleBaseModel):
    name: str


# /api/forms/classifications/<string:form_classification_id> [PUT]
@api_form_classifications.put("/<string:form_classification_id>")
def update_form_classification_name(
    path: FormClassificationIdPath, body: FormClassificationPutBody
):
    form_classification = crud.read(
        FormClassificationOrm, id=path.form_classification_id
    )

    if form_classification is None:
        return abort(
            404,
            description=f"No form classification with ID: {path.form_classification_id}",
        )

    if body.name is not None:
        form_classification.name = body.name
        data.db_session.commit()
        data.db_session.refresh(form_classification)

    return marshal.marshal(form_classification, True), 201


# /api/forms/classifications/summary [GET]
@api_form_classifications.get("/summary")
def get_form_classification_summary():
    form_classifications = crud.read_all(FormClassificationOrm)
    result_templates = []

    for form_classification in form_classifications:
        possible_templates = crud.find(
            FormTemplateOrm,
            FormTemplateOrm.form_classification_id == form_classification.id,
        )

        if len(possible_templates) == 0:
            continue

        result_template = None
        for possible_template in possible_templates:
            if (
                result_template is None
                or possible_template.date_created > result_template.date_created
            ):
                result_template = possible_template

        if result_template is not None:
            result_templates.append(result_template)

    return [
        marshal.marshal(f, shallow=False, if_include_versions=True)
        for f in result_templates
    ], 200


# /api/forms/classifications/<string:form_classification_id>/templates [GET]
@api_form_classifications.get("/<string:form_classification_name>/templates")
def get_form_classification_templates(path: FormClassificationIdPath):
    form_templates = crud.read_all(
        FormTemplateOrm,
        form_classification_id=path.form_classification_id,
    )
    return [marshal.marshal(f, shallow=True) for f in form_templates], 200
