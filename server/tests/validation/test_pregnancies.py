import pytest
from validation.pregnancies import (
    validate_post_request,
    validate_put_request,
    __validate,
)

valid_json = {
    "patientId": 120000,
    "pregnancyStartDate": 1620000002,
    "gestationalAgeUnit": "WEEKS",
    "pregnancyEndDate": 1620000002,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

valid_missing_id = {
    "pregnancyStartDate": 1620000002,
    "gestationalAgeUnit": "WEEKS",
    "pregnancyEndDate": 1620000002,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

invalid_missing_required = {
    "patientId": 120000,
    "pregnancyStartDate": 1620000002,
    "pregnancyEndDate": 1620000002,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

invalid_incorrect_type = {
    "patientId": 120000,
    "pregnancyStartDate": "temp",
    "gestationalAgeUnit": "WEEKS",
    "pregnancyEndDate": 1620000002,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}


@pytest.mark.parametrize(
    "json, patient_id, output",
    [
        (valid_json, valid_json.get("patientId"), type(None)),
        (valid_missing_id, None, type(None)),
        (invalid_missing_required, invalid_missing_required.get("patientId"), str),
        (invalid_incorrect_type, invalid_incorrect_type.get("patientId"), str),
    ],
)
def test_validate_post_request(json, patient_id, output):
    message = validate_post_request(json, patient_id)
    assert type(message) == output
