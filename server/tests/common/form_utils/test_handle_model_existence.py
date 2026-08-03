"""Unit tests for form_utils.handle_model_existence."""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import patch

import pytest

from common.form_utils import handle_model_existence
from models import FormClassificationOrmV2, FormTemplateOrmV2

FORM_NAME = "Patient Intake Form"
CLASSIFICATION_ID = "classification-1"
TEMPLATE_VERSION = 2

CLASSIFICATION_DICT = {
    "id": CLASSIFICATION_ID,
    "name": {"english": FORM_NAME},
}


def test_new_template_succeeds_when_name_is_unique():
    with patch("common.form_utils.check_name_conflict", return_value=False):
        archive_previous, existing_classification = handle_model_existence(
            new_template=True,
            classification_dict=CLASSIFICATION_DICT,
            version=1,
            english_name=FORM_NAME,
        )

    assert archive_previous is False
    assert existing_classification is None


def test_new_template_raises_when_english_name_missing():
    with pytest.raises(ValueError, match="english lanuage version"):
        handle_model_existence(
            new_template=True,
            classification_dict=CLASSIFICATION_DICT,
            version=1,
            english_name="",
        )


def test_new_template_raises_when_name_conflicts():
    with (
        patch("common.form_utils.check_name_conflict", return_value=True),
        pytest.raises(
            ValueError,
            match=f"Form Classification with name {FORM_NAME} already exists.",
        ),
    ):
        handle_model_existence(
            new_template=True,
            classification_dict=CLASSIFICATION_DICT,
            version=1,
            english_name=FORM_NAME,
        )


def test_new_template_checks_name_conflict_with_english_name():
    with patch(
        "common.form_utils.check_name_conflict", return_value=False
    ) as mock_check_name_conflict:
        handle_model_existence(
            new_template=True,
            classification_dict=CLASSIFICATION_DICT,
            version=1,
            english_name=FORM_NAME,
        )

    mock_check_name_conflict.assert_called_once_with(FORM_NAME)


def test_edit_new_version_succeeds_and_marks_previous_for_archival():
    existing_classification = SimpleNamespace(
        id=CLASSIFICATION_ID,
        name_string_id="name-string-1",
    )

    def read_side_effect(model, **kwargs):
        if model is FormClassificationOrmV2:
            return existing_classification
        if model is FormTemplateOrmV2:
            return None
        return None

    with patch("common.form_utils.crud.read", side_effect=read_side_effect):
        archive_previous, classification = handle_model_existence(
            new_template=False,
            classification_dict=CLASSIFICATION_DICT,
            version=TEMPLATE_VERSION,
            english_name=FORM_NAME,
        )

    assert archive_previous is True
    assert classification is existing_classification


def test_edit_raises_when_version_already_exists():
    existing_template = SimpleNamespace(
        id="template-v2",
        form_classification_id=CLASSIFICATION_ID,
        version=TEMPLATE_VERSION,
    )

    def read_side_effect(model, **kwargs):
        if model is FormClassificationOrmV2:
            return SimpleNamespace(id=CLASSIFICATION_ID)
        if model is FormTemplateOrmV2:
            return existing_template
        return None

    with (
        patch("common.form_utils.crud.read", side_effect=read_side_effect),
        pytest.raises(
            ValueError,
            match=(
                f"Form Template with version V{TEMPLATE_VERSION} already exists "
                "- change the version to upload."
            ),
        ),
    ):
        handle_model_existence(
            new_template=False,
            classification_dict=CLASSIFICATION_DICT,
            version=TEMPLATE_VERSION,
            english_name=FORM_NAME,
        )


def test_edit_looks_up_classification_and_template_by_id_and_version():
    def read_side_effect(model, **kwargs):
        if model is FormClassificationOrmV2:
            return SimpleNamespace(id=CLASSIFICATION_ID)
        if model is FormTemplateOrmV2:
            return None
        return None

    with patch("common.form_utils.crud.read", side_effect=read_side_effect) as mock_read:
        handle_model_existence(
            new_template=False,
            classification_dict=CLASSIFICATION_DICT,
            version=TEMPLATE_VERSION,
            english_name=FORM_NAME,
        )

    assert mock_read.call_count == 2
    mock_read.assert_any_call(FormClassificationOrmV2, id=CLASSIFICATION_ID)
    mock_read.assert_any_call(
        FormTemplateOrmV2,
        form_classification_id=CLASSIFICATION_ID,
        version=TEMPLATE_VERSION,
    )
