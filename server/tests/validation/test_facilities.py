import pytest

from validation.facilities import FacilityValidator
from validation.validation_exception import ValidationExceptionError

FACILITY_NAME = "H12"
PHONE_NUMBER = "444-444-4444"
LOCATION = "some location"
DESCIPTION = "Biggest hospital"
FACILITY_TYPE = "HOSPITAL"

facility_with_valid_fields_should_return_none = {
    "healthFacilityName": FACILITY_NAME,
    "healthFacilityPhoneNumber": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
    "facilityType": FACILITY_TYPE,
}

facility_missing_optional_field_healthFacilityPhoneNumber_should_return_none = {
    "healthFacilityName": FACILITY_NAME,
    "location": LOCATION,
    "about": DESCIPTION,
    "facilityType": FACILITY_TYPE,
}

facility_missing_optional_field_location_should_return_none = {
    "healthFacilityName": FACILITY_NAME,
    "healthFacilityPhoneNumber": PHONE_NUMBER,
    "about": DESCIPTION,
    "facilityType": FACILITY_TYPE,
}

facility_missing_optional_field_about_should_return_none = {
    "healthFacilityName": FACILITY_NAME,
    "healthFacilityPhoneNumber": PHONE_NUMBER,
    "location": LOCATION,
    "facilityType": FACILITY_TYPE,
}

facility_missing_optional_field_facilityType_should_return_none = {
    "healthFacilityName": FACILITY_NAME,
    "healthFacilityPhoneNumber": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
}

facility_missing_required_field_healthFacilityName_should_throw_exception = {
    "healthFacilityPhoneNumber": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
    "facilityType": FACILITY_TYPE,
}

facility_field_healthFacilityName_has_wrong_type_should_throw_exception = {
    "healthFacilityName": 1,
    "healthFacilityPhoneNumber": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
    "facilityType": FACILITY_TYPE,
}

facility_field_healthFacilityPhoneNumber_has_wrong_type_should_throw_exception = {
    "healthFacilityName": FACILITY_NAME,
    "healthFacilityPhoneNumber": 1,
    "location": 1,
    "about": DESCIPTION,
    "facilityType": FACILITY_TYPE,
}

facility_field_location_has_wrong_type_should_throw_exception = {
    "healthFacilityName": FACILITY_NAME,
    "healthFacilityPhoneNumber": PHONE_NUMBER,
    "location": 1,
    "about": DESCIPTION,
    "facilityType": FACILITY_TYPE,
}

facility_field_about_has_wrong_type_should_throw_exception = {
    "healthFacilityName": FACILITY_NAME,
    "healthFacilityPhoneNumber": PHONE_NUMBER,
    "location": LOCATION,
    "about": 1,
    "facilityType": FACILITY_TYPE,
}

facility_field_facilityType_has_wrong_type_should_throw_exception = {
    "healthFacilityName": FACILITY_NAME,
    "healthFacilityPhoneNumber": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
    "facilityType": 1,
}

facility_field_facilityType_is_not_FacilityTypeEnum_should_throw_exception = {
    "healthFacilityName": FACILITY_NAME,
    "healthFacilityPhoneNumber": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
    "facilityType": "wrong FacilityTypeEnum",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (facility_with_valid_fields_should_return_none, None),
        (
            facility_missing_optional_field_healthFacilityPhoneNumber_should_return_none,
            None,
        ),
        (facility_missing_optional_field_location_should_return_none, None),
        (facility_missing_optional_field_about_should_return_none, None),
        (facility_missing_optional_field_facilityType_should_return_none, None),
        (
            facility_missing_required_field_healthFacilityName_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            facility_field_healthFacilityName_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            facility_field_healthFacilityPhoneNumber_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            facility_field_location_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            facility_field_about_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            facility_field_facilityType_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            facility_field_facilityType_is_not_FacilityTypeEnum_should_throw_exception,
            ValidationExceptionError,
        ),
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
