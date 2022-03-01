from datetime import datetime, timedelta
import pytest
from validation.referrals import validate

valid_json = {
    "comment": "here is a comment",
    "referralHealthFacilityName": "H0000",
}

invalid_missing_health_facility = {
    "comment": "here is a comment",
}


@pytest.mark.parametrize(
    "json, output",
    [
        (valid_json, type(None)),
        (invalid_missing_health_facility, str),
    ],
)
def test_validation(json, output):
    message = validate(json)
    assert type(message) == output
