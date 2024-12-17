import pytest

from validation.facilities import FacilityValidator
from validation.validation_exception import ValidationExceptionError

FACILITY_NAME = "H12"
PHONE_NUMBER = "+1-604-715-2845"
LOCATION = "some location"
DESCIPTION = "Biggest hospital"
FACILITY_TYPE = "HOSPITAL"

facility_with_valid_fields_should_return_none = {
    "name": FACILITY_NAME,
    "phone_number": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
    "type": FACILITY_TYPE,
}

facility_missing_optional_field_phone_number_should_return_none = {
    "name": FACILITY_NAME,
    "location": LOCATION,
    "about": DESCIPTION,
    "type": FACILITY_TYPE,
}

facility_missing_optional_field_location_should_return_none = {
    "name": FACILITY_NAME,
    "phone_number": PHONE_NUMBER,
    "about": DESCIPTION,
    "type": FACILITY_TYPE,
}

facility_missing_optional_field_about_should_return_none = {
    "name": FACILITY_NAME,
    "phone_number": PHONE_NUMBER,
    "location": LOCATION,
    "type": FACILITY_TYPE,
}

facility_missing_optional_field_type_should_return_none = {
    "name": FACILITY_NAME,
    "phone_number": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
}

facility_missing_required_field_name_should_throw_exception = {
    "phone_number": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
    "type": FACILITY_TYPE,
}

facility_field_name_has_wrong_type_should_throw_exception = {
    "name": 1,
    "phone_number": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
    "type": FACILITY_TYPE,
}

facility_field_phone_number_has_wrong_type_should_throw_exception = {
    "name": FACILITY_NAME,
    "phone_number": 1,
    "location": 1,
    "about": DESCIPTION,
    "type": FACILITY_TYPE,
}

facility_field_location_has_wrong_type_should_throw_exception = {
    "name": FACILITY_NAME,
    "phone_number": PHONE_NUMBER,
    "location": 1,
    "about": DESCIPTION,
    "type": FACILITY_TYPE,
}

facility_field_about_has_wrong_type_should_throw_exception = {
    "name": FACILITY_NAME,
    "phone_number": PHONE_NUMBER,
    "location": LOCATION,
    "about": 1,
    "type": FACILITY_TYPE,
}

facility_field_type_has_wrong_type_should_throw_exception = {
    "name": FACILITY_NAME,
    "phone_number": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
    "type": 1,
}

facility_field_type_is_not_FacilityTypeEnum_should_throw_exception = {
    "name": FACILITY_NAME,
    "phone_number": PHONE_NUMBER,
    "location": LOCATION,
    "about": DESCIPTION,
    "type": "wrong FacilityTypeEnum",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (facility_with_valid_fields_should_return_none, None),
        (
            facility_missing_optional_field_phone_number_should_return_none,
            None,
        ),
        (facility_missing_optional_field_location_should_return_none, None),
        (facility_missing_optional_field_about_should_return_none, None),
        (facility_missing_optional_field_type_should_return_none, None),
        (
            facility_missing_required_field_name_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            facility_field_name_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            facility_field_phone_number_has_wrong_type_should_throw_exception,
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
            facility_field_type_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            facility_field_type_is_not_FacilityTypeEnum_should_throw_exception,
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
