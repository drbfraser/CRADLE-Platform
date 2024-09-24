import pytest

from validation.pregnancies import (
    __validate,
    validate_post_request,
    validate_put_request,
)

valid_json = {
    "patientId": 120000,
    "pregnancyStartDate": 1620000002,
    "gestationalAgeUnit": "WEEKS",
    "pregnancyEndDate": 1620000002,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

valid_missing_id = {
    "pregnancyStartDate": 1620000002,
    "gestationalAgeUnit": "WEEKS",
    "pregnancyEndDate": 1620000002,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

invalid_missing_required = {
    "patientId": 120000,
    "pregnancyStartDate": 1620000002,
    "pregnancyEndDate": 1620000002,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}

invalid_incorrect_type = {
    "patientId": 120000,
    "pregnancyStartDate": "temp",
    "gestationalAgeUnit": "WEEKS",
    "pregnancyEndDate": 1620000002,
    "pregnancyOutcome": "Mode of delivery assisted birth",
}


@pytest.mark.parametrize(
    "json, patient_id, output_type",
    [
        (valid_json, valid_json.get("patientId"), type(None)),
        (valid_missing_id, None, type(None)),
        (invalid_missing_required, invalid_missing_required.get("patientId"), str),
        (invalid_incorrect_type, invalid_incorrect_type.get("patientId"), str),
    ],
)
def test_validate_post_request(json, patient_id, output_type):
    message = validate_post_request(json, patient_id)
    assert type(message) is output_type


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
        (put_json_with_id, "1249812490480", str),
        (put_json_invalid_key, "0", str),
    ],
)
def test_validate_put_request(json, pregnancy_id, output_type):
    message = validate_put_request(json, pregnancy_id)
    assert type(message) is output_type


valid_empty_list = []
valid_subset_list = ["id", "patientId"]
invalid_extra_key_list = ["test"]
invalid_extra_key_subset_list = ["id", "test"]


@pytest.mark.parametrize(
    "json, output_type",
    [
        (valid_empty_list, type(None)),
        (valid_subset_list, type(None)),
        (invalid_extra_key_list, str),
        (invalid_extra_key_subset_list, str),
    ],
)
def test___validate(json, output_type):
    message = __validate(json)
    assert type(message) is output_type
