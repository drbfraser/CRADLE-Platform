import json

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from sqlalchemy.orm.attributes import set_committed_value

import data.db_operations as crud
from api.authorization import load_authorized_patient_resource, require_patient_access
from common import form_utils, user_utils
from common.commonUtil import get_current_time
from data import orm_serializer
from models import (
    FormAnswerOrmV2,
    FormSubmissionOrmV2,
    FormTemplateOrmV2,
    PatientOrm,
)
from validation.formsV2_models import (
    CreateFormSubmissionRequest,
    FormAnswerBase,
    FormIdPath,
    FormSubmission,
    FormSubmissionWithAnswers,
    ReplaceFormRequestBody,
    UpdateFormRequestBody,
)

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
    require_patient_access(submission.patient_id)

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

    current_user = user_utils.get_current_user_from_jwt()

    validation = form_utils.validate_form_answers(
        submission.answers, submission.form_template_id
    )

    if not validation.ok:
        return abort(validation.code, description=validation.msg)

    form_data = submission.model_dump()
    form_utils.assign_form_ids_v2(form_data)
    form = orm_serializer.unmarshal(FormSubmissionOrmV2, form_data)

    form.user_id = int(current_user["id"])
    form.date_submitted = get_current_time()
    form.last_edited = form.date_submitted
    form.archived = False

    crud.create(form, refresh=True)
    result = orm_serializer.marshal(form, shallow=True)

    return FormSubmission(**result).model_dump(), 201


# /api/forms/v2/submissions/<string:form_submission_id> [GET]
@api_form_submissions_v2.get(
    "/<string:form_submission_id>", responses={200: FormSubmissionWithAnswers}
)
def get_form(path: FormIdPath):
    """Get Form"""
    form = load_authorized_patient_resource(
        FormSubmissionOrmV2, path.form_submission_id
    )

    form_answers = form_utils.attach_questions(form)
    form = orm_serializer.marshal(form, shallow=False)

    form.pop("answers", None)

    result = FormSubmissionWithAnswers(
        **form,
        answers=form_answers,
    )

    return result.model_dump()


# /api/forms/v2/submissions/<string:form_submission_id> [PATCH]
@api_form_submissions_v2.patch(
    "/<string:form_submission_id>", responses={200: FormSubmission}
)
def update_form(path: FormIdPath, body: UpdateFormRequestBody):
    """Update a previously submitted form (partial update of answers)."""
    form = _read_form_for_update(path.form_submission_id)
    if form is None:
        return abort(404, description=f"No form with id {path.form_submission_id}")

    payload = body.model_dump()

    existing_answers_by_id = {a.id: a for a in form.answers}

    for updated_ans in payload["answers"]:
        ans_id = updated_ans.get("id")

        # If answer doesn't already exist, return 404
        if ans_id not in existing_answers_by_id:
            return abort(
                404, description=f"Answer with id {ans_id} does not exist on this form."
            )

    answers_to_validate = [
        FormAnswerBase(
            question_id=existing_answers_by_id[updated_ans.id].question_id,
            answer=updated_ans.answer,
        )
        for updated_ans in body.answers
    ]
    validation = form_utils.validate_form_answers(
        answers_to_validate, form.form_template_id
    )

    if not validation.ok:
        return abort(validation.code, description=validation.msg)

    for updated_ans in payload["answers"]:
        # apply update
        existing_answer = existing_answers_by_id[updated_ans["id"]]

        existing_answer.answer = json.dumps(updated_ans["answer"])

    current_user = user_utils.get_current_user_from_jwt()
    user_id = int(current_user["id"])

    form.user_id = user_id
    form.last_edited = get_current_time()
    form.revision += 1

    crud.db_session.commit()
    crud.db_session.refresh(form)

    result = orm_serializer.marshal(form, shallow=True)
    return FormSubmission(**result).model_dump(), 200


def _read_form_for_update(submission_id: str):
    load_authorized_patient_resource(FormSubmissionOrmV2, submission_id)
    # PATCH and PUT serialize on the same row, including updates within one second
    form = (
        crud.db_session.query(FormSubmissionOrmV2)
        .filter_by(id=submission_id)
        .populate_existing()
        .with_for_update()
        .one_or_none()
    )
    if form is not None:
        # Authorization may have established an older REPEATABLE READ snapshot.
        answers = (
            crud.db_session.query(FormAnswerOrmV2)
            .filter_by(form_submission_id=submission_id)
            .populate_existing()
            .with_for_update()
            .all()
        )
        set_committed_value(form, "answers", answers)
    return form


@api_form_submissions_v2.put(
    "/<string:form_submission_id>", responses={200: FormSubmission}
)
def replace_form_answers(path: FormIdPath, body: ReplaceFormRequestBody):
    """Replace all answers only if the caller has the current revision."""
    form = _read_form_for_update(path.form_submission_id)
    if form is None:
        return abort(404, description="Form submission does not exist.")
    if form.archived or form.revision != body.expected_revision:
        return abort(409, description="Form changed. Reload it before updating.")

    validation = form_utils.validate_replacement_answers(form, body.answers)
    if not validation.ok:
        return abort(validation.code, description=validation.msg)

    existing_answers_by_question_id = {
        answer.question_id: answer for answer in form.answers
    }
    form_answers = []
    for answer in body.answers:
        existing_answer = existing_answers_by_question_id.get(answer.question_id)
        if existing_answer is None:
            existing_answer = FormAnswerOrmV2(question_id=answer.question_id)
        existing_answer.answer = json.dumps(answer.answer.model_dump())
        form_answers.append(existing_answer)
    # delete orphan removes omitted answers; retained answers keep their IDs
    form.answers = form_answers
    current_user = user_utils.get_current_user_from_jwt()
    form.user_id = int(current_user["id"])
    form.last_edited = get_current_time()
    form.revision += 1
    crud.db_session.commit()
    crud.db_session.refresh(form)
    result = orm_serializer.marshal(form, shallow=True)
    return FormSubmission(**result).model_dump(), 200
