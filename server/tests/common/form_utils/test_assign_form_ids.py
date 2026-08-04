"""Unit tests for form_utils.assign_form_template_ids_v2 and assign_form_ids_v2."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from common.form_utils import assign_form_ids_v2, assign_form_template_ids_v2
from enums import QuestionTypeEnum
from validation.formsV2_models import (
    CreateFormSubmissionRequest,
    FormAnswer,
    FormClassification,
    FormTemplateUploadQuestion,
    FormTemplateUploadRequest,
    MCOption,
    TextAnswer,
)

EXISTING_CLASSIFICATION_ID = "classification-existing"
EXISTING_NAME_STRING_ID = "name-string-existing"
EXISTING_TEMPLATE_ID = "template-existing"
EXISTING_QUESTION_ID = "question-existing"
EXISTING_QUESTION_STRING_ID = "question-string-existing"
EXISTING_MC_OPTION_ID = "mc-option-existing"
EXISTING_SUBMISSION_ID = "submission-existing"
EXISTING_ANSWER_ID = "answer-existing"


def _uuid_sequence(*values: str):
    return patch(
        "common.form_utils.commonUtil.get_uuid",
        side_effect=list(values),
    )


def _make_upload_request(
    *,
    classification_id: str | None = None,
    name_string_id: str | None = None,
    template_id: str | None = None,
    include_mc_question: bool = True,
) -> FormTemplateUploadRequest:
    questions = [
        FormTemplateUploadQuestion(
            id=EXISTING_QUESTION_ID if template_id else None,
            question_type=QuestionTypeEnum.STRING,
            order=0,
            question_text={"English": "Patient name"},
            question_string_id=EXISTING_QUESTION_STRING_ID if template_id else None,
            required=True,
        )
    ]

    if include_mc_question:
        questions.append(
            FormTemplateUploadQuestion(
                question_type=QuestionTypeEnum.MULTIPLE_CHOICE,
                order=1,
                question_text={"English": "Blood type"},
                required=True,
                mc_options=[
                    MCOption(
                        string_id=EXISTING_MC_OPTION_ID if template_id else None,
                        translations={"English": "A"},
                    ),
                    MCOption(
                        translations={"English": "B"},
                    ),
                ],
            )
        )

    return FormTemplateUploadRequest(
        id=template_id,
        classification=FormClassification(
            id=classification_id,
            name={"English": "Patient Intake Form"},
            name_string_id=name_string_id,
        ),
        questions=questions,
    )


def _make_submission_request(
    *,
    submission_id: str | None = None,
    answer_id: str | None = None,
) -> CreateFormSubmissionRequest:
    return CreateFormSubmissionRequest(
        id=submission_id,
        form_template_id="template-1",
        patient_id="patient-1",
        user_id=1,
        answers=[
            FormAnswer(
                id=answer_id,
                question_id="question-1",
                answer=TextAnswer(text="Jane Doe"),
            ),
            FormAnswer(
                question_id="question-2",
                answer=TextAnswer(text="Follow-up"),
            ),
        ],
    )


def test_assign_form_template_ids_v2_assigns_missing_classification_ids():
    request = _make_upload_request(include_mc_question=False)

    with _uuid_sequence(
        "uuid-classification-id",
        "uuid-name-string-id",
        "uuid-template-id",
        "uuid-question-id",
        "uuid-question-string-id",
    ):
        assign_form_template_ids_v2(request)

    assert request.classification.id == "uuid-classification-id"
    assert request.classification.name_string_id == "uuid-name-string-id"
    assert request.id == "uuid-template-id"
    assert request.questions[0].id == "uuid-question-id"
    assert request.questions[0].form_template_id == "uuid-template-id"
    assert request.questions[0].question_string_id == "uuid-question-string-id"


def test_assign_form_template_ids_v2_preserves_existing_classification_ids():
    request = _make_upload_request(
        classification_id=EXISTING_CLASSIFICATION_ID,
        name_string_id=EXISTING_NAME_STRING_ID,
        include_mc_question=False,
    )

    with _uuid_sequence(
        "uuid-template-id",
        "uuid-question-id",
        "uuid-question-string-id",
    ):
        assign_form_template_ids_v2(request)

    assert request.classification.id == EXISTING_CLASSIFICATION_ID
    assert request.classification.name_string_id == EXISTING_NAME_STRING_ID


def test_assign_form_template_ids_v2_always_assigns_new_template_and_question_ids():
    request = _make_upload_request(
        template_id=EXISTING_TEMPLATE_ID,
        include_mc_question=False,
    )

    with _uuid_sequence(
        "uuid-classification-id",
        "uuid-name-string-id",
        "uuid-new-template-id",
        "uuid-new-question-id",
        "uuid-new-question-string-id",
    ):
        assign_form_template_ids_v2(request)

    assert request.id == "uuid-new-template-id"
    assert request.id != EXISTING_TEMPLATE_ID
    assert request.questions[0].id == "uuid-new-question-id"
    assert request.questions[0].id != EXISTING_QUESTION_ID
    assert request.questions[0].form_template_id == "uuid-new-template-id"


def test_assign_form_template_ids_v2_preserves_existing_question_string_id():
    request = _make_upload_request(
        template_id=EXISTING_TEMPLATE_ID,
        include_mc_question=False,
    )
    request.questions[0].question_string_id = EXISTING_QUESTION_STRING_ID

    with _uuid_sequence(
        "uuid-classification-id",
        "uuid-name-string-id",
        "uuid-template-id",
        "uuid-question-id",
    ):
        assign_form_template_ids_v2(request)

    assert request.questions[0].question_string_id == EXISTING_QUESTION_STRING_ID


def test_assign_form_template_ids_v2_assigns_mc_option_string_ids():
    request = _make_upload_request(include_mc_question=True)

    with _uuid_sequence(
        "uuid-classification-id",
        "uuid-name-string-id",
        "uuid-template-id",
        "uuid-string-question-id",
        "uuid-string-question-string-id",
        "uuid-mc-question-id",
        "uuid-mc-question-string-id",
        "uuid-mc-option-a",
        "uuid-mc-option-b",
    ):
        assign_form_template_ids_v2(request)

    mc_question = request.questions[1]
    assert mc_question.mc_options is not None
    assert mc_question.mc_options[0].string_id == "uuid-mc-option-a"
    assert mc_question.mc_options[1].string_id == "uuid-mc-option-b"


def test_assign_form_template_ids_v2_preserves_existing_mc_option_string_id():
    request = _make_upload_request(template_id=EXISTING_TEMPLATE_ID, include_mc_question=True)

    with _uuid_sequence(
        "uuid-classification-id",
        "uuid-name-string-id",
        "uuid-template-id",
        "uuid-string-question-id",
        "uuid-mc-question-id",
        "uuid-mc-question-string-id",
        "uuid-mc-option-b",
    ):
        assign_form_template_ids_v2(request)

    mc_question = request.questions[1]
    assert mc_question.mc_options is not None
    assert mc_question.mc_options[0].string_id == EXISTING_MC_OPTION_ID
    assert mc_question.mc_options[1].string_id == "uuid-mc-option-b"


def test_assign_form_template_ids_v2_raises_when_classification_missing():
    request = FormTemplateUploadRequest.model_construct(
        classification=None,
        questions=[],
    )

    with pytest.raises(ValueError, match="Classification is required"):
        assign_form_template_ids_v2(request)


def test_assign_form_ids_v2_assigns_missing_submission_and_answer_ids():
    submission = _make_submission_request()

    with _uuid_sequence("uuid-submission-id", "uuid-answer-1", "uuid-answer-2"):
        assign_form_ids_v2(submission)

    assert submission.id == "uuid-submission-id"
    assert submission.answers[0].id == "uuid-answer-1"
    assert submission.answers[0].form_submission_id == "uuid-submission-id"
    assert submission.answers[1].id == "uuid-answer-2"
    assert submission.answers[1].form_submission_id == "uuid-submission-id"


def test_assign_form_ids_v2_preserves_existing_submission_id():
    submission = _make_submission_request(submission_id=EXISTING_SUBMISSION_ID)

    with _uuid_sequence("uuid-answer-1", "uuid-answer-2"):
        assign_form_ids_v2(submission)

    assert submission.id == EXISTING_SUBMISSION_ID
    assert submission.answers[0].form_submission_id == EXISTING_SUBMISSION_ID
    assert submission.answers[1].form_submission_id == EXISTING_SUBMISSION_ID


def test_assign_form_ids_v2_preserves_existing_answer_ids():
    submission = _make_submission_request(
        submission_id=EXISTING_SUBMISSION_ID,
        answer_id=EXISTING_ANSWER_ID,
    )

    with _uuid_sequence("uuid-answer-2"):
        assign_form_ids_v2(submission)

    assert submission.answers[0].id == EXISTING_ANSWER_ID
    assert submission.answers[1].id == "uuid-answer-2"
    assert submission.answers[0].form_submission_id == EXISTING_SUBMISSION_ID
