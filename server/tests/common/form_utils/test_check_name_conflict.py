"""Unit tests for form_utils.check_name_conflict."""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import patch

from common.form_utils import check_name_conflict
from models import FormClassificationOrmV2, LangVersionOrmV2

FORM_NAME = "Patient Intake Form"
NAME_STRING_ID = "name-string-1"
OTHER_NAME_STRING_ID = "name-string-2"


def test_no_conflict_when_name_not_found():
    with patch("common.form_utils.crud.read_all", return_value=[]):
        assert check_name_conflict(FORM_NAME) is False


def test_no_conflict_when_lang_version_has_no_classification():
    lang_version = SimpleNamespace(string_id=NAME_STRING_ID)

    with (
        patch("common.form_utils.crud.read_all", return_value=[lang_version]),
        patch("common.form_utils.crud.read", return_value=None),
    ):
        assert check_name_conflict(FORM_NAME) is False


def test_duplicate_name_returns_true():
    lang_version = SimpleNamespace(string_id=NAME_STRING_ID)
    classification = SimpleNamespace(
        id="classification-1",
        name_string_id=NAME_STRING_ID,
    )

    with (
        patch("common.form_utils.crud.read_all", return_value=[lang_version]),
        patch("common.form_utils.crud.read", return_value=classification),
    ):
        assert check_name_conflict(FORM_NAME) is True


def test_exclude_string_id_allows_own_name_on_update():
    lang_version = SimpleNamespace(string_id=NAME_STRING_ID)

    with (
        patch("common.form_utils.crud.read_all", return_value=[lang_version]),
        patch("common.form_utils.crud.read") as mock_read,
    ):
        assert (
            check_name_conflict(FORM_NAME, exclude_string_id=NAME_STRING_ID) is False
        )
        mock_read.assert_not_called()


def test_exclude_string_id_still_flags_other_classification():
    own_lang_version = SimpleNamespace(string_id=NAME_STRING_ID)
    other_lang_version = SimpleNamespace(string_id=OTHER_NAME_STRING_ID)
    other_classification = SimpleNamespace(
        id="classification-2",
        name_string_id=OTHER_NAME_STRING_ID,
    )

    def read_side_effect(model, **kwargs):
        if kwargs.get("name_string_id") == OTHER_NAME_STRING_ID:
            return other_classification
        return None

    with (
        patch(
            "common.form_utils.crud.read_all",
            return_value=[own_lang_version, other_lang_version],
        ),
        patch("common.form_utils.crud.read", side_effect=read_side_effect),
    ):
        assert (
            check_name_conflict(FORM_NAME, exclude_string_id=NAME_STRING_ID) is True
        )


def test_read_all_uses_english_language_filter():
    with patch("common.form_utils.crud.read_all", return_value=[]) as mock_read_all:
        check_name_conflict(FORM_NAME)

    mock_read_all.assert_called_once_with(
        LangVersionOrmV2,
        lang="English",
        text=FORM_NAME,
    )


def test_classification_lookup_uses_name_string_id():
    lang_version = SimpleNamespace(string_id=NAME_STRING_ID)

    with (
        patch("common.form_utils.crud.read_all", return_value=[lang_version]),
        patch("common.form_utils.crud.read", return_value=None) as mock_read,
    ):
        check_name_conflict(FORM_NAME)

    mock_read.assert_called_once_with(
        FormClassificationOrmV2,
        name_string_id=NAME_STRING_ID,
    )
