import json

from humps import decamelize

import data.db_operations as crud
from common import commonUtil
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

        pretty_print(r.json())

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
