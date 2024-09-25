import pytest

from validation.sms_relay import validate_decrypted_body, validate_request

request_test_cases = [
    {
        "json": {"phoneNumber": "604-715-2845", "encryptedData": "thisdataisencrypted"},
        "output_type": type(None),
    },
    {"json": {"encryptedData": "thisdataisencrypted"}, "output_type": str},
    {
        "json": {
            "phoneNumber": "604-715-2845",
        },
        "output_type": str,
    },
    {
        "json": {
            "phoneNumber": 604 - 715 - 2845,
            "encryptedData": "thisdataisencrypted",
        },
        "output_type": str,
    },
    {
        "json": {"phoneNumber": "604-715-2845", "encryptedData": 1234567890},
        "output_type": str,
    },
    {
        "json": {
            "phoneNumber": "604-715-2845",
            "encryptedData": "thisdataisencrypted",
            "invalid": "invalidkey",
        },
        "output_type": str,
    },
]

decrypted_body_test_cases = [
    {
        "json": {"requestNumber": 12345, "method": "GET", "endpoint": "my/endpoint"},
        "output_type": type(None),
    },
    {"json": {"requestNumber": 12345, "endpoint": "my/endpoint"}, "output_type": str},
    {
        "json": {
            "requestNumber": 12345,
            "method": "GET",
        },
        "output_type": str,
    },
    {"json": {"method": "GET", "endpoint": "my/endpoint"}, "output_type": str},
    {
        "json": {
            "requestNumber": 12345,
            "method": "GET",
            "endpoint": "my/endpoint",
            "invalid": "invalidkey",
        },
        "output_type": str,
    },
    {
        "json": {"requestNumber": "12345", "method": "GET", "endpoint": "my/endpoint"},
        "output_type": type(None),
    },
    {
        "json": {"requestNumber": 12345, "method": 12345, "endpoint": "my/endpoint"},
        "output_type": str,
    },
    {
        "json": {"requestNumber": 12345, "method": "GET", "endpoint": 12345},
        "output_type": str,
    },
]


@pytest.mark.parametrize("test_case", request_test_cases)
def test_validate_request(test_case):
    json_data = test_case["json"]
    output_type = test_case["output_type"]
    message = validate_request(json_data)
    assert type(message) is output_type


@pytest.mark.parametrize("test_case", decrypted_body_test_cases)
def test_validate_decrypted_body(test_case):
    json_data = test_case["json"]
    output_type = test_case["output_type"]
    message = validate_decrypted_body(json_data)
    assert type(message) is output_type
