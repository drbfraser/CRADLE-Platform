import pytest

from validation.facilities import FacilityValidator
from validation.validation_exception import ValidationExceptionError

valid_json = {
    "name": "H12",
    "phone_number": "444-444-4444",
    "about": "Biggest hospital",
    "type": "HOSPITAL",
}

# name field is missing
missing_field = {
    "phone_number": "444-444-4444",
    "about": "Biggest hospital",
    "type": "HOSPITAL",
}

# name must be string
not_type_string = {
    "name": 7,
    "phone_number": "444-444-4444",
    "about": "Biggest hospital",
    "type": "HOSPITAL",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_json, None),
        (missing_field, ValidationExceptionError),
        (not_type_string, ValidationExceptionError),
    ],
)
def test_validation(json, expectation):
    if type(expectation) is type and issubclass(expectation, Exception):
        with pytest.raises(expectation):
            FacilityValidator.validate(json)
    else:
        try:
            FacilityValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
