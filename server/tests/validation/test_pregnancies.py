import pytest
from validation.validation_exception import ValidationExceptionError

from validation.pregnancies import (
    PregnancyPostRequestValidator,
    PrenancyPutRequestValidator,
)

PATIENT_ID = 120000

# unix epoch code for January 1, 2020 12:00:00 AM
PREGNANCY_START_DATE = 1577865600

# unix epoch code for October 1, 2020 12:00:00 AM
PREGNANCY_END_DATE = 1601535600

valid_json = {
    "patientId": PATIENT_ID,
    "pregnancyStartDate": PREGNANCY_START_DATE,
    "gestationalAgeUnit": "WEEKS",
    "pregnancyEndDate": PREGNANCY_END_DATE,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

valid_missing_id = {
    "pregnancyStartDate": PREGNANCY_START_DATE,
    "gestationalAgeUnit": "WEEKS",
    "pregnancyEndDate": PREGNANCY_END_DATE,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

invalid_missing_required = {
    "patientId": PATIENT_ID,
    "pregnancyStartDate": PREGNANCY_START_DATE,
    "pregnancyEndDate": PREGNANCY_END_DATE,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

invalid_incorrect_type = {
    "patientId": PATIENT_ID,
    "pregnancyStartDate": "temp",
    "gestationalAgeUnit": "WEEKS",
    "pregnancyEndDate": PREGNANCY_END_DATE,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

pregnancy_start_date_occurs_after_end_date_should_throw_exception = {
    "patientId": PATIENT_ID,
    "gestationalAgeUnit": "WEEKS",
    "pregnancyStartDate": PREGNANCY_END_DATE + 10000,
    "pregnancyEndDate": PREGNANCY_END_DATE,
}


@pytest.mark.parametrize(
    "json, patient_id, output_type",
    [
        (valid_json, valid_json.get("patientId"), type(None)),
        (valid_missing_id, None, type(None)),
        (
            invalid_missing_required,
            invalid_missing_required.get("patientId"),
            ValidationExceptionError,
        ),
        (
            invalid_incorrect_type,
            invalid_incorrect_type.get("patientId"),
            ValidationExceptionError,
        ),
        (
            pregnancy_start_date_occurs_after_end_date_should_throw_exception,
            pregnancy_start_date_occurs_after_end_date_should_throw_exception.get(
                "patientId"
            ),
            ValidationExceptionError,
        ),
    ],
)
def test_validate_post_request(json, patient_id, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            PregnancyPostRequestValidator.validate_post_request(json, patient_id)
    else:
        try:
            PregnancyPostRequestValidator.validate_post_request(json, patient_id)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


valid_put_json_no_id = {
    "pregnancyEndDate": 1620000002,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

put_json_with_id = {"id": 123}

put_json_invalid_key = {"testing": "test"}


@pytest.mark.parametrize(
    "json, pregnancy_id, output_type",
    [
        (valid_put_json_no_id, "0", type(None)),
        (put_json_with_id, put_json_with_id.get("id"), type(None)),
        (put_json_with_id, "1249812490480", ValidationExceptionError),
        (put_json_invalid_key, "0", ValidationExceptionError),
    ],
)
def test_validate_put_request(json, pregnancy_id, output_type):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            PrenancyPutRequestValidator.validate_put_request(json, pregnancy_id)
    else:
        try:
            PrenancyPutRequestValidator.validate_put_request(json, pregnancy_id)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


valid_empty_list = []
valid_subset_list = ["id", "patientId"]
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
            PregnancyPostRequestValidator.validate_unallowed_fields(json)
    else:
        try:
            PregnancyPostRequestValidator.validate_unallowed_fields(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
