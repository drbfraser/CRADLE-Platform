import pytest

from validation.stats import validate_time_frame_readings, validate_timestamp

valid_json = {"from": "1546702448", "to": "1547212259"}

missing_required_field = {}

invalid_type = {"from": "1546702448", "to": 1547212259}


@pytest.mark.parametrize(
    "json, output_type",
    [(valid_json, type(None)), (missing_required_field, str), (invalid_type, str)],
)
def test_validate_timestamp(json, output_type):
    message = validate_timestamp(json)
    assert type(message) is output_type


valid_timeframe = {"timeframe": valid_json}
timeframe_with_invalid_json = {"timeframe": missing_required_field}
missing_timeframe_field = {}


@pytest.mark.parametrize(
    "json, output_type",
    [
        (valid_timeframe, type(None)),
        (timeframe_with_invalid_json, str),
        (missing_timeframe_field, str),
    ],
)
def test_validate_validate_time_frame_readings(json, output_type):
    message = validate_time_frame_readings(json)
    assert type(message) is output_type
