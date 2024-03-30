import pytest
from validation.sms_relay import validate_request, validate_decrypted_body

request_test_cases = [
    {
        "json": {"phoneNumber": "604-715-2845", "encryptedData": "thisdataisencrypted"},
        "output": type(None),
    },
    {"json": {"encryptedData": "thisdataisencrypted"}, "output": str},
    {"json": {"phoneNumber": "604-715-2845",}, "output": str},
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
]


@pytest.mark.parametrize("test_case", request_test_cases)
def test_validate_request(test_case):
    json_data = test_case["json"]
    output = test_case["output"]
    message = validate_request(json_data)
    assert type(message) == output
