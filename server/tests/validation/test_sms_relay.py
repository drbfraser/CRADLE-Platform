import pytest

from validation.sms_relay import SmsRelayDecryptedBodyValidator, SmsRelayValidator
from validation.validation_exception import ValidationExceptionError

PHONE_NUMBER = "604-715-2845"
ENCRYPTED_DATA = "thisdataisencrypted"
REQUEST_NUMBER = 12345
METHOD = "GET"
ENDPOINT = "my/endpoint"
HEADER = "header example"
BODY = "body example"

sms_relay_with_valid_fields_should_return_none = {
    "phoneNumber": PHONE_NUMBER,
    "encryptedData": ENCRYPTED_DATA,
}

sms_relay_missing_required_field_phoneNumber_should_throw_exception = {
    "encryptedData": ENCRYPTED_DATA,
}

sms_relay_missing_required_field_encryptedData_should_throw_exception = {
    "phoneNumber": PHONE_NUMBER,
}

sms_relay_field_phoneNumber_has_invalid_type_should_throw_exception = {
    "phoneNumber": 604 - 715 - 2845,
    "encryptedData": ENCRYPTED_DATA,
}

sms_relay_field_encryptedData_has_invalid_type_should_throw_exception = {
    "phoneNumber": PHONE_NUMBER,
    "encryptedData": 1234567890,
}

sms_relay_has_invalid_extra_field_should_throw_exception = {
    "phoneNumber": PHONE_NUMBER,
    "encryptedData": ENCRYPTED_DATA,
    "invalid": "invalidkey",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (sms_relay_with_valid_fields_should_return_none, None),
        (
            sms_relay_missing_required_field_phoneNumber_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_missing_required_field_encryptedData_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_field_phoneNumber_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_field_encryptedData_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_has_invalid_extra_field_should_throw_exception,
            ValidationExceptionError,
        ),
    ],
)
def test_validate_request(json, expectation):
    if type(expectation) is type and issubclass(expectation, Exception):
        with pytest.raises(expectation):
            SmsRelayValidator.validate_request(json)
    else:
        try:
            SmsRelayValidator.validate_request(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


sms_relay_decrypted_body_with_valid_fields_should_return_none = {
    "requestNumber": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_missing_optional_fields_should_return_none = {
    "requestNumber": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": ENDPOINT,
}

sms_relay_decrypted_body_missing_required_field_requestNumber_should_throw_exception = {
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_missing_required_field_method_should_throw_exception = {
    "requestNumber": REQUEST_NUMBER,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_missing_required_field_endpoint_should_throw_exception = {
    "requestNumber": REQUEST_NUMBER,
    "method": METHOD,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_field_requestNumber_is_number_of_type_string_should_return_none = {
    "requestNumber": "12345",
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_field_requestNumber_has_wrong_type_should_throw_exception = {
    "requestNumber": "string",
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_field_method_has_wrong_type_should_throw_exception = {
    "requestNumber": REQUEST_NUMBER,
    "method": "method",
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_field_endpoint_has_wrong_type_should_throw_exception = {
    "requestNumber": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": 123,
    "headers": HEADER,
    "body": BODY,
}

sms_relay_decrypted_body_field_header_has_wrong_type_should_throw_exception = {
    "requestNumber": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": 123,
    "body": BODY,
}

sms_relay_decrypted_body_field_body_has_wrong_type_should_throw_exception = {
    "requestNumber": REQUEST_NUMBER,
    "method": METHOD,
    "endpoint": ENDPOINT,
    "headers": HEADER,
    "body": 123,
}

sms_relay_decrypted_body_has_unallowed_extra_field_should_throw_exception = {
    "requestNumber": REQUEST_NUMBER,
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
            sms_relay_decrypted_body_missing_required_field_requestNumber_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_decrypted_body_missing_required_field_method_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_decrypted_body_missing_required_field_endpoint_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_decrypted_body_field_requestNumber_is_number_of_type_string_should_return_none,
            None,
        ),
        (
            sms_relay_decrypted_body_field_requestNumber_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_decrypted_body_field_method_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_decrypted_body_field_endpoint_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_decrypted_body_field_header_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_decrypted_body_field_body_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            sms_relay_decrypted_body_has_unallowed_extra_field_should_throw_exception,
            ValidationExceptionError,
        ),
    ],
)
def test_validate_decrypted_body(json, expectation):
    if type(expectation) is type and issubclass(expectation, Exception):
        with pytest.raises(expectation):
            SmsRelayDecryptedBodyValidator.validate(json)
    else:
        try:
            SmsRelayDecryptedBodyValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
