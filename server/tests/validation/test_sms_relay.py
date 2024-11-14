import pytest

from validation.sms_relay import SmsRelayDecryptedBodyValidator, SmsRelayValidator
from validation.validation_exception import ValidationExceptionError

valid_sms_relay_request = {
    "phone_number": "+1-604-715-2845",
    "encrypted_data": "thisdataisencrypted",
}

invalid_missing_field_phone_number = {
    "encrypted_data": "thisdataisencrypted",
}

invalid_missing_field_encrypted_data = {
    "phone_number": "+1-604-715-2845",
}

invalid_field_type_phone_number = {
    "phone_number": 604 - 715 - 2845,
    "encrypted_data": "thisdataisencrypted",
}

invalid_field_type_encrypted_data = {
    "phone_number": "+1-604-715-2845",
    "encrypted_data": 1234567890,
}

invalid_extra_field_for_sms_relay_request = {
    "phone_number": "+1-604-715-2845",
    "encrypted_data": "thisdataisencrypted",
    "invalid": "invalidkey",
}

valid_sms_relay_decrypted_body_with_int_request_number = {
    "request_number": 12345,
    "method": "GET",
    "endpoint": "my/endpoint",
}

valid_sms_relay_decrypted_body_with_str_request_number = {
    "request_number": "12345",
    "method": "GET",
    "endpoint": "my/endpoint",
}

invalid_missing_field_method = {
    "request_number": 12345,
    "endpoint": "my/endpoint",
}

invalid_missing_field_endpoint = {
    "request_number": 12345,
    "method": "GET",
}

invalid_missing_field_request_number = {
    "method": "GET",
    "endpoint": "my/endpoint",
}

invalid_extra_field_for_decrypted_body = {
    "request_number": 12345,
    "method": "GET",
    "endpoint": "my/endpoint",
    "invalid": "invalidkey",
}

invalid_field_type_method = {
    "request_number": 12345,
    "method": 12345,
    "endpoint": "my/endpoint",
}

invalid_field_type_endpoint = {
    "request_number": 12345,
    "method": "GET",
    "endpoint": 12345,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_sms_relay_request, type(None)),
        (invalid_missing_field_phone_number, ValidationExceptionError),
        (invalid_missing_field_encrypted_data, ValidationExceptionError),
        (invalid_field_type_phone_number, ValidationExceptionError),
        (invalid_field_type_encrypted_data, ValidationExceptionError),
        (invalid_extra_field_for_sms_relay_request, ValidationExceptionError),
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


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_sms_relay_decrypted_body_with_int_request_number, type(None)),
        (valid_sms_relay_decrypted_body_with_str_request_number, type(None)),
        (invalid_missing_field_method, ValidationExceptionError),
        (invalid_missing_field_endpoint, ValidationExceptionError),
        (invalid_missing_field_request_number, ValidationExceptionError),
        (invalid_extra_field_for_decrypted_body, ValidationExceptionError),
        (invalid_field_type_method, ValidationExceptionError),
        (invalid_field_type_endpoint, ValidationExceptionError),
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
