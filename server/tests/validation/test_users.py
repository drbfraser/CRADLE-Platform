import pytest

from validation.users import UserRegisterValidator, UserValidator
from validation.validation_exception import ValidationExceptionError

FIRST_NAME = "Jane"
EMAIL = "jane@mail.com"
FACILITY = "facility7"
ROLE = "ADMIN"
LIST_OF_INT = [111, 222, 333]
LIST_OF_PHONE_NUMBERS = ["604-111-1111", "604-222-2222", "604-333-3333"]
PASSWORD = "pwd123"
SOME_INTEGER = 12345

user_with_valid_fields_should_return_none = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_missing_required_field_email_should_throw_exception = {
    "firstName": FIRST_NAME,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_missing_required_field_health_facility_name_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_missing_required_field_role_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_missing_required_field_first_name_should_throw_exception = {
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_missing_optional_field_supervises_should_return_none = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_field_first_name_has_invalid_type_should_throw_exception = {
    "firstName": SOME_INTEGER,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_field_email_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": SOME_INTEGER,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_field_health_facility_name_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": SOME_INTEGER,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_field_role_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": SOME_INTEGER,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_field_supervises_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": SOME_INTEGER,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_field_phone_numbers_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": SOME_INTEGER,
}

user_role_is_not_supported_role_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": "patient",
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_field_phone_numbers_has_invalid_phone_format_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": ["123"],
}


@pytest.mark.parametrize(
    "json, output_type",
    [
        (user_with_valid_fields_should_return_none, type(None)),
        (
            user_missing_required_field_email_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_missing_required_field_health_facility_name_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_missing_required_field_role_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_missing_required_field_first_name_should_throw_exception,
            ValidationExceptionError,
        ),
        (user_missing_optional_field_supervises_should_return_none, type(None)),
        (
            user_field_first_name_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_field_email_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_field_health_facility_name_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_field_role_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_field_supervises_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_field_phone_numbers_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_role_is_not_supported_role_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_field_phone_numbers_has_invalid_phone_format_should_throw_exception,
            ValidationExceptionError,
        ),
    ],
)
def test_validation(json, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            UserValidator.validate(json)
    else:
        try:
            UserValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


user_register_with_valid_fields_should_return_none = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_missing_required_field_password_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
}

user_register_field_password_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": SOME_INTEGER,
}

user_register_missing_required_field_email_should_throw_exception = {
    "firstName": FIRST_NAME,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_missing_required_field_health_facility_name_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_missing_required_field_role_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_missing_required_field_first_name_should_throw_exception = {
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_missing_optional_field_supervises_should_return_none = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_field_first_name_has_invalid_type_should_throw_exception = {
    "firstName": SOME_INTEGER,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_field_email_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": SOME_INTEGER,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_field_health_facility_name_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": SOME_INTEGER,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_field_role_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": SOME_INTEGER,
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_field_supervises_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": SOME_INTEGER,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_field_phone_numbers_has_invalid_type_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phoneNumbers": SOME_INTEGER,
    "password": PASSWORD,
}

user_register_role_is_not_supported_role_should_throw_exception = {
    "firstName": FIRST_NAME,
    "email": EMAIL,
    "healthFacilityName": FACILITY,
    "role": "patient",
    "supervises": LIST_OF_INT,
    "phoneNumbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_field_phone_numbers_has_invalid_phone_format_should_throw_exception = {
    "firstName": "Jane",
    "email": "jane@mail.com",
    "healthFacilityName": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phoneNumbers": ["123"],
    "password": "pwd123",
}


@pytest.mark.parametrize(
    "json, output_type",
    [
        (user_register_with_valid_fields_should_return_none, None),
        (
            user_register_missing_required_field_password_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_missing_required_field_email_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_missing_required_field_health_facility_name_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_missing_required_field_role_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_missing_required_field_first_name_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_missing_optional_field_supervises_should_return_none,
            None,
        ),
        (
            user_register_field_first_name_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_field_email_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_field_health_facility_name_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_field_role_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_field_supervises_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_field_phone_numbers_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_field_password_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_role_is_not_supported_role_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            user_register_field_phone_numbers_has_invalid_phone_format_should_throw_exception,
            ValidationExceptionError,
        ),
    ],
)
def test_register_validation(json, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            UserRegisterValidator.validate(json)
    else:
        try:
            UserRegisterValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
