"""Unit tests for form_utils.attach_questions."""

from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import patch

import pytest

from common.form_utils import attach_questions
from enums import QuestionTypeEnum
from models import FormTemplateOrmV2
from validation.formsV2_models import NumberAnswer, TextAnswer

SUBMISSION_ID = "submission-1"
TEMPLATE_ID = "template-1"
STRING_Q_ID = "q-string"
INTEGER_Q_ID = "q-integer"
MC_Q_ID = "q-mc"
UNKNOWN_Q_ID = "q-unknown"
QUESTION_TEXT_ID = "question-text-id"
MC_QUESTION_TEXT_ID = "mc-question-text-id"
MC_OPT_A = "mc-option-a"
MC_OPT_B = "mc-option-b"


def _resolve_string_text(string_id: str, lang: str = "English") -> str | None:
    if string_id is None:
        return None
    return f"{string_id}:{lang}"


def _make_template_questions() -> list[SimpleNamespace]:
    return [
        SimpleNamespace(
            id=STRING_Q_ID,
            question_type=QuestionTypeEnum.STRING,
            order=0,
            question_string_id=QUESTION_TEXT_ID,
            mc_options=None,
        ),
        SimpleNamespace(
            id=INTEGER_Q_ID,
            question_type=QuestionTypeEnum.INTEGER,
            order=1,
            question_string_id="integer-question-text-id",
            mc_options=None,
        ),
        SimpleNamespace(
            id=MC_Q_ID,
            question_type=QuestionTypeEnum.MULTIPLE_CHOICE,
            order=2,
            question_string_id=MC_QUESTION_TEXT_ID,
            mc_options=json.dumps([MC_OPT_A, MC_OPT_B]),
        ),
    ]


def _make_submission(
    *,
    lang: str | None = "English",
    answers: list[SimpleNamespace] | None = None,
) -> SimpleNamespace:
    return SimpleNamespace(
        id=SUBMISSION_ID,
        form_template_id=TEMPLATE_ID,
        lang=lang,
        answers=answers or [],
    )


def _make_answer_orm(
    *,
    answer_id: str,
    question_id: str,
    answer_payload: dict,
) -> SimpleNamespace:
    return SimpleNamespace(
        _marshal={
            "id": answer_id,
            "question_id": question_id,
            "form_submission_id": SUBMISSION_ID,
            "answer": answer_payload,
        }
    )


def _marshal_side_effect(answer_orm: SimpleNamespace) -> dict:
    return answer_orm._marshal


@pytest.fixture
def mock_template_read():
    template = SimpleNamespace(questions=_make_template_questions())
    with patch("common.form_utils.crud.read", return_value=template):
        yield template


@patch("data.orm_serializer.marshal", side_effect=_marshal_side_effect)
@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_attach_questions_enriches_string_answer(
    mock_resolve, mock_marshal, mock_template_read
):
    submission = _make_submission(
        answers=[
            _make_answer_orm(
                answer_id="answer-1",
                question_id=STRING_Q_ID,
                answer_payload={"text": "Patient name"},
            )
        ]
    )

    results = attach_questions(submission)

    assert len(results) == 1
    enriched = results[0]
    assert enriched.question_id == STRING_Q_ID
    assert enriched.question_type == QuestionTypeEnum.STRING.value
    assert enriched.order == 0
    assert enriched.question_text == f"{QUESTION_TEXT_ID}:English"
    assert enriched.answer == TextAnswer(text="Patient name")
    assert enriched.mc_options == []


@patch("data.orm_serializer.marshal", side_effect=_marshal_side_effect)
@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_attach_questions_enriches_numeric_answer(
    mock_resolve, mock_marshal, mock_template_read
):
    submission = _make_submission(
        answers=[
            _make_answer_orm(
                answer_id="answer-2",
                question_id=INTEGER_Q_ID,
                answer_payload={"number": 90},
            )
        ]
    )

    results = attach_questions(submission)

    assert len(results) == 1
    assert results[0].question_type == QuestionTypeEnum.INTEGER.value
    assert results[0].answer == NumberAnswer(number=90.0)


@patch("data.orm_serializer.marshal", side_effect=_marshal_side_effect)
@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_attach_questions_resolves_mc_labels(
    mock_resolve, mock_marshal, mock_template_read
):
    submission = _make_submission(
        answers=[
            _make_answer_orm(
                answer_id="answer-3",
                question_id=MC_Q_ID,
                answer_payload={"mc_id_array": [0, 1]},
            )
        ]
    )

    results = attach_questions(submission)

    assert len(results) == 1
    assert results[0].question_type == QuestionTypeEnum.MULTIPLE_CHOICE.value
    assert results[0].question_text == f"{MC_QUESTION_TEXT_ID}:English"
    assert results[0].mc_options == [
        f"{MC_OPT_A}:English",
        f"{MC_OPT_B}:English",
    ]


@patch("data.orm_serializer.marshal", side_effect=_marshal_side_effect)
@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_attach_questions_uses_submission_language(
    mock_resolve, mock_marshal, mock_template_read
):
    submission = _make_submission(
        lang="French",
        answers=[
            _make_answer_orm(
                answer_id="answer-1",
                question_id=STRING_Q_ID,
                answer_payload={"text": "Bonjour"},
            )
        ],
    )

    attach_questions(submission)

    mock_resolve.assert_any_call(QUESTION_TEXT_ID, "French")


@patch("data.orm_serializer.marshal", side_effect=_marshal_side_effect)
@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_attach_questions_defaults_to_english_when_lang_missing(
    mock_resolve, mock_marshal, mock_template_read
):
    submission = _make_submission(
        lang=None,
        answers=[
            _make_answer_orm(
                answer_id="answer-1",
                question_id=STRING_Q_ID,
                answer_payload={"text": "Hello"},
            )
        ],
    )

    attach_questions(submission)

    mock_resolve.assert_any_call(QUESTION_TEXT_ID, "English")


@patch("data.orm_serializer.marshal", side_effect=_marshal_side_effect)
@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_attach_questions_raises_when_question_not_found(
    mock_resolve, mock_marshal, mock_template_read
):
    submission = _make_submission(
        answers=[
            _make_answer_orm(
                answer_id="answer-unknown",
                question_id=UNKNOWN_Q_ID,
                answer_payload={"text": "orphan answer"},
            )
        ]
    )

    with pytest.raises(ValueError, match="Question doesn't exist"):
        attach_questions(submission)


@patch("data.orm_serializer.marshal", side_effect=_marshal_side_effect)
def test_attach_questions_skips_unresolved_mc_options(
    mock_marshal, mock_template_read
):
    def resolve_with_missing(string_id: str, lang: str = "English") -> str | None:
        if string_id == MC_OPT_B:
            return None
        return _resolve_string_text(string_id, lang)

    submission = _make_submission(
        answers=[
            _make_answer_orm(
                answer_id="answer-3",
                question_id=MC_Q_ID,
                answer_payload={"mc_id_array": [0]},
            )
        ]
    )

    with patch(
        "common.form_utils.resolve_string_text", side_effect=resolve_with_missing
    ):
        results = attach_questions(submission)

    assert results[0].mc_options == [f"{MC_OPT_A}:English"]


@patch("data.orm_serializer.marshal", side_effect=_marshal_side_effect)
@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_attach_questions_returns_all_answers_in_order(
    mock_resolve, mock_marshal, mock_template_read
):
    submission = _make_submission(
        answers=[
            _make_answer_orm(
                answer_id="answer-1",
                question_id=STRING_Q_ID,
                answer_payload={"text": "first"},
            ),
            _make_answer_orm(
                answer_id="answer-2",
                question_id=INTEGER_Q_ID,
                answer_payload={"number": 42},
            ),
        ]
    )

    results = attach_questions(submission)

    assert [answer.question_id for answer in results] == [STRING_Q_ID, INTEGER_Q_ID]
    assert [answer.order for answer in results] == [0, 1]


@patch("data.orm_serializer.marshal", side_effect=_marshal_side_effect)
@patch("common.form_utils.crud.read")
def test_attach_questions_loads_template_by_submission_form_template_id(
    mock_read, mock_marshal,
):
    template = SimpleNamespace(questions=_make_template_questions())
    mock_read.return_value = template

    submission = _make_submission(
        answers=[
            _make_answer_orm(
                answer_id="answer-1",
                question_id=STRING_Q_ID,
                answer_payload={"text": "hello"},
            )
        ]
    )

    with patch(
        "common.form_utils.resolve_string_text", side_effect=_resolve_string_text
    ):
        attach_questions(submission)

    mock_read.assert_called_once_with(FormTemplateOrmV2, id=TEMPLATE_ID)
