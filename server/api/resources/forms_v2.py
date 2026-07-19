import json
import logging

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common import form_utils, user_utils
from common.commonUtil import get_current_time
from data import orm_serializer
from models import (
    FormSubmissionOrmV2,
    FormTemplateOrmV2,
    PatientOrm,
    UserOrm,
)
from validation.formsV2_models import (
    CreateFormSubmissionRequest,
    FormIdPath,
    FormSubmission,
    FormSubmissionWithAnswers,
    UpdateFormRequestBody,
)

LOGGER = logging.getLogger(__name__)

# /api/forms/v2/submissions
api_form_submissions_v2 = APIBlueprint(
    name="forms_v2",
    import_name=__name__,
    url_prefix="/forms/v2/submissions",
    abp_tags=[
        Tag(
            name="Forms submissions V2 API",
            description="Endpoints for form submissions.",
        )
    ],
    abp_security=[{"jwt": []}],
)


# /api/forms/v2/submissions [POST]
@api_form_submissions_v2.post("", responses={201: FormSubmission})
def submit_form(body: CreateFormSubmissionRequest):
    """Submit a Form"""
    submission = body
    LOGGER.info("submit_form: incoming body=%s", submission.model_dump())

    if submission.id is not None:
        if crud.read(FormSubmissionOrmV2, id=submission.id):
            LOGGER.info(
                "submit_form: submission id=%s already exists, aborting 409",
                submission.id,
            )
            return abort(409, description="Form submission already exists.")

    # Verify that patient exists
    patient = crud.read(PatientOrm, id=submission.patient_id)
    LOGGER.info(
        "submit_form: patient_id=%s found=%s", submission.patient_id, patient is not None
    )
    if patient is None:
        return abort(404, description="Patient does not exist.")

    # Verify that form_template_id exists
    if submission.form_template_id is not None:
        form_template: FormTemplateOrmV2 = crud.read(
            FormTemplateOrmV2, id=submission.form_template_id
        )
        LOGGER.info(
            "submit_form: form_template_id=%s found=%s",
            submission.form_template_id,
            form_template is not None,
        )

        if form_template is None:
            return abort(404, description="Form template does not exist.")

        # Verify that all required questions have answers
        template_questions = form_template.questions
        submitted_ids = {a.question_id for a in submission.answers}
        LOGGER.info(
            "submit_form: template_question_ids=%s submitted_answer_ids=%s",
            [q.id for q in template_questions],
            submitted_ids,
        )

        for q in template_questions:
            if q.required and q.id not in submitted_ids:
                LOGGER.info(
                    "submit_form: missing answer for required question_id=%s", q.id
                )
                return abort(
                    422, description=f"Missing answer for required question: {q.id}"
                )

    # Verify that the user exists
    if submission.user_id is not None:
        user = crud.read(UserOrm, id=submission.user_id)
        LOGGER.info(
            "submit_form: user_id=%s (from request) found=%s",
            submission.user_id,
            user is not None,
        )
        if user is None:
            return abort(404, description="User does not exist.")
    else:
        current_user = user_utils.get_current_user_from_jwt()
        user_id = int(current_user["id"])
        submission.user_id = user_id
        LOGGER.info(
            "submit_form: user_id not provided, defaulted to JWT user_id=%s", user_id
        )

    validation = form_utils.validate_form_answers(
        submission.answers, submission.form_template_id
    )
    LOGGER.info("submit_form: answer validation ok=%s", validation.ok)

    if not validation.ok:
        return abort(validation.code, description=validation.msg)

    form_utils.assign_form_ids_v2(submission)
    LOGGER.info(
        "submit_form: assigned ids, submission.id=%s answer_ids=%s",
        submission.id,
        [a.id for a in submission.answers],
    )

    form = orm_serializer.unmarshal(FormSubmissionOrmV2, submission.model_dump())

    form.date_submitted = get_current_time()
    form.last_edited = form.date_submitted
    form.archived = False

    crud.create(form, refresh=True)
    result = orm_serializer.marshal(form, shallow=True)
    LOGGER.info("submit_form: created form submission=%s", result)

    return FormSubmission(**result).model_dump(), 201


# /api/forms/v2/submissions/<string:form_submission_id> [GET]
@api_form_submissions_v2.get(
    "/<string:form_submission_id>", responses={200: FormSubmissionWithAnswers}
)
def get_form(path: FormIdPath):
    """Get Form"""
    LOGGER.info("get_form: form_submission_id=%s", path.form_submission_id)
    form = crud.read(FormSubmissionOrmV2, id=path.form_submission_id)
    LOGGER.info("get_form: found=%s", form is not None)

    if form is None:
        return abort(404, description=f"No form with ID: {path.form_submission_id}.")

    form_answers = form_utils.attach_questions(form)
    form = orm_serializer.marshal(form, shallow=False)

    if form.get("answers", None):
        form.pop("answers", None)

    result = FormSubmissionWithAnswers(
        **form,
        answers=form_answers,
    )
    LOGGER.info("get_form: result=%s", result.model_dump())

    return result.model_dump()


# /api/forms/v2/submissions/<string:form_submission_id> [PATCH]
@api_form_submissions_v2.patch(
    "/<string:form_submission_id>", responses={200: FormSubmission}
)
def update_form(path: FormIdPath, body: UpdateFormRequestBody):
    """Update a previously submitted form (partial update of answers)."""
    LOGGER.info(
        "update_form: form_submission_id=%s body=%s",
        path.form_submission_id,
        body.model_dump(),
    )
    form: FormSubmissionOrmV2 = crud.read(
        FormSubmissionOrmV2, id=path.form_submission_id
    )
    LOGGER.info("update_form: found=%s", form is not None)
    if form is None:
        return abort(404, description=f"No form with id {path.form_submission_id}")

    validation = form_utils.validate_form_answers(body.answers, form.form_template_id)
    LOGGER.info("update_form: answer validation ok=%s", validation.ok)

    if not validation.ok:
        return abort(validation.code, description=validation.msg)

    payload = body.model_dump()

    existing_answers_by_id = {a.id: a for a in form.answers}
    LOGGER.info(
        "update_form: existing_answer_ids=%s incoming_answer_ids=%s",
        list(existing_answers_by_id.keys()),
        [a.get("id") for a in payload["answers"]],
    )

    for updated_ans in payload["answers"]:
        ans_id = updated_ans.get("id")

        # If answer doesn't already exist, return 404
        if ans_id not in existing_answers_by_id:
            LOGGER.info("update_form: answer id=%s not found on form", ans_id)
            return abort(
                404, description=f"Answer with id {ans_id} does not exist on this form."
            )

        # apply update
        existing_answer = existing_answers_by_id[ans_id]

        existing_answer.answer = json.dumps(updated_ans["answer"])
        LOGGER.info(
            "update_form: applied answer id=%s new_value=%s",
            ans_id,
            updated_ans["answer"],
        )

    current_user = user_utils.get_current_user_from_jwt()
    user_id = int(current_user["id"])

    form.user_id = user_id
    form.last_edited = get_current_time()

    crud.db_session.commit()
    crud.db_session.refresh(form)

    result = orm_serializer.marshal(form, shallow=True)
    LOGGER.info("update_form: result=%s", result)
    return FormSubmission(**result).model_dump(), 200
