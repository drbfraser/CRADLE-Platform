import pytest
from validation.users import validate

valid_json = {
    "id": 12345,
    "firstName": "Jane",
    "username": "janedoe",
    "email": "jane@mail.com",
    "password": "12345",
    "role": "admin",
}

# id field is missing
missing_field = {
    "firstName": "Jane",
    "username": "janedoe",
    "email": "jane@mail.com",
    "password": "12345",
    "role": "admin",
}

# id must be int
not_type_int = {
    "id": "12345",
    "firstName": "Jane",
    "username": "janedoe",
    "email": "jane@mail.com",
    "password": "12345",
    "role": "admin",
}


@pytest.mark.parametrize(
    "json, output",
    [
        (valid_json, type(None)),
        (missing_field, str),
        (not_type_int, str),
    ],
)
def test_validation(json, output):
    message = validate(json)
    assert type(message) == output
