import pytest
from pydantic import ValidationError

from validation.formsV2_models import FormClassification

# Test data
VALID_ID = "test-id-123"
VALID_NAME_STRING_ID = "name-string-id-456"
VALID_MULTILANG_NAME = {
    "English": "Patient Intake Form",
    "French": "Formulaire d'admission du patient",
}

# Valid test case
form_classification_with_valid_fields = {
    "id": VALID_ID,
    "name": VALID_MULTILANG_NAME,
    "name_string_id": VALID_NAME_STRING_ID,
}

# Missing required field tests
form_classification_missing_name = {
    "id": VALID_ID,
    "name_string_id": VALID_NAME_STRING_ID,
}

# Wrong type tests
form_classification_name_wrong_type = {
    "id": VALID_ID,
    "name": "not a dict",  # Should be MultiLangText (dict)
    "name_string_id": VALID_NAME_STRING_ID,
}

form_classification_id_wrong_type = {
    "id": 123,  # Should be string
    "name": VALID_MULTILANG_NAME,
    "name_string_id": VALID_NAME_STRING_ID,
}

form_classification_name_string_id_wrong_type = {
    "id": VALID_ID,
    "name": VALID_MULTILANG_NAME,
    "name_string_id": 789,  # Should be string
}

# Extra field test
form_classification_with_extra_field = {
    "id": VALID_ID,
    "name": VALID_MULTILANG_NAME,
    "name_string_id": VALID_NAME_STRING_ID,
    "invalid_field": "This should not be allowed",
}

# Optional id test (id can be None)
form_classification_without_id = {
    "name": VALID_MULTILANG_NAME,
    "name_string_id": VALID_NAME_STRING_ID,
}

# Empty MultiLangText
form_classification_empty_multilang = {
    "id": VALID_ID,
    "name": {},
    "name_string_id": VALID_NAME_STRING_ID,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (form_classification_with_valid_fields, None),
        (form_classification_without_id, None),  # id is Optional
        (form_classification_missing_name, ValidationError),
        (form_classification_name_wrong_type, ValidationError),
        (form_classification_id_wrong_type, ValidationError),
        (form_classification_name_string_id_wrong_type, ValidationError),
        (
            form_classification_empty_multilang,
            None,
        ),  # Empty dict is valid MultiLangText
    ],
)
def test_form_classification_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormClassification(**json)
    else:
        try:
            FormClassification(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e


def test_form_classification_list_validation():
    """Test FormClassificationList model"""
    from validation.formsV2_models import FormClassificationList

    valid_list = {
        "classifications": [
            form_classification_with_valid_fields,
            form_classification_without_id,
        ]
    }

    try:
        FormClassificationList(**valid_list)
    except ValidationError as e:
        raise AssertionError(f"Unexpected validation error: {e}") from e

    # Test with invalid classification in list
    invalid_list = {
        "classifications": [
            form_classification_name_wrong_type,
        ]
    }

    with pytest.raises(ValidationError):
        FormClassificationList(**invalid_list)
