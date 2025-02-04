import pytest
from pydantic import ValidationError

from validation.formClassifications import FormClassificationModel

ID = "123"
NAME = "test-name"

form_classification_with_valid_fields_should_return_none = {"name": NAME, "id": ID}

form_classification_missing_required_field_name_should_throw_exception = {"id": ID}

form_classification_field_name_has_wrong_type_should_throw_exception = {
    "name": 123,
    "id": ID,
}

form_classification_field_id_has_wrong_type_should_throw_exception = {
    "name": NAME,
    "id": 123,
}

form_classification_has_invalid_extra_field_should_throw_exception = {
    "name": NAME,
    "id": 123,
    "invalid": "This should be invalid",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (form_classification_with_valid_fields_should_return_none, None),
        (
            form_classification_missing_required_field_name_should_throw_exception,
            ValidationError,
        ),
        (
            form_classification_field_name_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            form_classification_field_id_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            form_classification_has_invalid_extra_field_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validate_template(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            FormClassificationModel(**json)
    else:
        try:
            FormClassificationModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
