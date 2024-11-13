import pytest

from validation.users import UserRegisterValidator, UserValidator
from validation.validation_exception import ValidationExceptionError

SOME_INTEGER = 12345

user_with_valid_fields_should_return_none = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_missing_required_field_email_should_throw_exception = {
    "name": "Jane",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_missing_required_field_health_facility_name_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_missing_required_field_role_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_missing_required_field_first_name_should_throw_exception = {
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_missing_optional_field_supervises_should_return_none = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_field_first_name_has_invalid_type_should_throw_exception = {
    "name": SOME_INTEGER,
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_field_email_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": SOME_INTEGER,
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_field_health_facility_name_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": SOME_INTEGER,
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_field_role_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": SOME_INTEGER,
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_field_supervises_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": "SOME_INTEGER",
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_field_phone_numbers_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": SOME_INTEGER,
}

user_role_is_not_supported_role_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "patient",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_field_phone_numbers_has_invalid_phone_format_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["123"],
}

user_register_with_valid_fields_should_return_none = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_missing_required_field_password_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
}

user_register_field_password_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": SOME_INTEGER,
}

user_register_field_phone_numbers_has_invalid_phone_format_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["123"],
    "password": "pwd123",
}

user_register_missing_required_field_email_should_throw_exception = {
    "name": "Jane",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_missing_required_field_health_facility_name_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_missing_required_field_role_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_missing_required_field_first_name_should_throw_exception = {
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_missing_optional_field_supervises_should_return_none = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_field_first_name_has_invalid_type_should_throw_exception = {
    "name": SOME_INTEGER,
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_field_email_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": SOME_INTEGER,
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_field_health_facility_name_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": SOME_INTEGER,
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_field_role_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": SOME_INTEGER,
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_field_supervises_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": "SOME_INTEGER",
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_field_phone_numbers_has_invalid_type_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": SOME_INTEGER,
    "password": "pwd123",
}

user_register_role_is_not_supported_role_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "patient",
    "supervises": [111, 222, 333],
    "phone_numbers": ["+1-604-111-1111", "+1-604-222-2222", "+1-604-333-3333"],
    "password": "pwd123",
}

user_register_field_phone_numbers_has_invalid_phone_format_should_throw_exception = {
    "name": "Jane",
    "email": "jane@mail.com",
    "health_facility_name": "facility7",
    "role": "ADMIN",
    "supervises": [111, 222, 333],
    "phone_numbers": ["123"],
    "password": "pwd123",
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


@pytest.mark.parametrize(
    "json, output_type",
    [
        (user_register_with_valid_fields_should_return_none, type(None)),
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
            type(None),
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
