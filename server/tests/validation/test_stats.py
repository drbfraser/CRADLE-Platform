import pytest

from validation.stats import Timeframe, Timestamp
from validation.validation_exception import ValidationExceptionError

# unix epoch code for Monday, January 1, 2024 12:00:00 AM
FROM_TIMESTAMP = "1704067200"
# unix epoch code for Friday, February 2, 2024 12:00:00 AM
TO_TIMESTAMP = "1729744672"
FROM_TIMESTAMP_INTEGER = 1547212259
TO_TIMESTAMP_INTEGER = 1729744672

timestamp_with_valid_fields_should_return_none = {
    "from": FROM_TIMESTAMP,
    "to": TO_TIMESTAMP,
}

timestamp_missing_field_from_should_throw_exception = {"to": TO_TIMESTAMP}

timestamp_missing_field_to_should_throw_exception = {"from": FROM_TIMESTAMP}

timestamp_missing_all_fields_should_throw_exception = {}

timestamp_field_from_has_wrong_type_shoud_throw_exception = {
    "from": FROM_TIMESTAMP_INTEGER,
    "to": TO_TIMESTAMP,
}

timestamp_field_to_has_wrong_type_should_throw_exception = {
    "from": FROM_TIMESTAMP,
    "to": TO_TIMESTAMP_INTEGER,
}

timeframe_with_valid_fields_return_none = {
    "timeframe": {
        "from": FROM_TIMESTAMP,
        "to": TO_TIMESTAMP,
    },
}

timeframe_field_to_has_invalid_type_should_throw_exception = {
    "timeframe": {
        "from": FROM_TIMESTAMP,
        "to": TO_TIMESTAMP_INTEGER,
    },
}

timeframe_field_from_has_invalid_type_should_throw_exception = {
    "timeframe": {
        "from": FROM_TIMESTAMP_INTEGER,
        "to": TO_TIMESTAMP,
    },
}

timeframe_missing_all_fields_should_thrown_exception = {}

timeframe_missing_field_to_should_throw_exception = {
    "timeframe": {
        "from": FROM_TIMESTAMP_INTEGER,
    },
}

timeframe_missing_field_from_should_throw_exception = {
    "timeframe": {
        "to": TO_TIMESTAMP,
    },
}

timeframe_missing_field_from_and_to_should_throw_exception = {
    "timeframe": {},
}


@pytest.mark.parametrize(
    "json, output_type",
    [
        (timestamp_with_valid_fields_should_return_none, None),
        (timestamp_missing_field_from_should_throw_exception, ValidationExceptionError),
        (timestamp_missing_field_to_should_throw_exception, ValidationExceptionError),
        (timestamp_missing_all_fields_should_throw_exception, ValidationExceptionError),
        (
            timestamp_field_from_has_wrong_type_shoud_throw_exception,
            ValidationExceptionError,
        ),
        (
            timestamp_field_to_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
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
        (timeframe_with_valid_fields_return_none, None),
        (
            timeframe_field_to_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            timeframe_field_from_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            timeframe_missing_all_fields_should_thrown_exception,
            ValidationExceptionError,
        ),
        (timeframe_missing_field_to_should_throw_exception, ValidationExceptionError),
        (timeframe_missing_field_from_should_throw_exception, ValidationExceptionError),
        (
            timeframe_missing_field_from_and_to_should_throw_exception,
            ValidationExceptionError,
        ),
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
