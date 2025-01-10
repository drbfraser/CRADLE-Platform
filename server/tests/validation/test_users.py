import pytest
from pydantic import ValidationError

from validation.users import UserModel, UserRegisterValidator

USERNAME = "JaneAdmin"
NAME = "Jane"
EMAIL = "jane@mail.com"
FACILITY = "facility7"
ROLE = "ADMIN"
LIST_OF_INT = [111, 222, 333]
LIST_OF_PHONE_NUMBERS = ["+1-604-321-4567", "+1-604-464-2112", "+1-604-323-3539"]
PASSWORD = "pwd123"
SOME_INTEGER = 12345

user_with_valid_fields_should_return_none = {
    "username": USERNAME,
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_missing_required_field_email_should_throw_exception = {
    "username": USERNAME,
    "name": NAME,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_missing_required_field_health_facility_name_should_throw_exception = {
    "username": USERNAME,
    "name": NAME,
    "email": EMAIL,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_missing_required_field_role_should_throw_exception = {
    "username": USERNAME,
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_missing_required_field_first_name_should_throw_exception = {
    "username": USERNAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_missing_optional_field_supervises_should_return_none = {
    "username": USERNAME,
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_field_first_name_has_invalid_type_should_throw_exception = {
    "username": USERNAME,
    "name": SOME_INTEGER,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_field_email_has_invalid_type_should_throw_exception = {
    "username": USERNAME,
    "name": NAME,
    "email": SOME_INTEGER,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_field_health_facility_name_has_invalid_type_should_throw_exception = {
    "username": USERNAME,
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": SOME_INTEGER,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_field_role_has_invalid_type_should_throw_exception = {
    "username": USERNAME,
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": SOME_INTEGER,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_field_supervises_has_invalid_type_should_throw_exception = {
    "username": USERNAME,
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": SOME_INTEGER,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_field_phone_numbers_has_invalid_type_should_throw_exception = {
    "username": USERNAME,
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": SOME_INTEGER,
}

user_role_is_not_supported_role_should_throw_exception = {
    "username": USERNAME,
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": "patient",
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
}

user_field_phone_numbers_has_invalid_phone_format_should_throw_exception = {
    "username": USERNAME,
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": ["123"],
}


@pytest.mark.parametrize(
    "json, output_type",
    [
        (user_with_valid_fields_should_return_none, type(None)),
        (
            user_missing_required_field_email_should_throw_exception,
            ValidationError,
        ),
        (
            user_missing_required_field_health_facility_name_should_throw_exception,
            ValidationError,
        ),
        (
            user_missing_required_field_role_should_throw_exception,
            ValidationError,
        ),
        (
            user_missing_required_field_first_name_should_throw_exception,
            ValidationError,
        ),
        (user_missing_optional_field_supervises_should_return_none, type(None)),
        (
            user_field_first_name_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_field_email_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_field_health_facility_name_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_field_role_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_field_supervises_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_field_phone_numbers_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_role_is_not_supported_role_should_throw_exception,
            ValidationError,
        ),
        (
            user_field_phone_numbers_has_invalid_phone_format_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validation(json, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            UserModel(**json)
    else:
        try:
            UserModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


user_register_with_valid_fields_should_return_none = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_missing_required_field_username_should_throw_exception = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "password": PASSWORD,
}

user_register_missing_required_field_password_should_throw_exception = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
}

user_register_field_password_has_invalid_type_should_throw_exception = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": SOME_INTEGER,
}

user_register_missing_required_field_email_should_throw_exception = {
    "name": NAME,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_missing_required_field_health_facility_name_should_throw_exception = {
    "name": NAME,
    "email": EMAIL,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_missing_required_field_role_should_throw_exception = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_missing_required_field_first_name_should_throw_exception = {
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_missing_optional_field_supervises_should_return_none = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_field_first_name_has_invalid_type_should_throw_exception = {
    "name": SOME_INTEGER,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_field_email_has_invalid_type_should_throw_exception = {
    "name": NAME,
    "email": SOME_INTEGER,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_field_health_facility_name_has_invalid_type_should_throw_exception = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": SOME_INTEGER,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_field_role_has_invalid_type_should_throw_exception = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": SOME_INTEGER,
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_field_supervises_has_invalid_type_should_throw_exception = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": SOME_INTEGER,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_field_phone_numbers_has_invalid_type_should_throw_exception = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": ROLE,
    "supervises": LIST_OF_INT,
    "phone_numbers": SOME_INTEGER,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_role_is_not_supported_role_should_throw_exception = {
    "name": NAME,
    "email": EMAIL,
    "health_facility_name": FACILITY,
    "role": "patient",
    "supervises": LIST_OF_INT,
    "phone_numbers": LIST_OF_PHONE_NUMBERS,
    "username": USERNAME,
    "password": PASSWORD,
}

user_register_field_phone_numbers_has_invalid_phone_format_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["123"],
    "username": USERNAME,
    "password": "pwd123",
}


@pytest.mark.parametrize(
    "json, output_type",
    [
        (user_register_with_valid_fields_should_return_none, None),
        (
            user_register_missing_required_field_username_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_missing_required_field_password_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_missing_required_field_email_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_missing_required_field_health_facility_name_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_missing_required_field_role_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_missing_required_field_first_name_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_missing_optional_field_supervises_should_return_none,
            None,
        ),
        (
            user_register_field_first_name_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_field_email_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_field_health_facility_name_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_field_role_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_field_supervises_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_field_phone_numbers_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_field_password_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_role_is_not_supported_role_should_throw_exception,
            ValidationError,
        ),
        (
            user_register_field_phone_numbers_has_invalid_phone_format_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_register_validation(json, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            UserRegisterValidator(**json)
    else:
        try:
            UserRegisterValidator(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
