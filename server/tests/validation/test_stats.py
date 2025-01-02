import pytest
from pydantic import ValidationError

from validation.stats import MYSQL_BIGINT_MAX, Timeframe, TimestampValidator

# unix epoch code for Monday, January 1, 2024 12:00:00 AM
FROM_TIMESTAMP = 1704067200
# unix epoch code for Friday, February 2, 2024 12:00:00 AM
TO_TIMESTAMP = 1729744672

expectation_default_timestamp = {
    "from": 0,
    "to": MYSQL_BIGINT_MAX,
}

timestamp_with_valid_fields_should_return_model = {
    "from": FROM_TIMESTAMP,
    "to": TO_TIMESTAMP,
}

timestamp_missing_field_from_should_return_model = {"to": TO_TIMESTAMP}

timestamp_missing_field_to_should_return_model = {"from": FROM_TIMESTAMP}

timestamp_missing_all_fields_should_return_model = {}

timestamp_field_from_has_wrong_type_should_return_model = {
    "from": str(FROM_TIMESTAMP),
    "to": TO_TIMESTAMP,
}

timestamp_field_to_has_wrong_type_should_return_model = {
    "from": FROM_TIMESTAMP,
    "to": str(TO_TIMESTAMP),
}

timeframe_with_valid_fields_return_none = {
    "timeframe": {
        "from": FROM_TIMESTAMP,
        "to": TO_TIMESTAMP,
    },
}

timeframe_field_to_has_invalid_type_should_return_model = {
    "timeframe": {
        "from": FROM_TIMESTAMP,
        "to": str(TO_TIMESTAMP),
    },
}

timeframe_field_from_has_invalid_type_should_return_model = {
    "timeframe": {
        "from": str(FROM_TIMESTAMP),
        "to": TO_TIMESTAMP,
    },
}

timeframe_missing_all_fields_should_thrown_exception = {}

timeframe_missing_field_to_should_return_none = {
    "timeframe": {
        "from": FROM_TIMESTAMP,
    },
}

timeframe_missing_field_from_should_return_none = {
    "timeframe": {
        "to": TO_TIMESTAMP,
    },
}

timeframe_missing_field_from_and_to_should_return_none = {
    "timeframe": {},
}


@pytest.mark.parametrize(
    "json, output",
    [
        (
            timestamp_with_valid_fields_should_return_model,
            timestamp_with_valid_fields_should_return_model,
        ),
        (timestamp_missing_field_from_should_return_model, None),
        (timestamp_missing_field_to_should_return_model, None),
        (
            timestamp_missing_all_fields_should_return_model,
            expectation_default_timestamp,
        ),
        (
            timestamp_field_from_has_wrong_type_should_return_model,
            None,
        ),
        (
            timestamp_field_to_has_wrong_type_should_return_model,
            None,
        ),
    ],
)
def test_validate_timestamp(json, output):
    if type(output) is type and issubclass(output, Exception):
        with pytest.raises(output):
            TimestampValidator(**json)
    else:
        try:
            timestamp_pydantic_model = TimestampValidator(**json)

            if output is not None:
                timestamp_actual = timestamp_pydantic_model.model_dump(by_alias=True)

                assert output == timestamp_actual

        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e


@pytest.mark.parametrize(
    "json, output_type",
    [
        (timeframe_with_valid_fields_return_none, None),
        (
            timeframe_field_to_has_invalid_type_should_return_model,
            None,
        ),
        (
            timeframe_field_from_has_invalid_type_should_return_model,
            None,
        ),
        (
            timeframe_missing_all_fields_should_thrown_exception,
            ValidationError,
        ),
        (timeframe_missing_field_to_should_return_none, None),
        (timeframe_missing_field_from_should_return_none, None),
        (
            timeframe_missing_field_from_and_to_should_return_none,
            None,
        ),
    ],
)
def test_validate_time_frame_readings(json, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            Timeframe(**json)
    else:
        try:
            Timeframe(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e
