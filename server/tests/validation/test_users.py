import pytest
from validation.users import validate

valid_json = {
    "firstName": "Jane",
    "email": "jane@mail.com",
    "healthFacilityName": "facility7",
    "role": "admin",
}

# id field is missing
missing_field = {
    "firstName": "Jane",
    "healthFacilityName": "facility7",
    "role": "admin",
}

# id must be int
not_type_str = {
    "firstName": 12345,
    "email": "jane@mail.com",
    "healthFacilityName": "facility7",
    "role": "admin",
}


@pytest.mark.parametrize(
    "json, output",
    [(valid_json, type(None)), (missing_field, str), (not_type_str, str),],
)
def test_validation(json, output):
    message = validate(json)
    assert type(message) == output
