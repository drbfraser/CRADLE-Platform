import pytest

from validation.stats import Timeframe, Timestamp
from validation.validation_exception import ValidationExceptionError

valid_json = {"from": "1546702448", "to": "1547212259"}

missing_required_field = {}

invalid_type = {"from": "1546702448", "to": 1547212259}

valid_timeframe = {
    "timeframe": {
        "from": "1546702448",
        "to": "1547212259",
    },
}

timeframe_with_invalid_json = {
    "timeframe": {
        "from": "1546702448",
        "to": 1547212259,
    },
}

missing_timeframe_field = {}


@pytest.mark.parametrize(
    "json, output_type",
    [
        (valid_json, None),
        (missing_required_field, ValidationExceptionError),
        (invalid_type, ValidationExceptionError),
    ],
)
def test_validate_timestamp(json, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            Timestamp.validate_timestamp(json)
    else:
        try:
            Timestamp.validate_timestamp(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


@pytest.mark.parametrize(
    "json, output_type",
    [
        (valid_timeframe, None),
        (timeframe_with_invalid_json, ValidationExceptionError),
        (missing_timeframe_field, ValidationExceptionError),
    ],
)
def test_validate_validate_time_frame_readings(json, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            Timeframe.validate_time_frame_readings(json)
    else:
        try:
            Timeframe.validate_time_frame_readings(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
