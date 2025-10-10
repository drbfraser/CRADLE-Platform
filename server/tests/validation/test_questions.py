import time

import pytest
from pydantic import ValidationError

from common.commonUtil import get_current_time
from enums import QuestionTypeEnum
from validation.questions import FormQuestion

QUESTION_IDX = 1
NUM_MIN = 1
SAMPLE_QUES = "Sample question text"

number_within_min_max_should_pass = dict(
    question_index=QUESTION_IDX,
    question_type=QuestionTypeEnum.INTEGER.value,
    question_text=SAMPLE_QUES,
    answers={"number": 5},
    num_min=NUM_MIN,
    num_max=10,
)

number_below_min_should_fail = dict(
    question_index=QUESTION_IDX,
    question_type=QuestionTypeEnum.INTEGER.value,
    question_text=SAMPLE_QUES,
    answers={"number": 0},
    num_min=NUM_MIN,
)

string_exceeds_max_length_should_fail = dict(
    question_index=QUESTION_IDX,
    question_type=QuestionTypeEnum.STRING.value,
    question_text=SAMPLE_QUES,
    answers={"text": "Sample answer"},
    string_max_length=5,
)

past_date_not_allowed_should_fail = dict(
    question_index=QUESTION_IDX,
    question_type=QuestionTypeEnum.DATE.value,
    question_text=SAMPLE_QUES,
    answers={"number": get_current_time() - 86400},  # 1 day ago
    allow_past_dates=False,
)

future_date_not_allowed_should_fail = dict(
    question_index=QUESTION_IDX,
    question_type=QuestionTypeEnum.DATE.value,
    question_text=SAMPLE_QUES,
    answers={"number": get_current_time() + 86400},  # 1 day ahead
    allow_future_dates=False,
)

none_answer_should_pass = dict(
    question_index=QUESTION_IDX,
    question_type=QuestionTypeEnum.STRING.value,
    question_text=SAMPLE_QUES,
    answers=None,
)

empty_answer_should_pass = dict(
    question_index=QUESTION_IDX,
    question_type=QuestionTypeEnum.STRING.value,
    question_text=SAMPLE_QUES,
    answers={"text": ""},
)

none_answer_with_string_constraints_should_pass = dict(
    question_index=QUESTION_IDX,
    question_type=QuestionTypeEnum.STRING.value,
    question_text=SAMPLE_QUES,
    answers=None,
    string_max_length=10,
)

none_answer_with_number_constraints_should_pass = dict(
    question_index=QUESTION_IDX,
    question_type=QuestionTypeEnum.INTEGER.value,
    question_text=SAMPLE_QUES,
    answers=None,
    num_min=-10,
    num_max=10,
)

none_answer_with_date_constraints_should_pass = dict(
    question_index=QUESTION_IDX,
    question_type=QuestionTypeEnum.DATE.value,
    question_text=SAMPLE_QUES,
    answers=None,
    allow_future_dates=False,
    allow_past_dates=False,
)


@pytest.mark.parametrize(
    "json_data, expectation, expected_err_msg",
    [
        (number_within_min_max_should_pass, None, None),
        (number_below_min_should_fail, ValidationError, "answer 0 below minimum"),
        (
            string_exceeds_max_length_should_fail,
            ValidationError,
            "answer text exceeds max length",
        ),
        (
            past_date_not_allowed_should_fail,
            ValidationError,
            "past dates are not allowed",
        ),
        (
            future_date_not_allowed_should_fail,
            ValidationError,
            "future dates are not allowed",
        ),
        (none_answer_should_pass, None, None),
        (empty_answer_should_pass, None, None),
        (none_answer_with_string_constraints_should_pass, None, None),
        (none_answer_with_number_constraints_should_pass, None, None),
        (none_answer_with_date_constraints_should_pass, None, None),
    ],
)
def test_form_question_validation(json_data, expectation, expected_err_msg):
    if isinstance(expectation, type) and issubclass(expectation, Exception):
        with pytest.raises(expectation) as error:
            FormQuestion(**json_data)
        if expected_err_msg:
            assert expected_err_msg.lower() in str(error.value).lower()
    else:
        try:
            FormQuestion(**json_data)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e
