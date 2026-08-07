import json

from humps import decamelize

import data.db_operations as crud
from common import commonUtil
from common.commonUtil import get_uuid
from enums import QuestionTypeEnum
from models import FormSubmissionOrmV2


def _question_by_order(template, order):
    return next(question for question in template.questions if question.order == order)


def test_submit_missing_patient(api_post, form_submission_v2, form_v2_resources):
    bundle = form_v2_resources.create_template()
    template = bundle["template"]

    submission_payload = form_submission_v2(
        template_id=bundle["body"]["id"],
        template_question_id=template.questions[1].id,
    )
    submission_payload["patient_id"] = "nonexistent-patient-id"

    response = api_post("/api/forms/v2/submissions", json=submission_payload)
    assert response.status_code == 404
    assert response.json()["description"] == "Patient does not exist."


def test_submit_missing_template(create_patient, api_post, form_submission_v2):
    create_patient()

    submission_payload = form_submission_v2(
        template_id="nonexistent-template-id",
        template_question_id="nonexistent-question-id",
    )

    response = api_post("/api/forms/v2/submissions", json=submission_payload)
    assert response.status_code == 404
    assert response.json()["description"] == "Form template does not exist."


def test_submit_duplicate_submission_id(
    create_patient,
    api_post,
    form_submission_v2,
    form_v2_resources,
):
    create_patient()
    submission_id = get_uuid()

    bundle = form_v2_resources.create_template()
    template = bundle["template"]
    submission_payload = form_submission_v2(
        template_id=bundle["body"]["id"],
        template_question_id=template.questions[1].id,
    )
    submission_payload["id"] = submission_id

    first_response = api_post("/api/forms/v2/submissions", json=submission_payload)
    assert first_response.status_code == 201
    form_v2_resources.track_submission(submission_id)

    duplicate_response = api_post("/api/forms/v2/submissions", json=submission_payload)
    assert duplicate_response.status_code == 409
    assert duplicate_response.json()["description"] == "Form submission already exists."


def test_patch_answer_not_on_submission(
    create_patient,
    api_post,
    api_patch,
    form_v2_resources,
):
    create_patient()
    bundle = form_v2_resources.create_template()
    template = bundle["template"]
    submission = form_v2_resources.create_submission(bundle)
    submission_id = submission["id"]

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


def test_patch_mc_invalid_index(
    create_patient,
    api_post,
    api_patch,
    form_v2_resources,
):
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

    create_patient()
    bundle = form_v2_resources.create_template(extra_questions=[mc_question])
    template = bundle["template"]
    mc_question_orm = _question_by_order(template, 2)

    submission = form_v2_resources.create_submission(
        bundle,
        extra_answers=[
            {
                "question_id": mc_question_orm.id,
                "answer": {"mc_id_array": [0]},
            }
        ],
    )
    submission_id = submission["id"]

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


def test_patch_string_too_long(
    create_patient,
    api_post,
    api_patch,
    form_v2_resources,
):
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

    create_patient()
    bundle = form_v2_resources.create_template(extra_questions=[name_question])
    template = bundle["template"]
    name_question_orm = _question_by_order(template, 2)

    submission = form_v2_resources.create_submission(
        bundle,
        extra_answers=[
            {
                "question_id": name_question_orm.id,
                "answer": {"text": "Valid name"},
            }
        ],
    )
    submission_id = submission["id"]

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
    assert (
        "exceeds the max length of 10 characters"
        in patch_response.json()["description"]
    )


def test_get_submission_resolves_mc_labels(
    create_patient,
    api_get,
    form_v2_resources,
):
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

    create_patient()
    bundle = form_v2_resources.create_template(extra_questions=[mc_question])
    template = bundle["template"]
    mc_question_orm = _question_by_order(template, 2)

    submission = form_v2_resources.create_submission(
        bundle,
        extra_answers=[
            {
                "question_id": mc_question_orm.id,
                "answer": {"mc_id_array": [0]},
            }
        ],
    )

    get_response = api_get(f"/api/forms/v2/submissions/{submission['id']}")
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


def test_create_form_submission_v2(
    create_patient,
    patient_id,
    form_v2_resources,
):
    create_patient()

    bundle = form_v2_resources.create_template()
    submission = form_v2_resources.create_submission(bundle)

    assert submission["patient_id"] == patient_id
    assert submission["form_template_id"] == bundle["body"]["id"]

    submission_obj = crud.read(FormSubmissionOrmV2, id=submission["id"])
    assert submission_obj.answers[0].form_submission_id == submission["id"]
    actual = json.loads(submission_obj.answers[0].answer)
    assert actual["number"] == 90


def test_get_form_submission_v2(create_patient, api_get, form_v2_resources):
    create_patient()

    bundle = form_v2_resources.create_template()
    submission = form_v2_resources.create_submission(bundle)
    submission_id = submission["id"]

    response = api_get(f"/api/forms/v2/submissions/{submission_id}")
    assert response.status_code == 200

    body = decamelize(response.json())
    assert body["id"] == submission_id
    assert len(body["answers"]) == 1
    assert body["answers"][0]["answer"]["number"] == 90


def test_update_form_submission_v2(
    database,
    create_patient,
    api_patch,
    form_v2_resources,
):
    create_patient()

    bundle = form_v2_resources.create_template()
    template = bundle["template"]
    integer_question = _question_by_order(template, 1)
    submission = form_v2_resources.create_submission(
        bundle,
        template_question_id=integer_question.id,
    )
    submission_id = submission["id"]

    submission_obj = crud.read(FormSubmissionOrmV2, id=submission_id)
    answer_id = submission_obj.answers[0].id

    patch_payload = {
        "answers": [
            {
                "id": answer_id,
                "answer": {"number": 22},
                "question_id": integer_question.id,
            }
        ]
    }

    response = api_patch(
        f"/api/forms/v2/submissions/{submission_id}",
        json=patch_payload,
    )
    assert response.status_code == 200
    database.session.commit()

    submission_obj = crud.read(FormSubmissionOrmV2, id=submission_id)
    assert submission_obj.answers[0].form_submission_id == submission_id
    actual = json.loads(submission_obj.answers[0].answer)
    assert actual["number"] == 22


def test_invalid_form_answers_v2(
    create_patient,
    api_post,
    form_submission_v2,
    form_v2_resources,
):
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

    create_patient()
    bundle = form_v2_resources.create_template(extra_questions=[name_ques, date_ques])
    template = bundle["template"]
    name_ques_order = _question_by_order(template, 2)
    date_ques_order = _question_by_order(template, 3)

    required_ans = {
        "question_id": name_ques_order.id,
        "answer": {"text": "Some name"},
    }
    date_ans = {
        "question_id": date_ques_order.id,
        "answer": {"date": str(commonUtil.get_future_date(days_after=10))},
    }

    submission_payload = form_submission_v2(
        template_id=bundle["body"]["id"],
        template_question_id=template.questions[1].id,
        extra_answers=[required_ans, date_ans],
    )
    submission_payload["answers"][0]["answer"] = {"number": 500}

    response = api_post("/api/forms/v2/submissions", json=submission_payload)
    assert response.status_code == 422
    assert (
        response.json()["description"]
        == "Answer 500.0 is above the maximum required: 300.0"
    )

    submission_payload["answers"][0]["answer"] = {"number": 90}
    submission_payload["answers"] = [
        answer
        for answer in submission_payload["answers"]
        if answer["question_id"] != name_ques_order.id
    ]

    response = api_post("/api/forms/v2/submissions", json=submission_payload)
    assert response.status_code == 422
    assert (
        response.json()["description"]
        == f"Missing answer for required question: {name_ques_order.id}"
    )

    date_ans["answer"] = {"date": str(commonUtil.get_past_date(days_before=10))}
    submission_payload = form_submission_v2(
        template_id=bundle["body"]["id"],
        template_question_id=template.questions[1].id,
        extra_answers=[required_ans, date_ans],
    )

    response = api_post("/api/forms/v2/submissions", json=submission_payload)
    assert response.status_code == 422
    assert response.json()["description"] == "Past dates are not allowed"
