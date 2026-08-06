import json

from humps import decamelize

import data.db_operations as crud
from common import commonUtil
from common.commonUtil import get_uuid
from common.print_utils import pretty_print
from enums import QuestionTypeEnum
from models import (
    FormAnswerOrmV2,
    FormClassificationOrmV2,
    FormQuestionTemplateOrmV2,
    FormSubmissionOrmV2,
    FormTemplateOrmV2,
    LangVersionOrmV2,
)

# TODO: Refactor to use fixtures for setup/teardown
#   Create fixtures to handle:
#   - form_classification_v2_with_db: Create/cleanup classifications + lang versions
#   - form_template_v2_with_db: Create/cleanup templates (depends on classification fixture)
#   - form_submission_v2_with_db: Create/cleanup submissions (depends on template fixture)
#   This would eliminate manual cleanup code and make tests more composable.

#   Note: clean-up fails when a test fails, which interferes with test isolation and can cause cascading failures.
#   Fixtures with proper teardown would resolve this issue.


def _clean_up(
    created_template_ids=None,
    created_classification_ids=None,
    created_lang_versions=None,
    created_submission_ids=None,
):
    for sid in created_submission_ids or []:
        crud.delete_all(FormAnswerOrmV2, form_submission_id=sid)
        crud.delete_all(FormSubmissionOrmV2, id=sid)

    for tid in created_template_ids or []:
        crud.delete_all(FormQuestionTemplateOrmV2, form_template_id=tid)
        crud.delete_all(FormTemplateOrmV2, id=tid)

    for cid in created_classification_ids or []:
        crud.delete_all(FormClassificationOrmV2, id=cid)

    for lvid in created_lang_versions or []:
        crud.delete_all(LangVersionOrmV2, string_id=lvid)


def _setup_v2_template(database, api_post, form_template_v2_payload, **payload_kwargs):
    payload = form_template_v2_payload(**payload_kwargs)
    response = api_post("/api/forms/v2/templates/body", json=payload)
    assert response.status_code == 201

    database.session.flush()
    database.session.commit()

    body = decamelize(response.json())
    classification = crud.read(
        FormClassificationOrmV2, id=body["form_classification_id"]
    )
    template = crud.read(FormTemplateOrmV2, id=body["id"])

    lang_ids = [classification.name_string_id]
    for question in template.questions:
        lang_ids.append(question.question_string_id)

    return body, template, lang_ids


def test_submit_missing_patient(
    database, api_post, form_template_v2_payload, form_submission_v2
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []

    try:
        body, template, lang_ids = _setup_v2_template(
            database, api_post, form_template_v2_payload
        )
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(lang_ids)

        submission_payload = form_submission_v2(
            template_id=body["id"],
            template_question_id=template.questions[1].id,
        )
        submission_payload["patient_id"] = "nonexistent-patient-id"

        response = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert response.status_code == 404
        assert response.json()["description"] == "Patient does not exist."

    finally:
        _clean_up(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
        )


def test_submit_missing_template(
    database,
    create_patient,
    api_post,
    form_submission_v2,
):
    create_patient()

    submission_payload = form_submission_v2(
        template_id="nonexistent-template-id",
        template_question_id="nonexistent-question-id",
    )

    response = api_post("/api/forms/v2/submissions", json=submission_payload)
    assert response.status_code == 404
    assert response.json()["description"] == "Form template does not exist."


def test_submit_duplicate_submission_id(
    database,
    create_patient,
    api_post,
    form_template_v2_payload,
    form_submission_v2,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []
    submission_id = get_uuid()

    try:
        create_patient()

        body, template, lang_ids = _setup_v2_template(
            database, api_post, form_template_v2_payload
        )
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(lang_ids)

        submission_payload = form_submission_v2(
            template_id=body["id"],
            template_question_id=template.questions[1].id,
        )
        submission_payload["id"] = submission_id

        first_response = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert first_response.status_code == 201
        database.session.commit()
        created_submission_ids.append(submission_id)

        duplicate_response = api_post(
            "/api/forms/v2/submissions", json=submission_payload
        )
        assert duplicate_response.status_code == 409
        assert duplicate_response.json()["description"] == "Form submission already exists."

    finally:
        _clean_up(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
            created_submission_ids=created_submission_ids,
        )


def test_patch_answer_not_on_submission(
    database,
    create_patient,
    api_post,
    api_patch,
    form_template_v2_payload,
    form_submission_v2,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    try:
        create_patient()

        body, template, lang_ids = _setup_v2_template(
            database, api_post, form_template_v2_payload
        )
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(lang_ids)

        submission_payload = form_submission_v2(
            template_id=body["id"],
            template_question_id=template.questions[1].id,
        )
        response = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert response.status_code == 201
        database.session.commit()

        submission = decamelize(response.json())
        submission_id = submission["id"]
        created_submission_ids.append(submission_id)

        foreign_answer_id = get_uuid()
        patch_payload = {
            "answers": [
                {
                    "id": foreign_answer_id,
                    "question_id": template.questions[1].id,
                    "answer": {"number": 22},
                }
            ]
        }

        patch_response = api_patch(
            f"/api/forms/v2/submissions/{submission_id}",
            json=patch_payload,
        )
        assert patch_response.status_code == 404
        assert (
            patch_response.json()["description"]
            == f"Answer with id {foreign_answer_id} does not exist on this form."
        )

    finally:
        _clean_up(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
            created_submission_ids=created_submission_ids,
        )


def test_patch_mc_invalid_index(
    database,
    create_patient,
    api_post,
    api_patch,
    form_template_v2_payload,
    form_submission_v2,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    mc_question = {
        "question_type": QuestionTypeEnum.MULTIPLE_CHOICE.value,
        "order": 2,
        "required": True,
        "question_text": {"english": "Blood type"},
        "category_index": 0,
        "user_question_id": "blood_type",
        "mc_options": [
            {"translations": {"english": "A"}},
            {"translations": {"english": "B"}},
        ],
    }

    try:
        create_patient()

        body, template, lang_ids = _setup_v2_template(
            database,
            api_post,
            form_template_v2_payload,
            extra_questions=[mc_question],
        )
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(lang_ids)

        integer_question = next(q for q in template.questions if q.order == 1)
        mc_question_orm = next(q for q in template.questions if q.order == 2)

        submission_payload = form_submission_v2(
            template_id=body["id"],
            template_question_id=integer_question.id,
            extra_answers=[
                {
                    "question_id": mc_question_orm.id,
                    "answer": {"mc_id_array": [0]},
                }
            ],
        )
        response = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert response.status_code == 201
        database.session.commit()

        submission = decamelize(response.json())
        submission_id = submission["id"]
        created_submission_ids.append(submission_id)

        submission_obj = crud.read(FormSubmissionOrmV2, id=submission_id)
        mc_answer_id = next(
            answer.id
            for answer in submission_obj.answers
            if answer.question_id == mc_question_orm.id
        )

        patch_payload = {
            "answers": [
                {
                    "id": mc_answer_id,
                    "question_id": mc_question_orm.id,
                    "answer": {"mc_id_array": [99]},
                }
            ]
        }

        patch_response = api_patch(
            f"/api/forms/v2/submissions/{submission_id}",
            json=patch_payload,
        )
        assert patch_response.status_code == 422
        assert "Selected option 99 is invalid" in patch_response.json()["description"]

    finally:
        _clean_up(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
            created_submission_ids=created_submission_ids,
        )


def test_patch_string_too_long(
    database,
    create_patient,
    api_post,
    api_patch,
    form_template_v2_payload,
    form_submission_v2,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    name_question = {
        "question_type": QuestionTypeEnum.STRING.value,
        "order": 2,
        "required": True,
        "question_text": {"english": "What is your name?"},
        "string_max_length": 10,
        "category_index": 0,
        "user_question_id": "patient_name",
        "mc_options": [],
    }

    try:
        create_patient()

        body, template, lang_ids = _setup_v2_template(
            database,
            api_post,
            form_template_v2_payload,
            extra_questions=[name_question],
        )
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(lang_ids)

        integer_question = next(q for q in template.questions if q.order == 1)
        name_question_orm = next(q for q in template.questions if q.order == 2)

        submission_payload = form_submission_v2(
            template_id=body["id"],
            template_question_id=integer_question.id,
            extra_answers=[
                {
                    "question_id": name_question_orm.id,
                    "answer": {"text": "Valid name"},
                }
            ],
        )
        response = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert response.status_code == 201
        database.session.commit()

        submission = decamelize(response.json())
        submission_id = submission["id"]
        created_submission_ids.append(submission_id)

        submission_obj = crud.read(FormSubmissionOrmV2, id=submission_id)
        name_answer_id = next(
            answer.id
            for answer in submission_obj.answers
            if answer.question_id == name_question_orm.id
        )

        patch_payload = {
            "answers": [
                {
                    "id": name_answer_id,
                    "question_id": name_question_orm.id,
                    "answer": {"text": "this name is definitely too long"},
                }
            ]
        }

        patch_response = api_patch(
            f"/api/forms/v2/submissions/{submission_id}",
            json=patch_payload,
        )
        assert patch_response.status_code == 422
        assert "exceeds the max length of 10 characters" in patch_response.json()["description"]

    finally:
        _clean_up(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
            created_submission_ids=created_submission_ids,
        )


def test_get_submission_resolves_mc_labels(
    database,
    create_patient,
    api_post,
    api_get,
    form_template_v2_payload,
    form_submission_v2,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    mc_question = {
        "question_type": QuestionTypeEnum.MULTIPLE_CHOICE.value,
        "order": 2,
        "required": True,
        "question_text": {"english": "Blood type"},
        "category_index": 0,
        "user_question_id": "blood_type",
        "mc_options": [
            {"translations": {"english": "A"}},
            {"translations": {"english": "B"}},
        ],
    }

    try:
        create_patient()

        body, template, lang_ids = _setup_v2_template(
            database,
            api_post,
            form_template_v2_payload,
            extra_questions=[mc_question],
        )
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])
        created_lang_versions.extend(lang_ids)

        integer_question = next(q for q in template.questions if q.order == 1)
        mc_question_orm = next(q for q in template.questions if q.order == 2)

        submission_payload = form_submission_v2(
            template_id=body["id"],
            template_question_id=integer_question.id,
            extra_answers=[
                {
                    "question_id": mc_question_orm.id,
                    "answer": {"mc_id_array": [0]},
                }
            ],
        )
        response = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert response.status_code == 201
        database.session.commit()

        submission = decamelize(response.json())
        submission_id = submission["id"]
        created_submission_ids.append(submission_id)

        get_response = api_get(f"/api/forms/v2/submissions/{submission_id}")
        assert get_response.status_code == 200

        submission_body = decamelize(get_response.json())
        mc_answer = next(
            answer
            for answer in submission_body["answers"]
            if answer["question_id"] == mc_question_orm.id
        )
        assert mc_answer["mc_options"] == ["A", "B"]
        assert mc_answer["question_text"] == "Blood type"
        assert mc_answer["answer"]["mc_id_array"] == [0]

    finally:
        _clean_up(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
            created_submission_ids=created_submission_ids,
        )


def test_create_form_submission_v2(
    database,
    create_patient,
    api_post,
    form_template_v2_payload,
    patient_id,
    form_submission_v2,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    try:
        create_patient()

        # Create template
        payload = form_template_v2_payload()
        r = api_post("/api/forms/v2/templates/body", json=payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        classification = crud.read(
            FormClassificationOrmV2, id=body["form_classification_id"]
        )
        template = crud.read(FormTemplateOrmV2, id=body["id"])

        created_lang_versions.append(classification.name_string_id)
        for ques in template.questions:
            created_lang_versions.append(ques.question_string_id)

        # Create Submission
        submission_payload = form_submission_v2(
            template_id=body["id"], template_question_id=template.questions[1].id
        )

        r = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        submission = decamelize(r.json())
        created_submission_ids.append(submission["id"])

        # Validate
        assert submission["patient_id"] == patient_id
        assert submission["form_template_id"] == body["id"]

        submission_obj = crud.read(FormSubmissionOrmV2, id=submission["id"])

        assert submission_obj.answers[0].form_submission_id == submission["id"]
        actual = json.loads(submission_obj.answers[0].answer)
        assert actual["number"] == 90

    finally:
        _clean_up(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
            created_submission_ids=created_submission_ids,
        )


def test_get_form_submission_v2(
    database,
    create_patient,
    api_post,
    api_get,
    form_template_v2_payload,
    form_submission_v2,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    try:
        create_patient()

        # Create template
        payload = form_template_v2_payload()
        r = api_post("/api/forms/v2/templates/body", json=payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        classification = crud.read(
            FormClassificationOrmV2, id=body["form_classification_id"]
        )
        template = crud.read(FormTemplateOrmV2, id=body["id"])

        created_lang_versions.append(classification.name_string_id)
        for ques in template.questions:
            created_lang_versions.append(ques.question_string_id)

        # Create Submission
        submission_payload = form_submission_v2(
            template_id=body["id"], template_question_id=template.questions[1].id
        )

        r = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert r.status_code == 201

        submission = decamelize(r.json())
        submission_id = submission["id"]
        created_submission_ids.append(submission_id)

        # Get submission
        r = api_get(f"/api/forms/v2/submissions/{submission_id}")
        assert r.status_code == 200

        body = decamelize(r.json())
        pretty_print(body)

        assert body["id"] == submission_id
        assert len(body["answers"]) == 1
        actual = body["answers"][0]
        assert actual["answer"]["number"] == 90

    finally:
        _clean_up(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
            created_submission_ids=created_submission_ids,
        )


def test_update_form_submission_v2(
    database,
    create_patient,
    api_post,
    api_patch,
    form_template_v2_payload,
    form_submission_v2,
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    try:
        create_patient()

        # Create template
        payload = form_template_v2_payload()
        r = api_post("/api/forms/v2/templates/body", json=payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        classification = crud.read(
            FormClassificationOrmV2, id=body["form_classification_id"]
        )
        template = crud.read(FormTemplateOrmV2, id=body["id"])

        created_lang_versions.append(classification.name_string_id)
        for ques in template.questions:
            created_lang_versions.append(ques.question_string_id)

        # Create Submission
        submission_payload = form_submission_v2(
            template_id=body["id"], template_question_id=template.questions[1].id
        )

        r = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        submission = decamelize(r.json())
        submission_id = submission["id"]
        submission_obj = crud.read(FormSubmissionOrmV2, id=submission["id"])
        answer_id = submission_obj.answers[0].id
        created_submission_ids.append(submission_id)

        # Patch update answer
        patch_payload = {
            "answers": [
                {
                    "id": answer_id,
                    "answer": {"number": 22},
                    "question_id": template.questions[1].id,
                }
            ]
        }

        r = api_patch(
            f"/api/forms/v2/submissions/{submission_id}",
            json=patch_payload,
        )
        assert r.status_code == 200

        database.session.flush()
        database.session.commit()

        submission_obj = crud.read(FormSubmissionOrmV2, id=submission["id"])

        assert submission_obj.answers[0].form_submission_id == submission["id"]
        actual = json.loads(submission_obj.answers[0].answer)
        assert actual["number"] == 22

    finally:
        _clean_up(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
            created_submission_ids=created_submission_ids,
        )


def test_invalid_form_answers_v2(
    database, create_patient, api_post, form_template_v2_payload, form_submission_v2
):
    created_template_ids = []
    created_classification_ids = []
    created_lang_versions = []
    created_submission_ids = []

    try:
        create_patient()

        # Create template with additional questions to test validation logic
        name_ques = {
            "question_type": QuestionTypeEnum.STRING.value,
            "order": 2,
            "required": True,
            "question_text": {"english": "What is your name?"},
            "category_index": 0,
            "user_question_id": "patient_name",
            "mc_options": [],
        }
        date_ques = {
            "question_type": QuestionTypeEnum.DATE.value,
            "order": 3,
            "required": False,
            "question_text": {"english": "When is your due date?"},
            "allow_past_dates": False,
            "allow_future_dates": True,
            "category_index": 0,
            "user_question_id": "patient_due_date",
            "mc_options": [],
        }

        payload = form_template_v2_payload(extra_questions=[name_ques, date_ques])
        r = api_post("/api/forms/v2/templates/body", json=payload)
        assert r.status_code == 201

        database.session.flush()
        database.session.commit()

        body = decamelize(r.json())
        created_template_ids.append(body["id"])
        created_classification_ids.append(body["form_classification_id"])

        classification = crud.read(
            FormClassificationOrmV2, id=body["form_classification_id"]
        )
        template = crud.read(FormTemplateOrmV2, id=body["id"])

        created_lang_versions.append(classification.name_string_id)
        for ques in template.questions:
            created_lang_versions.append(ques.question_string_id)

        # Create Submission
        name_ques_order = next(q for q in template.questions if q.order == 2)
        date_ques_order = next(q for q in template.questions if q.order == 3)

        required_ans = {
            "question_id": name_ques_order.id,
            "answer": {"text": "Some name"},
        }
        date_ans = {
            "question_id": date_ques_order.id,
            "answer": {"date": str(commonUtil.get_future_date(days_after=10))},
        }

        submission_payload = form_submission_v2(
            template_id=body["id"],
            template_question_id=template.questions[1].id,
            extra_answers=[required_ans, date_ans],
        )
        submission_payload["answers"][0]["answer"] = {
            "number": 500
        }  # value greater than max specified (300)

        r = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert r.status_code == 422
        assert (
            r.json()["description"]
            == "Answer 500.0 is above the maximum required: 300.0"
        )

        submission_payload["answers"][0]["answer"] = {"number": 90}
        submission_payload["answers"] = [
            ans
            for ans in submission_payload["answers"]
            if ans["question_id"] != name_ques_order.id
        ]

        r = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert r.status_code == 422
        assert (
            r.json()["description"]
            == f"Missing answer for required question: {name_ques_order.id}"
        )

        date_ans["answer"] = {"date": str(commonUtil.get_past_date(days_before=10))}
        submission_payload = form_submission_v2(
            template_id=body["id"],
            template_question_id=template.questions[1].id,
            extra_answers=[required_ans, date_ans],
        )

        r = api_post("/api/forms/v2/submissions", json=submission_payload)
        assert r.status_code == 422
        assert r.json()["description"] == "Past dates are not allowed"

    finally:
        _clean_up(
            created_template_ids=created_template_ids,
            created_classification_ids=created_classification_ids,
            created_lang_versions=created_lang_versions,
            created_submission_ids=created_submission_ids,
        )
