import json

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common import form_utils, user_utils
from common.commonUtil import get_current_time
from data import marshal
from models import (
    FormSubmissionOrmV2,
    FormTemplateOrmV2,
    PatientOrm,
    UserOrm,
)
from validation.formsV2_models import (
    FormIdPath,
    FormSubmission,
    FormSubmissionResponse,
    UpdateFormRequestBody,
)

# /api/forms/v2/responses
api_form_submissions_v2 = APIBlueprint(
    name="forms_v2",
    import_name=__name__,
    url_prefix="/forms/v2/responses",
    abp_tags=[Tag(name="Forms", description="Endpoints for form submissions.")],
    abp_security=[{"jwt": []}],
)


# /api/forms/v2/responses [POST]
@api_form_submissions_v2.post("", responses={201: FormSubmissionResponse})
def submit_form(body: FormSubmission):
    """Submit a Form"""
    submission = body

    if submission.id is not None:
        if crud.read(FormSubmissionOrmV2, id=submission.id):
            return abort(409, description="Form submission already exists.")

    # Verify that patient exists
    patient = crud.read(PatientOrm, id=submission.patient_id)
    if patient is None:
        return abort(404, description="Patient does not exist.")

    # Verify that form_template_id exists
    if submission.form_template_id is not None:
        form_template: FormTemplateOrmV2 = crud.read(
            FormTemplateOrmV2, id=submission.form_template_id
        )

        if form_template is None:
            return abort(404, description="Form template does not exist.")

        # Verify that all required questions have answers
        template_questions = form_template.questions
        submitted_ids = {a.question_id for a in submission.answers}

        for q in template_questions:
            if q.required and q.id not in submitted_ids:
                return abort(
                    422, description=f"Missing answer for required question: {q.id}"
                )

    # Verify that the user exists
    if submission.user_id is not None:
        user = crud.read(UserOrm, id=submission.user_id)
        if user is None:
            return abort(404, description="User does not exist.")
    else:
        current_user = user_utils.get_current_user_from_jwt()
        user_id = int(current_user["id"])
        submission.user_id = user_id

    validation = form_utils.validate_form_answers(
        submission.answers, submission.form_template_id
    )

    if not validation.ok:
        return abort(validation.code, description=validation.msg)

    new_form_dict = submission.model_dump()
    form_utils.assign_form_ids_v2(new_form_dict)

    form = marshal.unmarshal(FormSubmissionOrmV2, new_form_dict)

    form.date_submitted = get_current_time()
    form.last_edited = form.date_submitted

    crud.create(form, refresh=True)

    return marshal.marshal(form, shallow=True), 201


# /api/forms/v2/responses/<string:form_submission_id> [GET]
@api_form_submissions_v2.get(
    "/<string:form_submission_id>", responses={200: FormSubmission}
)
def get_form(path: FormIdPath):
    """Get Form"""
    form = crud.read(FormSubmissionOrmV2, id=path.form_submission_id)
    if form is None:
        return abort(404, description=f"No form with ID: {path.form_submission_id}.")

    return marshal.marshal(form, shallow=False)


# /api/forms/v2/responses/<string:form_submission_id> [PUT]
@api_form_submissions_v2.put(
    "/<string:form_submission_id>", responses={201: FormSubmission}
)
def update_form(path: FormIdPath, body: UpdateFormRequestBody):
    """Update a previously submitted form (partial update of answers)."""
    form: FormSubmissionOrmV2 = crud.read(
        FormSubmissionOrmV2, id=path.form_submission_id
    )
    if form is None:
        return abort(404, description=f"No form with id {path.form_submission_id}")

    validation = form_utils.validate_form_answers(body.answers, form.form_template_id)

    if not validation.ok:
        return abort(validation.code, description=validation.msg)

    payload = body.model_dump()

    existing_answers_by_id = {a.id: a for a in form.answers}

    for updated_ans in payload["answers"]:
        ans_id = updated_ans.get("id")

        # If answer doesn't already exist, return 404
        if ans_id not in existing_answers_by_id:
            return abort(
                404, description=f"Answer with id {ans_id} does not exist on this form."
            )

        # apply update
        existing_answer = existing_answers_by_id[ans_id]

        existing_answer.answer = json.dumps(updated_ans["answer"])

    current_user = user_utils.get_current_user_from_jwt()
    user_id = int(current_user["id"])

    form.user_id = user_id
    form.last_edited = get_current_time()

    crud.db_session.commit()
    crud.db_session.refresh(form)

    return marshal.marshal(form, True), 201
