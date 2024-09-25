import pytest

from validation.users import validate

test_cases = [
    {
        "json": {
            "firstName": "Jane",
            "email": "jane@mail.com",
            "healthFacilityName": "facility7",
            "role": "admin",
        },
        "output_type": type(None),
    },
    {
        "json": {
            "email": "jane@mail.com",
            "healthFacilityName": "facility7",
            "role": "admin",
        },
        "output_type": str,
    },
    {
        "json": {
            "firstName": "Jane",
            "healthFacilityName": "facility7",
            "role": "admin",
        },
        "output_type": str,
    },
    {
        "json": {
            "firstName": "Jane",
            "email": "jane@mail.com",
            "role": "admin",
        },
        "output_type": str,
    },
    {
        "json": {
            "firstName": "Jane",
            "email": "jane@mail.com",
            "healthFacilityName": "facility7",
        },
        "output_type": str,
    },
    {
        "json": {
            "firstName": 12345,
            "email": "jane@mail.com",
            "healthFacilityName": "facility7",
            "role": "admin",
        },
        "output_type": str,
    },
    {
        "json": {
            "firstName": "Jane",
            "email": 12345,
            "healthFacilityName": "facility7",
            "role": "admin",
        },
        "output_type": str,
    },
    {
        "json": {
            "firstName": "Jane",
            "email": "jane@mail.com",
            "healthFacilityName": 12345,
            "role": "admin",
        },
        "output_type": str,
    },
    {
        "json": {
            "firstName": "Jane",
            "email": "jane@mail.com",
            "healthFacilityName": "facility7",
            "role": 12345,
        },
        "output_type": str,
    },
]


@pytest.mark.parametrize("test_case", test_cases)
def test_validation(test_case):
    json_data = test_case["json"]
    output_type = test_case["output_type"]
    message = validate(json_data)
    assert type(message) is output_type
