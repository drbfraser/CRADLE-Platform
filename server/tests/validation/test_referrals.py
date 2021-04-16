from datetime import datetime, timedelta
import pytest
from validation.referrals import validate

valid_json = {
    "comment": "here is a comment",
    "readingId": "0af5db8f-60b2-4c66-92d2-82aa08d31fd0",
    "referralHealthFacilityName": "H0000",
}

invalid_missing_reading_id = {
    "comment": "here is a comment",
    "referralHealthFacilityName": "H0000",
}

invalid_missing_health_facility = {
    "comment": "here is a comment",
    "readingId": "0af5db8f-60b2-4c66-92d2-82aa08d31fd0",
}


@pytest.mark.parametrize(
    "json, output",
    [
        (valid_json, type(None)),
        (invalid_missing_reading_id, str),
        (invalid_missing_health_facility, str),
    ],
)
def test_validation(json, output):
    message = validate(json)
    assert type(message) == output
