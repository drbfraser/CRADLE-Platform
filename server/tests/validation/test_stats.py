import pytest
from validation.stats import validate_timestamp, validate_time_frame_readings

valid_json = {"from": "1546702448", "to": "1547212259"}

missing_required_field = {}

invalid_type = {"from": "1546702448", "to": 1547212259}


@pytest.mark.parametrize(
    "json, output",
    [(valid_json, type(None)), (missing_required_field, str), (invalid_type, str)],
)
def test_validate_timestamp(json, output):
    message = validate_timestamp(json)
    assert type(message) == output
