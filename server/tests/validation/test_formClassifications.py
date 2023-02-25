import pytest
from validation.formClassifications import validate_template

valid_json = {"id": "123", "name": "test-name"}

missing_field = {"id": "123"}

not_type_string = {"id": 123, "name": "test-name"}

invalid_keys = {"id": "123", "name": "test-name", "invalid": "This should be invalid"}


@pytest.mark.parametrize(
    "json, output",
    [
        (valid_json, type(None)),
        (missing_field, str),
        (not_type_string, str),
        (invalid_keys, str),
    ],
)
def test_validate_template(json, output):
    message = validate_template(json)
    assert type(message) == output
