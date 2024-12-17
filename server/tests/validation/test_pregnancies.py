import pytest

from validation.pregnancies import (
    PregnancyModel,
    PregnancyPostRequestValidator,
    PregnancyPutRequestValidator,
)
from validation.validation_exception import ValidationExceptionError

PATIENT_ID = 120000

# unix epoch code for January 1, 2020 12:00:00 AM
PREGNANCY_START_DATE = 1577865600

# unix epoch code for October 1, 2020 12:00:00 AM
PREGNANCY_END_DATE = 1601535600

pregnancy_post_with_valid_fields_should_return_none = {
    "patient_id": PATIENT_ID,
    "start_date": PREGNANCY_START_DATE,
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
}

pregnancy_post_missing_optional_field_patient_id_should_return_none = {
    "start_date": PREGNANCY_START_DATE,
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
}


pregnancy_post_missing_required_field_pregnancy_start_date_unit_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
}

pregnancy_post_field_pregnancy_start_date_has_invalid_type_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "start_date": "temp",
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
}

pregnancy_post_has_unallowed_field_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "start_date": "temp",
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
    "extra": "I am an unwelcome extra",
}

pregnancy_post_start_date_occurs_after_end_date_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "start_date": PREGNANCY_END_DATE + 10000,
    "end_date": PREGNANCY_END_DATE,
}


@pytest.mark.parametrize(
    "json, patient_id, output_type",
    [
        (
            pregnancy_post_with_valid_fields_should_return_none,
            pregnancy_post_with_valid_fields_should_return_none.get("patient_id"),
            type(None),
        ),
        (
            pregnancy_post_missing_optional_field_patient_id_should_return_none,
            pregnancy_post_missing_optional_field_patient_id_should_return_none.get(
                "patient_id",
            ),
            type(None),
        ),
        (
            pregnancy_post_missing_required_field_pregnancy_start_date_unit_should_throw_exception,
            pregnancy_post_missing_required_field_pregnancy_start_date_unit_should_throw_exception.get(
                "patient_id",
            ),
            ValidationExceptionError,
        ),
        (
            pregnancy_post_field_pregnancy_start_date_has_invalid_type_should_throw_exception,
            pregnancy_post_field_pregnancy_start_date_has_invalid_type_should_throw_exception.get(
                "patient_id",
            ),
            ValidationExceptionError,
        ),
        (
            pregnancy_post_has_unallowed_field_should_throw_exception,
            pregnancy_post_has_unallowed_field_should_throw_exception.get("patient_id"),
            ValidationExceptionError,
        ),
        (
            pregnancy_post_start_date_occurs_after_end_date_should_throw_exception,
            pregnancy_post_start_date_occurs_after_end_date_should_throw_exception.get(
                "patient_id",
            ),
            ValidationExceptionError,
        ),
        (
            # this case should throw because unmatched patient id
            pregnancy_post_with_valid_fields_should_return_none,
            "unmatched_patient_id",
            ValidationExceptionError,
        ),
    ],
)
def test_validate_post_request(json, patient_id, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            PregnancyPostRequestValidator.validate(json, patient_id)
    else:
        try:
            PregnancyPostRequestValidator.validate(json, patient_id)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


pregnancy_put_request_with_valid_fields_should_return_none = {
    "patient_id": PATIENT_ID,
    "start_date": PREGNANCY_START_DATE,
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
}

pregnancy_put_missing_optional_field_pregnancy_start_date_should_return_none = {
    "patient_id": PATIENT_ID,
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
}

pregnancy_put_field_pregnancy_start_date_has_invalid_type_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "start_date": "temp",
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
}

pregnancy_put_has_unallowed_field_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "start_date": PREGNANCY_START_DATE,
    "end_date": PREGNANCY_END_DATE,
    "outcome": "Mode of delivery assisted birth",
    "extra": "I am unwelcomed extra",
}

pregnancy_put_start_date_occurs_after_end_date_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "start_date": PREGNANCY_END_DATE + 10000,
    "end_date": PREGNANCY_END_DATE,
}

pregnancy_put_id_unmatch_patient_id_should_throw_exception = {
    "id": "unmatched_id",
    "patient_id": PATIENT_ID,
    "start_date": PREGNANCY_START_DATE,
    "end_date": PREGNANCY_END_DATE,
}


@pytest.mark.parametrize(
    "json, pregnancy_id, output_type",
    [
        (
            pregnancy_put_request_with_valid_fields_should_return_none,
            pregnancy_put_request_with_valid_fields_should_return_none.get(
                "patient_id"
            ),
            type(None),
        ),
        (
            pregnancy_put_missing_optional_field_pregnancy_start_date_should_return_none,
            pregnancy_put_missing_optional_field_pregnancy_start_date_should_return_none.get(
                "patient_id",
            ),
            type(None),
        ),
        (
            pregnancy_put_field_pregnancy_start_date_has_invalid_type_should_throw_exception,
            pregnancy_put_field_pregnancy_start_date_has_invalid_type_should_throw_exception.get(
                "patient_id",
            ),
            ValidationExceptionError,
        ),
        (
            pregnancy_put_has_unallowed_field_should_throw_exception,
            pregnancy_put_has_unallowed_field_should_throw_exception.get("patient_id"),
            ValidationExceptionError,
        ),
        (
            pregnancy_put_start_date_occurs_after_end_date_should_throw_exception,
            pregnancy_put_start_date_occurs_after_end_date_should_throw_exception.get(
                "patient_id",
            ),
            ValidationExceptionError,
        ),
        (
            pregnancy_put_id_unmatch_patient_id_should_throw_exception,
            pregnancy_put_id_unmatch_patient_id_should_throw_exception.get(
                "patient_id"
            ),
            ValidationExceptionError,
        ),
    ],
)
def test_validate_put_request(json, pregnancy_id, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            PregnancyPutRequestValidator.validate(json, pregnancy_id)
    else:
        try:
            PregnancyPutRequestValidator.validate(json, pregnancy_id)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


valid_empty_list = []
valid_subset_list = ["id", "patient_id"]
invalid_extra_key_list = ["test"]
invalid_extra_key_subset_list = ["id", "test"]


@pytest.mark.parametrize(
    "json, output_type",
    [
        (valid_empty_list, type(None)),
        (valid_subset_list, type(None)),
        (invalid_extra_key_list, ValidationExceptionError),
        (invalid_extra_key_subset_list, ValidationExceptionError),
    ],
)
def test_validate(json, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            PregnancyModel.validate_unallowed_fields(json)
    else:
        try:
            PregnancyModel.validate_unallowed_fields(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
