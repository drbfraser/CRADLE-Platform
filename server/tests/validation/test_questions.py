import pytest
import time
from pydantic import ValidationError
from validation.questions import FormQuestion

QUESTION_IDX = 1
NUM_MIN = 1

number_within_min_max_should_pass = dict(
    question_index=QUESTION_IDX,
    question_type="INTEGER",
    question_text="Sample question text",
    answers={"number": 5},
    num_min=NUM_MIN,
    num_max=10,
)

number_below_min_should_fail = dict(
    question_index=QUESTION_IDX,
    question_type="INTEGER",
    question_text="Sample question text",
    answers={"number": 0},
    num_min=NUM_MIN,
)

string_exceeds_max_length_should_fail = dict(
    question_index=QUESTION_IDX,
    question_type="TEXT",
    question_text="Sample question text",
    answers={"text": "abcdefghij"},
    string_max_length=5,
)

now = int(time.time())

past_date_not_allowed_should_fail = dict(
    question_index=QUESTION_IDX,
    question_type="DATE",
    question_text="Sample question text",
    answers={"number": now - 86400},  # 1 day ago
    allow_past_dates=False,
)

future_date_not_allowed_should_fail = dict(
    question_index=QUESTION_IDX,
    question_type="DATE",
    question_text="Sample question text",
    answers={"number": now + 86400},  # 1 day ahead
    allow_future_dates=False,
)


@pytest.mark.parametrize(
    "json_data, expectation",
    [
        (number_within_min_max_should_pass, None),
        (number_below_min_should_fail, ValidationError),
        (string_exceeds_max_length_should_fail, ValidationError),
        (past_date_not_allowed_should_fail, ValidationError),
        (future_date_not_allowed_should_fail, ValidationError),
    ],
)
def test_form_question_validation(json_data, expectation):
    if isinstance(expectation, type) and issubclass(expectation, Exception):
        with pytest.raises(expectation):
            FormQuestion(**json_data)
    else:
        try:
            FormQuestion(**json_data)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e
