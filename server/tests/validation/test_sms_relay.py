import pytest
from pydantic import ValidationError

from validation.sms_relay import SmsRelayDecryptedBodyValidator, SmsRelayValidator

PHONE_NUMBER = "+1-604-715-2845"
ENCRYPTED_DATA = "thisdataisencrypted"
REQUEST_NUMBER = 12345
METHOD = "GET"
ENDPOINT = "my/endpoint"
HEADER = {"header": "example"}
BODY = "body example"

sms_relay_with_valid_fields_should_return_none = {
    "phone_number": PHONE_NUMBER,
    "encrypted_data": ENCRYPTED_DATA,
}

sms_relay_missing_required_field_phone_number_should_throw_exception = {
    "encrypted_data": ENCRYPTED_DATA,
}

sms_relay_missing_required_field_encrypted_data_should_throw_exception = {
    "phone_number": PHONE_NUMBER,
}

sms_relay_field_phone_number_has_invalid_type_should_throw_exception = {
    "phone_number": 604 - 715 - 2845,
    "encrypted_data": ENCRYPTED_DATA,
}

sms_relay_field_encrypted_data_has_invalid_type_should_throw_exception = {
    "phone_number": PHONE_NUMBER,
    "encrypted_data": 1234567890,
}

sms_relay_has_invalid_extra_field_should_throw_exception = {
    "phone_number": PHONE_NUMBER,
    "encrypted_data": ENCRYPTED_DATA,
    "invalid": "invalid_key",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (sms_relay_with_valid_fields_should_return_none, None),
        (
            sms_relay_missing_required_field_phone_number_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_missing_required_field_encrypted_data_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_field_phone_number_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_field_encrypted_data_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_has_invalid_extra_field_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validate_request(json, expectation):
    if type(expectation) is type and issubclass(expectation, Exception):
        with pytest.raises(expectation):
            SmsRelayValidator(**json)
    else:
        try:
            SmsRelayValidator(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


sms_relay_decrypted_body_with_valid_fields_should_return_none = {
    "request_number": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_missing_optional_fields_should_return_none = {
    "request_number": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": ENDPOINT,
}

sms_relay_decrypted_body_missing_required_field_request_number_should_throw_exception = {
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_missing_required_field_method_should_throw_exception = {
    "request_number": REQUEST_NUMBER,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_missing_required_field_endpoint_should_throw_exception = {
    "request_number": REQUEST_NUMBER,
    "method": METHOD,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_field_request_number_is_number_of_type_string_should_return_none = {
    "request_number": "12345",
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_field_request_number_has_wrong_type_should_throw_exception = {
    "request_number": "string",
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_field_method_has_wrong_type_should_throw_exception = {
    "request_number": REQUEST_NUMBER,
    "method": "method",
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_field_endpoint_has_wrong_type_should_throw_exception = {
    "request_number": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": 123,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_field_header_has_wrong_type_should_throw_exception = {
    "request_number": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": 123,
    "body": BODY,
}

sms_relay_decrypted_body_field_body_has_wrong_type_should_throw_exception = {
    "request_number": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": 123,
}

sms_relay_decrypted_body_has_unallowed_extra_field_should_throw_exception = {
    "request_number": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
    "extra": 123,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (sms_relay_decrypted_body_with_valid_fields_should_return_none, None),
        (sms_relay_decrypted_body_missing_optional_fields_should_return_none, None),
        (
            sms_relay_decrypted_body_missing_required_field_request_number_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_decrypted_body_missing_required_field_method_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_decrypted_body_missing_required_field_endpoint_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_decrypted_body_field_request_number_is_number_of_type_string_should_return_none,
            None,
        ),
        (
            sms_relay_decrypted_body_field_request_number_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_decrypted_body_field_method_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_decrypted_body_field_endpoint_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_decrypted_body_field_header_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_decrypted_body_field_body_has_wrong_type_should_throw_exception,
            ValidationError,
        ),
        (
            sms_relay_decrypted_body_has_unallowed_extra_field_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validate_decrypted_body(json, expectation):
    if type(expectation) is type and issubclass(expectation, Exception):
        with pytest.raises(expectation):
            SmsRelayDecryptedBodyValidator(**json)
    else:
        try:
            SmsRelayDecryptedBodyValidator(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e
