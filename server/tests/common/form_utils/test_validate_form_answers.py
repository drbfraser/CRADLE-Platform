"""Unit tests for form_utils.validate_form_answers."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from common.form_utils import validate_form_answers
from enums import QuestionTypeEnum
from tests.common.form_utils.helpers import TEMPLATE_ID, make_question, make_template
from validation.formsV2_models import (
    DateAnswer,
    FormAnswer,
    MCAnswer,
    NumberAnswer,
    TextAnswer,
)

INTEGER_Q_ID = "q-integer"
STRING_Q_ID = "q-string"
MC_Q_ID = "q-mc"
DATE_Q_ID = "q-date"
UNKNOWN_Q_ID = "q-unknown"
SECONDS_PER_DAY = 24 * 60 * 60
FIXED_NOW = 1_700_000_000


@pytest.fixture
def mock_template_read():
    integer_question = make_question(
        INTEGER_Q_ID,
        QuestionTypeEnum.INTEGER,
        required=True,
        num_min=0,
        num_max=300,
    )
    optional_integer_question = make_question(
        "q-optional-integer",
        QuestionTypeEnum.INTEGER,
        required=False,
        num_min=0,
        num_max=300,
    )
    string_question = make_question(
        STRING_Q_ID,
        QuestionTypeEnum.STRING,
        required=False,
        string_max_length=10,
    )
    mc_question = make_question(
        MC_Q_ID,
        QuestionTypeEnum.MULTIPLE_CHOICE,
        required=False,
        mc_options=["opt-a", "opt-b", "opt-c"],
    )
    date_question = make_question(
        DATE_Q_ID,
        QuestionTypeEnum.DATE,
        required=False,
        allow_past_dates=False,
        allow_future_dates=True,
    )
    template = make_template(
        [
            integer_question,
            optional_integer_question,
            string_question,
            mc_question,
            date_question,
        ]
    )

    with patch("common.form_utils.crud.read", return_value=template):
        yield template


def test_valid_integer_answer_within_range(mock_template_read):
    answers = [
        FormAnswer(
            question_id=INTEGER_Q_ID,
            answer=NumberAnswer(number=90),
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is True
    assert result.code is None
    assert result.msg == "Answers are all valid"


def test_integer_below_min(mock_template_read):
    answers = [
        FormAnswer(
            question_id=INTEGER_Q_ID,
            answer=NumberAnswer(number=-1),
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is False
    assert result.code == 422
    assert "below the minimum required: 0" in result.msg


def test_integer_above_max(mock_template_read):
    answers = [
        FormAnswer(
            question_id=INTEGER_Q_ID,
            answer=NumberAnswer(number=500),
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is False
    assert result.code == 422
    assert "above the maximum required: 300" in result.msg


def test_required_question_empty(mock_template_read):
    answers = [
        FormAnswer.model_construct(
            question_id=INTEGER_Q_ID,
            answer=None,
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is False
    assert result.code == 422
    assert result.msg == "One or more required questions are empty"


def test_optional_question_empty_skipped(mock_template_read):
    answers = [
        FormAnswer.model_construct(
            question_id="q-optional-integer",
            answer=None,
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is True
    assert result.code is None


def test_string_exceeds_max_length(mock_template_read):
    answers = [
        FormAnswer(
            question_id=STRING_Q_ID,
            answer=TextAnswer(text="this string is way too long"),
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is False
    assert result.code == 422
    assert "exceeds the max length of 10 characters" in result.msg


def test_mc_invalid_index(mock_template_read):
    answers = [
        FormAnswer(
            question_id=MC_Q_ID,
            answer=MCAnswer(mc_id_array=[99]),
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is False
    assert result.code == 422
    assert "Selected option 99 is invalid" in result.msg
    assert "indices 0 to 2" in result.msg


def test_mc_valid_indices(mock_template_read):
    answers = [
        FormAnswer(
            question_id=MC_Q_ID,
            answer=MCAnswer(mc_id_array=[0, 2]),
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is True
    assert result.code is None


def test_mc_empty_selection_skipped(mock_template_read):
    answers = [
        FormAnswer(
            question_id=MC_Q_ID,
            answer=MCAnswer(mc_id_array=[]),
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is True
    assert result.code is None


@patch("common.form_utils.commonUtil.get_current_time", return_value=FIXED_NOW)
def test_date_past_not_allowed(mock_get_current_time, mock_template_read):
    answers = [
        FormAnswer(
            question_id=DATE_Q_ID,
            answer=DateAnswer(date=str(FIXED_NOW - 10 * SECONDS_PER_DAY)),
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is False
    assert result.code == 422
    assert result.msg == "Past dates are not allowed"


@patch("common.form_utils.commonUtil.get_current_time", return_value=FIXED_NOW)
def test_date_future_not_allowed(mock_get_current_time, mock_template_read):
    future_only_question = make_question(
        "q-future-date",
        QuestionTypeEnum.DATE,
        allow_past_dates=True,
        allow_future_dates=False,
    )
    template = make_template([future_only_question])

    with patch("common.form_utils.crud.read", return_value=template):
        answers = [
            FormAnswer(
                question_id="q-future-date",
                answer=DateAnswer(date=str(FIXED_NOW + 10 * SECONDS_PER_DAY)),
            )
        ]

        result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is False
    assert result.code == 422
    assert result.msg == "Future dates are not allowed"


def test_unknown_question_id(mock_template_read):
    answers = [
        FormAnswer(
            question_id=UNKNOWN_Q_ID,
            answer=NumberAnswer(number=90),
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is False
    assert result.code == 404
    assert result.msg == "One or more questions do not exist"


def test_missing_question_id(mock_template_read):
    answers = [
        FormAnswer.model_construct(
            question_id=None,
            answer=NumberAnswer(number=90),
        )
    ]

    result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is False
    assert result.code == 422
    assert result.msg == "Answers must have a question_id"


def test_unsupported_question_type():
    unsupported_question = make_question(
        "q-time",
        QuestionTypeEnum.TIME,
    )
    template = make_template([unsupported_question])

    with patch("common.form_utils.crud.read", return_value=template):
        answers = [
            FormAnswer(
                question_id="q-time",
                answer=NumberAnswer(number=1),
            )
        ]

        result = validate_form_answers(answers, TEMPLATE_ID)

    assert result.ok is False
    assert result.code == 422
    assert "Question type" in result.msg
    assert "not supported" in result.msg
