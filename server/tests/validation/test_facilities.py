import pytest

from validation.facilities import Facility
from validation.validation_exception import ValidationException

valid_json = {
    "healthFacilityName": "H12",
    "healthFacilityPhoneNumber": "444-444-4444",
    "about": "Biggest hospital",
    "facilityType": "HOSPITAL",
}

# healthFacilityName field is missing
missing_field = {
    "healthFacilityPhoneNumber": "444-444-4444",
    "about": "Biggest hospital",
    "facilityType": "HOSPITAL",
}

# healthFacilityName must be string
not_type_string = {
    "healthFacilityName": 7,
    "healthFacilityPhoneNumber": "444-444-4444",
    "about": "Biggest hospital",
    "facilityType": "HOSPITAL",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_json, None),
        (missing_field, ValidationException),
        (not_type_string, ValidationException),
    ],
)
def test_validation(json, expectation):
    if type(expectation) == type and issubclass(expectation, Exception):
        with pytest.raises(expectation):
            Facility.validate(json)
    else:
        try:
            Facility.validate(json)
        except Exception as exception:
            assert False, "exception is raised when it doesn't expect one"
