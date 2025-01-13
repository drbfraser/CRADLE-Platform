import pytest
from pydantic import ValidationError

from validation.stats import MYSQL_BIGINT_MAX, Timeframe

# unix epoch code for Monday, January 1, 2024 12:00:00 AM
FROM_TIMEFRAME = 1704067200
# unix epoch code for Friday, February 2, 2024 12:00:00 AM
TO_TIMEFRAME = 1729744672

expectation_default_timestamp = {
    "from": 0,
    "to": MYSQL_BIGINT_MAX,
}

timestamp_with_valid_fields_should_return_model = {
    "from": FROM_TIMEFRAME,
    "to": TO_TIMEFRAME,
}

timestamp_missing_field_from_should_return_model = {"to": TO_TIMEFRAME}

timestamp_missing_field_to_should_return_model = {"from": FROM_TIMEFRAME}

timestamp_missing_all_fields_should_return_model = {}

timestamp_field_from_has_wrong_type_should_return_model = {
    "from": str(FROM_TIMEFRAME),
    "to": TO_TIMEFRAME,
}

timestamp_field_to_has_wrong_type_should_return_model = {
    "from": FROM_TIMEFRAME,
    "to": str(TO_TIMEFRAME),
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
def test_validate_timeframe(json, output):
    if type(output) is type and issubclass(output, Exception):
        with pytest.raises(output):
            Timeframe(**json)
    else:
        try:
            timeframe_model = Timeframe(**json)

            if output is not None:
                timeframe_dict = timeframe_model.model_dump(by_alias=True)

                assert output == timeframe_dict

        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error: {e}") from e
