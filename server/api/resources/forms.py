import json

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data
from common import form_utils, user_utils
from common.api_utils import (
    FormIdPath,
)
from common.commonUtil import get_current_time
from data import crud, marshal
from models import FormOrm, FormTemplateOrm, PatientOrm, UserOrm
from validation.forms import FormModel, UpdateFormRequestBody

# /api/forms/responses
api_form_submissions = APIBlueprint(
    name="forms",
    import_name=__name__,
    url_prefix="/forms/responses",
    abp_tags=[Tag(name="Forms", description="")],
    abp_security=[{"jwt": []}],
)


# /api/forms/responses [POST]
@api_form_submissions.post("", responses={201: FormModel})
def submit_form(body: FormModel):
    """Submit Form"""
    if body.id is not None:
        if crud.read(FormOrm, id=body.id):
            return abort(409, description="Form already exists.")

    patient = crud.read(PatientOrm, id=body.patient_id)
    if patient is None:
        return abort(404, description="Patient does not exist.")

    if body.form_template_id is not None:
        form_template = crud.read(FormTemplateOrm, id=body.form_template_id)
        if form_template is None:
            return abort(404, description="Form template does not exist.")
        # TODO: Why do Forms have a foreign key to Form Classifications? This seems redundant.
        if form_template.form_classification_id != body.form_classification_id:
            return abort(
                400, description="Form classification does not match Template."
            )

    if body.last_edited_by is not None:
        user = crud.read(UserOrm, id=body.last_edited_by)
        if user is None:
            return abort(404, description="User does not exist.")
    else:
        current_user = user_utils.get_current_user_from_jwt()
        user_id = int(current_user["id"])
        body.last_edited_by = user_id

    new_form_dict = body.model_dump()

    form_utils.assign_form_or_template_ids(FormOrm, new_form_dict)

    form = marshal.unmarshal(FormOrm, new_form_dict)

    form.date_created = get_current_time()
    form.last_edited = form.date_created

    crud.create(form, refresh=True)

    return marshal.marshal(form, shallow=True), 201


# /api/forms/responses/<string:form_id> [GET]
@api_form_submissions.get("/<string:form_id>", responses={200: FormModel})
def get_form(path: FormIdPath):
    """Get Form"""
    form = crud.read(FormOrm, id=path.form_id)
    if form is None:
        return abort(404, description=f"No form with ID: {path.form_id}.")

    return marshal.marshal(form, False)


# /api/forms/responses/<string:form_id> [PUT]
@api_form_submissions.put("/<string:form_id>", responses={200: FormModel})
def update_form(path: FormIdPath, body: UpdateFormRequestBody):
    """Update Form"""
    form = crud.read(FormOrm, id=path.form_id)
    if form is None:
        return abort(404, description=f"No form with id {path.form_id}")

    update_form = body.model_dump()

    questions_upload = update_form["questions"]
    questions = form.questions
    question_ids = [q.id for q in questions]
    questions_dict = dict(zip(question_ids, questions))
    for question in questions_upload:
        question_id = question["id"]
        if question_id not in question_ids:
            return abort(
                404,
                description=f"Request question id={question_id} does not exist in server.",
            )
        answers = json.dumps(question["answers"])
        if answers != questions_dict[question_id].answers:
            questions_dict[question_id].answers = answers

    current_user = user_utils.get_current_user_from_jwt()
    user_id = int(current_user["id"])
    form.last_edited_by = user_id
    form.last_edited = get_current_time()

    data.db_session.commit()
    data.db_session.refresh(form)

    return marshal.marshal(form, True), 201
