import pytest
from validation.sms_relay import validate_request, validate_decrypted_body

request_test_cases = [
    {
        "json": {"phoneNumber": "604-715-2845", "encryptedData": "thisdataisencrypted"},
        "output": type(None),
    },
    {"json": {"encryptedData": "thisdataisencrypted"}, "output": str},
    {"json": {"phoneNumber": "604-715-2845",}, "output": str,},
    {
        "json": {
            "phoneNumber": 604 - 715 - 2845,
            "encryptedData": "thisdataisencrypted",
        },
        "output": str,
    },
    {
        "json": {"phoneNumber": "604-715-2845", "encryptedData": 1234567890},
        "output": str,
    },
    {
        "json": {
            "phoneNumber": "604-715-2845",
            "encryptedData": "thisdataisencrypted",
            "invalid": "invalidkey",
        },
        "output": str,
    },
]

decrypted_body_test_cases = [
    {
        "json": {"requestNumber": "12345", "method": "GET", "endpoint": "my/endpoint"},
        "output": type(None),
    },
    {"json": {"requestNumber": "12345", "endpoint": "my/endpoint"}, "output": str},
    {"json": {"requestNumber": "12345", "method": "GET",}, "output": str,},
    {"json": {"method": "GET", "endpoint": "my/endpoint"}, "output": str},
    {
        "json": {
            "requestNumber": "12345",
            "method": "GET",
            "endpoint": "my/endpoint",
            "invalid": "invalidkey",
        },
        "output": str,
    },
    {
        "json": {"requestNumber": 12345, "method": "GET", "endpoint": "my/endpoint"},
        "output": str,
    },
    {
        "json": {"requestNumber": "12345", "method": 12345, "endpoint": "my/endpoint"},
        "output": str,
    },
    {
        "json": {"requestNumber": "12345", "method": "GET", "endpoint": 12345},
        "output": str,
    },
]


@pytest.mark.parametrize("test_case", request_test_cases)
def test_validate_request(test_case):
    json_data = test_case["json"]
    output = test_case["output"]
    message = validate_request(json_data)
    assert type(message) == output


@pytest.mark.parametrize("test_case", decrypted_body_test_cases)
def test_validate_decrypted_body(test_case):
    json_data = test_case["json"]
    output = test_case["output"]
    message = validate_decrypted_body(json_data)
    assert type(message) == output
