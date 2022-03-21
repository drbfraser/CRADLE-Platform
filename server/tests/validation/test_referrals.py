from datetime import datetime, timedelta
import pytest
from validation.referrals import validate

valid_json = {
    "patientId": "49300028161",
    "comment": "here is a comment",
    "referralHealthFacilityName": "H0000",
}

invalid_missing_health_facility = {
    "patientId": "49300028161",
    "comment": "here is a comment",
}

invalid_missing_patient_id = {
    "comment": "here is a comment",
    "referralHealthFacilityName": "H0000",
}


@pytest.mark.parametrize(
    "json, output",
    [
        (valid_json, type(None)),
        (invalid_missing_health_facility, str),
        (invalid_missing_patient_id, str),
    ],
)
def test_validation(json, output):
    message = validate(json)
    assert type(message) == output
