import pytest

from validation.formClassifications import validate_template
from validation.validation_exception import ValidationExceptionError

valid_json = {"id": "123", "name": "test-name"}

missing_field = {"id": "123"}

not_type_string = {"id": 123, "name": "test-name"}

invalid_keys = {"id": "123", "name": "test-name", "invalid": "This should be invalid"}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_json, None),
        (missing_field, ValidationExceptionError),
        (not_type_string, ValidationExceptionError),
        (invalid_keys, ValidationExceptionError),
    ],
)
def test_validate_template(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            validate_template(json)
    else:
        message = validate_template(json)
        assert message is None, f"Expected None, but got {message}"
