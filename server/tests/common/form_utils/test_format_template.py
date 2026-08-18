"""Unit tests for form_utils.format_template."""

from __future__ import annotations

from unittest.mock import patch

from common.form_utils import format_template
from enums import QuestionTypeEnum

AVAILABLE_LANGS = ["English", "French"]
NAME_STRING_ID = "name-string-1"
QUESTION_STRING_ID = "question-string-1"
MC_OPTION_A = "mc-option-a"
MC_OPTION_B = "mc-option-b"


def _resolve_string_text(string_id: str, lang: str = "English") -> str | None:
    if string_id is None:
        return None
    return f"{string_id}:{lang}"


def _base_template() -> dict:
    return {
        "id": "template-1",
        "version": 1,
        "form_classification_id": "classification-1",
        "classification": {
            "id": "classification-1",
            "name_string_id": NAME_STRING_ID,
        },
        "questions": [
            {
                "id": "q-string",
                "order": 0,
                "question_type": QuestionTypeEnum.STRING.value,
                "question_string_id": QUESTION_STRING_ID,
                "required": True,
            },
            {
                "id": "q-mc",
                "order": 1,
                "question_type": QuestionTypeEnum.MULTIPLE_CHOICE.value,
                "question_string_id": "question-string-2",
                "mc_options": [MC_OPTION_A, MC_OPTION_B],
                "required": False,
            },
        ],
    }


@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_empty_template_returns_empty_dict(mock_resolve):
    assert format_template({}, AVAILABLE_LANGS) == {}
    mock_resolve.assert_not_called()


@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_removes_form_classification_id(mock_resolve):
    template = _base_template()

    formatted = format_template(template, AVAILABLE_LANGS)

    assert "form_classification_id" not in formatted
    mock_resolve.assert_called()


@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_resolves_classification_name_for_all_languages(mock_resolve):
    template = _base_template()

    formatted = format_template(template, AVAILABLE_LANGS)

    assert formatted["classification"]["name"] == {
        "English": f"{NAME_STRING_ID}:English",
        "French": f"{NAME_STRING_ID}:French",
    }


@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_resolves_question_text_for_all_languages(mock_resolve):
    template = _base_template()

    formatted = format_template(template, AVAILABLE_LANGS)

    string_question = formatted["questions"][0]
    assert string_question["question_text"] == {
        "English": f"{QUESTION_STRING_ID}:English",
        "French": f"{QUESTION_STRING_ID}:French",
    }


@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_formats_mc_options_with_translations(mock_resolve):
    template = _base_template()

    formatted = format_template(template, AVAILABLE_LANGS)

    mc_question = formatted["questions"][1]
    assert mc_question["mc_options"] == [
        {
            "string_id": MC_OPTION_A,
            "translations": {
                "English": f"{MC_OPTION_A}:English",
                "French": f"{MC_OPTION_A}:French",
            },
        },
        {
            "string_id": MC_OPTION_B,
            "translations": {
                "English": f"{MC_OPTION_B}:English",
                "French": f"{MC_OPTION_B}:French",
            },
        },
    ]


@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_single_language_request(mock_resolve):
    template = _base_template()

    formatted = format_template(template, ["English"])

    assert formatted["classification"]["name"] == {
        "English": f"{NAME_STRING_ID}:English",
    }
    assert formatted["questions"][0]["question_text"] == {
        "English": f"{QUESTION_STRING_ID}:English",
    }


@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_classification_without_name_string_id_is_unchanged(mock_resolve):
    template = {
        "id": "template-1",
        "classification": {
            "id": "classification-1",
            "name": {"english": "Existing Name"},
        },
        "questions": [],
    }

    formatted = format_template(template, AVAILABLE_LANGS)

    assert formatted["classification"]["name"] == {"english": "Existing Name"}
    mock_resolve.assert_not_called()


@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_question_without_string_id_skips_question_text_resolution(mock_resolve):
    template = {
        "id": "template-1",
        "questions": [
            {
                "id": "q-integer",
                "order": 0,
                "question_type": QuestionTypeEnum.INTEGER.value,
                "required": True,
            }
        ],
    }

    formatted = format_template(template, AVAILABLE_LANGS)

    assert "question_text" not in formatted["questions"][0]
    mock_resolve.assert_not_called()


@patch("common.form_utils.resolve_string_text", side_effect=_resolve_string_text)
def test_multiple_select_options_formatted_like_multiple_choice(mock_resolve):
    template = {
        "id": "template-1",
        "questions": [
            {
                "id": "q-ms",
                "order": 0,
                "question_type": QuestionTypeEnum.MULTIPLE_SELECT.value,
                "mc_options": [MC_OPTION_A],
            }
        ],
    }

    formatted = format_template(template, ["English"])

    assert formatted["questions"][0]["mc_options"] == [
        {
            "string_id": MC_OPTION_A,
            "translations": {"English": f"{MC_OPTION_A}:English"},
        }
    ]
