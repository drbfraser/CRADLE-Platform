import pytest
from pydantic import ValidationError

from validation.pregnancies import PregnancyModel

PATIENT_ID = "120000"

# unix epoch code for January 1, 2020 12:00:00 AM
PREGNANCY_START_DATE = 1577865600

# unix epoch code for October 1, 2020 12:00:00 AM
PREGNANCY_END_DATE = 1601535600

pregnancy_with_valid_fields_should_return_none = {
    "patient_id": PATIENT_ID,
    "start_date": PREGNANCY_START_DATE,
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
}


pregnancy_missing_required_field_pregnancy_start_date_unit_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
}

pregnancy_field_pregnancy_start_date_has_invalid_type_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "start_date": "temp",
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
}

pregnancy_has_unallowed_field_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "start_date": "temp",
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
    "extra": "I am an unwelcome extra",
}

pregnancy_start_date_occurs_after_end_date_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "start_date": PREGNANCY_END_DATE + 10000,
    "end_date": PREGNANCY_END_DATE,
}


@pytest.mark.parametrize(
    "json, output_type",
    [
        (
            pregnancy_with_valid_fields_should_return_none,
            type(None),
        ),
        (
            pregnancy_missing_required_field_pregnancy_start_date_unit_should_throw_exception,
            ValidationError,
        ),
        (
            pregnancy_field_pregnancy_start_date_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            pregnancy_has_unallowed_field_should_throw_exception,
            ValidationError,
        ),
        (
            pregnancy_start_date_occurs_after_end_date_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validate_pregnancy(json, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            PregnancyModel(**json)
    else:
        try:
            PregnancyModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
