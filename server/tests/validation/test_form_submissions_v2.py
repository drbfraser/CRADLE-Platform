import pytest
from pydantic import ValidationError

from enums import QuestionTypeEnum
from validation.formsV2_models import (
    CreateFormSubmissionRequest,
    FormAnswer,
    FormSubmission,
    FormSubmissionWithAnswers,
    UpdateFormRequestBody,
)

VALID_SUBMISSION_ID = "submission-123"
VALID_TEMPLATE_ID = "template-456"
VALID_PATIENT_ID = "patient-789"
VALID_USER_ID = 42
VALID_TIMESTAMP = 1609459200
VALID_LANG = "English"

# Valid FormSubmission
valid_form_submission = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP + 100,
    "lang": VALID_LANG,
}

valid_form_submission_same_timestamps = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP,  # Same as date_submitted
    "lang": VALID_LANG,
}

# Missing required fields
submission_missing_id = {
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP,
    "lang": VALID_LANG,
}

submission_missing_template_id = {
    "id": VALID_SUBMISSION_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP,
    "lang": VALID_LANG,
}

submission_missing_patient_id = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP,
    "lang": VALID_LANG,
}

submission_missing_user_id = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP,
    "lang": VALID_LANG,
}

submission_missing_date_submitted = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "last_edited": VALID_TIMESTAMP,
    "lang": VALID_LANG,
}

submission_missing_last_edited = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "lang": VALID_LANG,
}

submission_missing_lang = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP,
}

# Wrong types
submission_id_wrong_type = {
    "id": 123,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP,
    "lang": VALID_LANG,
}

submission_template_id_wrong_type = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": 456,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP,
    "lang": VALID_LANG,
}

submission_date_submitted_wrong_type = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": "2025-01-01",
    "last_edited": VALID_TIMESTAMP,
    "lang": VALID_LANG,
}

submission_last_edited_wrong_type = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": "2025-01-01",
    "lang": VALID_LANG,
}

submission_lang_wrong_type = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP,
    "lang": 123,
}

# Invalid date sequence (last_edited before date_submitted)
submission_invalid_date_sequence = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP - 100,  # Before submission date
    "lang": VALID_LANG,
}

# Extra field
submission_with_extra_field = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "date_submitted": VALID_TIMESTAMP,
    "last_edited": VALID_TIMESTAMP,
    "lang": VALID_LANG,
    "extra_field": "invalid",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        # Valid cases
        (valid_form_submission, None),
        (valid_form_submission_same_timestamps, None),
        # Missing required fields
        (submission_missing_id, ValidationError),
        (submission_missing_template_id, ValidationError),
        (submission_missing_patient_id, ValidationError),
        (submission_missing_user_id, ValidationError),
        (submission_missing_date_submitted, ValidationError),
        (submission_missing_last_edited, ValidationError),
        (submission_missing_lang, ValidationError),
        # Wrong types
        (submission_id_wrong_type, ValidationError),
        (submission_template_id_wrong_type, ValidationError),
        (submission_date_submitted_wrong_type, ValidationError),
        (submission_last_edited_wrong_type, ValidationError),
        (submission_lang_wrong_type, ValidationError),
        # Invalid date sequence
        (submission_invalid_date_sequence, ValidationError),
        # Extra field
        (submission_with_extra_field, ValidationError),
    ],
)
def test_form_submission_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormSubmission(**json)
    else:
        try:
            FormSubmission(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e


# FormAnswer tests
VALID_QUESTION_ID = "question-123"
VALID_ANSWER_ID = "answer-123"

valid_number_answer = {
    "id": VALID_ANSWER_ID,
    "question_id": VALID_QUESTION_ID,
    "form_submission_id": VALID_SUBMISSION_ID,
    "answer": {"number": 75.5},
}

valid_number_answer_no_id = {
    "question_id": VALID_QUESTION_ID,
    "form_submission_id": VALID_SUBMISSION_ID,
    "answer": {"number": 75.5},
}

valid_text_answer = {
    "question_id": VALID_QUESTION_ID,
    "answer": {"text": "Patient feels well"},
}

valid_mc_answer = {
    "question_id": VALID_QUESTION_ID,
    "answer": {"mc_id_array": [0, 2, 5]},
}

valid_date_answer = {
    "question_id": VALID_QUESTION_ID,
    "answer": {"date": "2025-10-30"},
}

valid_number_answer_with_comment = {
    "question_id": VALID_QUESTION_ID,
    "answer": {"number": 120, "comment": "Patient has hypertension"},
}

valid_text_answer_with_comment = {
    "question_id": VALID_QUESTION_ID,
    "answer": {"text": "Other symptoms", "comment": "Occasional headaches"},
}

valid_mc_answer_with_comment = {
    "question_id": VALID_QUESTION_ID,
    "answer": {"mc_id_array": [3], "comment": "Since childhood"},
}

valid_date_answer_with_comment = {
    "question_id": VALID_QUESTION_ID,
    "answer": {"date": "2025-01-15", "comment": "Approximate date"},
}

# Missing required fields
answer_missing_question_id = {
    "answer": {"number": 75},
}

answer_missing_answer = {
    "question_id": VALID_QUESTION_ID,
}

# Wrong types
answer_question_id_wrong_type = {
    "question_id": 123,
    "answer": {"number": 75},
}

answer_wrong_answer_type = {
    "question_id": VALID_QUESTION_ID,
    "answer": "not-a-dict",
}

# Extra field
answer_with_extra_field = {
    "question_id": VALID_QUESTION_ID,
    "answer": {"number": 75},
    "extra_field": "invalid",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        # Valid cases
        (valid_number_answer, None),
        (valid_number_answer_no_id, None),
        (valid_text_answer, None),
        (valid_mc_answer, None),
        (valid_date_answer, None),
        (valid_number_answer_with_comment, None),
        (valid_text_answer_with_comment, None),
        (valid_mc_answer_with_comment, None),
        (valid_date_answer_with_comment, None),
        # Missing required fields
        (answer_missing_question_id, ValidationError),
        (answer_missing_answer, ValidationError),
        # Wrong types
        (answer_question_id_wrong_type, ValidationError),
        (answer_wrong_answer_type, ValidationError),
        # Extra field
        (answer_with_extra_field, ValidationError),
    ],
)
def test_form_answer_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormAnswer(**json)
    else:
        try:
            FormAnswer(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e


valid_create_request = {
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "lang": "English",
    "answers": [
        {"question_id": "q1", "answer": {"number": 75}},
        {"question_id": "q2", "answer": {"text": "Good"}},
    ],
}

valid_create_request_with_id = {
    "id": VALID_SUBMISSION_ID,
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "lang": "French",
    "answers": [
        {"question_id": "q1", "answer": {"number": 75}},
    ],
}

create_request_missing_template_id = {
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "answers": [{"question_id": "q1", "answer": {"number": 75}}],
}

create_request_missing_answers = {
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
}

create_request_empty_answers = {
    "form_template_id": VALID_TEMPLATE_ID,
    "patient_id": VALID_PATIENT_ID,
    "user_id": VALID_USER_ID,
    "answers": [],
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        # Valid cases
        (valid_create_request, None),
        (valid_create_request_with_id, None),
        (create_request_empty_answers, None),  # Empty answers is valid
        # Missing required fields
        (create_request_missing_template_id, ValidationError),
        (create_request_missing_answers, ValidationError),
    ],
)
def test_create_form_submission_request_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            CreateFormSubmissionRequest(**json)
    else:
        try:
            CreateFormSubmissionRequest(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e


valid_update_request = {
    "answers": [
        {"id": "ans-1", "question_id": "q1", "answer": {"number": 80}},
        {"id": "ans-2", "question_id": "q2", "answer": {"text": "Updated"}},
    ],
}

valid_update_request_single_answer = {
    "answers": [
        {"id": "ans-1", "question_id": "q1", "answer": {"number": 80}},
    ],
}

update_request_missing_answers = {}

update_request_empty_answers = {
    "answers": [],
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        # Valid cases
        (valid_update_request, None),
        (valid_update_request_single_answer, None),
        (update_request_empty_answers, None),  # empty list is valid
        # Missing required field
        (update_request_missing_answers, ValidationError),
    ],
)
def test_update_form_request_body_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            UpdateFormRequestBody(**json)
    else:
        try:
            UpdateFormRequestBody(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e


# Additional scenario tests
class TestFormSubmissionComplexScenarios:
    """Test complex form submission validation scenarios"""

    def test_submission_with_multiple_answers(self):
        """Test creating submission with multiple answer types"""
        request = CreateFormSubmissionRequest(
            form_template_id=VALID_TEMPLATE_ID,
            patient_id=VALID_PATIENT_ID,
            user_id=VALID_USER_ID,
            lang="English",
            answers=[
                FormAnswer(question_id="q1", answer={"number": 75}),
                FormAnswer(question_id="q2", answer={"text": "Good health"}),
                FormAnswer(question_id="q3", answer={"mc_id_array": [0, 2]}),
                FormAnswer(question_id="q4", answer={"date": "2025-01-15"}),
            ],
        )
        assert len(request.answers) == 4

    def test_submission_default_lang(self):
        """Test that default language is English"""
        request = CreateFormSubmissionRequest(
            form_template_id=VALID_TEMPLATE_ID,
            patient_id=VALID_PATIENT_ID,
            user_id=VALID_USER_ID,
            answers=[],
        )
        assert request.lang == "English"

    def test_submission_with_answers_model(self):
        """Test FormSubmissionWithAnswers model"""
        submission = FormSubmissionWithAnswers(
            id=VALID_SUBMISSION_ID,
            form_template_id=VALID_TEMPLATE_ID,
            patient_id=VALID_PATIENT_ID,
            user_id=VALID_USER_ID,
            lang="English",
            answers=[
                {
                    "id": "ans-1",
                    "question_id": "q1",
                    "answer": {"number": 75},
                    "question_type": QuestionTypeEnum.INTEGER,
                    "question_text": "Age",
                    "mc_options": [],
                    "order": 0,
                }
            ],
        )
        assert submission.id == VALID_SUBMISSION_ID
        assert len(submission.answers) == 1
        assert submission.date_submitted is not None
        assert submission.last_edited is not None

    def test_date_sequence_validation_error(self):
        """Test that last_edited cannot be before date_submitted"""
        with pytest.raises(ValidationError) as exc_info:
            FormSubmission(
                id=VALID_SUBMISSION_ID,
                form_template_id=VALID_TEMPLATE_ID,
                patient_id=VALID_PATIENT_ID,
                user_id=VALID_USER_ID,
                date_submitted=VALID_TIMESTAMP,
                last_edited=VALID_TIMESTAMP - 1000,
                lang=VALID_LANG,
            )
        assert "last_edited cannot be before date_submitted" in str(exc_info.value)

    def test_date_sequence_validation_success(self):
        """Test that last_edited can be equal to or after date_submitted"""
        # Equal timestamps
        submission1 = FormSubmission(
            id=VALID_SUBMISSION_ID,
            form_template_id=VALID_TEMPLATE_ID,
            patient_id=VALID_PATIENT_ID,
            user_id=VALID_USER_ID,
            date_submitted=VALID_TIMESTAMP,
            last_edited=VALID_TIMESTAMP,
            lang=VALID_LANG,
        )
        assert submission1.date_submitted == submission1.last_edited

        # last_edited after date_submitted
        submission2 = FormSubmission(
            id=VALID_SUBMISSION_ID,
            form_template_id=VALID_TEMPLATE_ID,
            patient_id=VALID_PATIENT_ID,
            user_id=VALID_USER_ID,
            date_submitted=VALID_TIMESTAMP,
            last_edited=VALID_TIMESTAMP + 1000,
            lang=VALID_LANG,
        )
        assert submission2.last_edited > submission2.date_submitted
