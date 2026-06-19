"""
Tests for __query_forms_collection in data_catalogue.py.
"""

from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from enums import QuestionTypeEnum
from models import FormQuestionTemplateOrmV2, FormSubmissionOrmV2, LangVersionOrmV2
from service.workflow.datasourcing import data_catalogue

_query_forms = data_catalogue.get_catalogue()["forms"]["query"]

PATIENT_ID = "patient-test-1"


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------


def _make_answer(question_id: str, answer_json: dict) -> SimpleNamespace:
    a = SimpleNamespace()
    a.question_id = question_id
    a.answer = json.dumps(answer_json)
    return a


def _make_submission(answers: list, date_submitted: int = 1_000) -> SimpleNamespace:
    s = SimpleNamespace()
    s.patient_id = PATIENT_ID
    s.date_submitted = date_submitted
    s.answers = answers
    return s


def _make_question(
    question_id: str,
    user_question_id: str,
    question_type: QuestionTypeEnum,
    mc_options: list | None = None,
) -> SimpleNamespace:
    q = SimpleNamespace()
    q.id = question_id
    q.user_question_id = user_question_id
    q.question_type = question_type
    q.mc_options = json.dumps(mc_options) if mc_options is not None else None
    return q


def _make_lang_version(string_id: str, text: str) -> SimpleNamespace:
    lv = SimpleNamespace()
    lv.string_id = string_id
    lv.text = text
    return lv


def _build_session_mock(
    submissions: list,
    questions: list,
    lang_versions: list | None = None,
) -> MagicMock:
    """
    Return a MagicMock that dispatches .query(Model) to the right fake row list,
    matching the SQLAlchemy chain: .filter().order_by().all() for submissions
    and .filter().all() for questions and lang versions.
    """
    if lang_versions is None:
        lang_versions = []

    session = MagicMock()

    sub_chain = MagicMock()
    sub_chain.filter.return_value.order_by.return_value.all.return_value = submissions

    q_chain = MagicMock()
    q_chain.filter.return_value.all.return_value = questions

    lv_chain = MagicMock()
    lv_chain.filter.return_value.all.return_value = lang_versions

    def _side_effect(model):
        if model is FormSubmissionOrmV2:
            return sub_chain
        if model is FormQuestionTemplateOrmV2:
            return q_chain
        if model is LangVersionOrmV2:
            return lv_chain
        return MagicMock()

    session.query.side_effect = _side_effect
    return session


# ---------------------------------------------------------------------------
# Empty / no-data cases
# ---------------------------------------------------------------------------


def test_no_submissions_returns_empty_list():
    session = _build_session_mock(submissions=[], questions=[])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)
    assert result == []


def test_submission_with_no_answers_returns_empty_dict():
    submission = _make_submission(answers=[])
    session = _build_session_mock([submission], questions=[])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)
    assert result == [{}]


# ---------------------------------------------------------------------------
# Answer type parsing: one test per supported data type
# ---------------------------------------------------------------------------


def test_integer_answer():
    answer = _make_answer("q1", {"number": 72})
    submission = _make_submission([answer])
    question = _make_question("q1", "heart_rate", QuestionTypeEnum.INTEGER)

    session = _build_session_mock([submission], [question])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"heart_rate": 72}]


def test_decimal_answer():
    answer = _make_answer("q1", {"number": 98.6})
    submission = _make_submission([answer])
    question = _make_question("q1", "temperature", QuestionTypeEnum.DECIMAL)

    session = _build_session_mock([submission], [question])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"temperature": 98.6}]


def test_string_answer():
    answer = _make_answer("q1", {"text": "some notes"})
    submission = _make_submission([answer])
    question = _make_question("q1", "clinical_notes", QuestionTypeEnum.STRING)

    session = _build_session_mock([submission], [question])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"clinical_notes": "some notes"}]


def test_date_answer():
    answer = _make_answer("q1", {"date": "2024-01-15"})
    submission = _make_submission([answer])
    question = _make_question("q1", "appointment_date", QuestionTypeEnum.DATE)

    session = _build_session_mock([submission], [question])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"appointment_date": "2024-01-15"}]


def test_datetime_answer():
    answer = _make_answer("q1", {"date": "2024-01-15T10:30:00"})
    submission = _make_submission([answer])
    question = _make_question("q1", "event_time", QuestionTypeEnum.DATETIME)

    session = _build_session_mock([submission], [question])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"event_time": "2024-01-15T10:30:00"}]


def test_mc_answer_resolves_to_english_text():
    yes_id = "str-yes"
    no_id = "str-no"
    answer = _make_answer("q1", {"mc_id_array": [0]})
    submission = _make_submission([answer])
    question = _make_question(
        "q1", "step_response", QuestionTypeEnum.MULTIPLE_CHOICE,
        mc_options=[yes_id, no_id],
    )
    lang_version = _make_lang_version(yes_id, "Yes")

    session = _build_session_mock([submission], [question], [lang_version])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"step_response": "Yes"}]


def test_mc_answer_resolves_non_first_option():
    yes_id = "str-yes"
    no_id = "str-no"
    answer = _make_answer("q1", {"mc_id_array": [1]})
    submission = _make_submission([answer])
    question = _make_question(
        "q1", "step_response", QuestionTypeEnum.MULTIPLE_CHOICE,
        mc_options=[yes_id, no_id],
    )
    lang_versions = [
        _make_lang_version(yes_id, "Yes"),
        _make_lang_version(no_id, "No"),
    ]

    session = _build_session_mock([submission], [question], lang_versions)
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"step_response": "No"}]


def test_mc_answer_missing_translation_excluded():
    """Field is omitted entirely when no English translation exists for the selected option."""
    answer = _make_answer("q1", {"mc_id_array": [0]})
    submission = _make_submission([answer])
    question = _make_question(
        "q1", "step_response", QuestionTypeEnum.MULTIPLE_CHOICE,
        mc_options=["str-uuid-1"],
    )

    session = _build_session_mock([submission], [question], lang_versions=[])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{}]


def test_multiple_select_single_selection():
    """A single selected option emits one boolean entry keyed as {question}_{text}."""
    fever_id = "str-fever"
    cough_id = "str-cough"
    answer = _make_answer("q1", {"mc_id_array": [0]})
    submission = _make_submission([answer])
    question = _make_question(
        "q1", "symptoms", QuestionTypeEnum.MULTIPLE_SELECT,
        mc_options=[fever_id, cough_id],
    )
    lang_versions = [
        _make_lang_version(fever_id, "Fever"),
        _make_lang_version(cough_id, "Cough"),
    ]

    session = _build_session_mock([submission], [question], lang_versions)
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"symptoms_Fever": True}]


def test_multiple_select_multiple_selections():
    """Each selected option emits its own boolean entry."""
    fever_id = "str-fever"
    cough_id = "str-cough"
    answer = _make_answer("q1", {"mc_id_array": [0, 1]})
    submission = _make_submission([answer])
    question = _make_question(
        "q1", "symptoms", QuestionTypeEnum.MULTIPLE_SELECT,
        mc_options=[fever_id, cough_id],
    )
    lang_versions = [
        _make_lang_version(fever_id, "Fever"),
        _make_lang_version(cough_id, "Cough"),
    ]

    session = _build_session_mock([submission], [question], lang_versions)
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"symptoms_Fever": True, "symptoms_Cough": True}]


def test_multiple_select_missing_translation_excluded():
    """Selections with no English translation are silently omitted."""
    fever_id = "str-fever"
    unknown_id = "str-unknown"
    answer = _make_answer("q1", {"mc_id_array": [0, 1]})
    submission = _make_submission([answer])
    question = _make_question(
        "q1", "symptoms", QuestionTypeEnum.MULTIPLE_SELECT,
        mc_options=[fever_id, unknown_id],
    )
    lang_versions = [_make_lang_version(fever_id, "Fever")]

    session = _build_session_mock([submission], [question], lang_versions)
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"symptoms_Fever": True}]


# ---------------------------------------------------------------------------
# Multi-record behaviour
# ---------------------------------------------------------------------------


def test_multiple_questions_in_one_submission():
    """All answers in a single submission are merged into one dict."""
    a1 = _make_answer("q1", {"number": 72})
    a2 = _make_answer("q2", {"text": "notes here"})
    submission = _make_submission([a1, a2])
    q1 = _make_question("q1", "heart_rate", QuestionTypeEnum.INTEGER)
    q2 = _make_question("q2", "clinical_notes", QuestionTypeEnum.STRING)

    session = _build_session_mock([submission], [q1, q2])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert result == [{"heart_rate": 72, "clinical_notes": "notes here"}]


def test_multiple_submissions_newest_first_order_preserved():
    """Result order mirrors the DB order (newest-first) returned by the query."""
    old_ans = _make_answer("q1", {"number": 1})
    new_ans = _make_answer("q1", {"number": 2})
    new_sub = _make_submission([new_ans], date_submitted=2_000)
    old_sub = _make_submission([old_ans], date_submitted=1_000)
    question = _make_question("q1", "score", QuestionTypeEnum.INTEGER)

    # Mock returns newest-first, matching the real ORDER BY DESC query
    session = _build_session_mock([new_sub, old_sub], [question])
    with patch("service.workflow.datasourcing.data_catalogue.crud") as mock_crud:
        mock_crud.db_session = session
        result = _query_forms(PATIENT_ID)

    assert len(result) == 2
    assert result[0]["score"] == 2  # newest
    assert result[1]["score"] == 1  # oldest
