import pytest

from validation.medicalRecords import (
    __validate,
    validate_post_request,
    validate_put_request,
)

valid_post_request = {
    "medicalHistory": "Pregnancy induced hypertension",
    "patientId": 120000,
}

valid_missing_id = {
    "drugHistory": "Test drug history",
}

invalid_mismatching_patient_id = {
    "medicalHistory": "Pregnancy induced hypertension",
    "patientId": 120000,
}

invalid_missing_histories = {"patientId": 120000}

invalid_extra_keys = {
    "test": "test",
    "medicalHistory": "Pregnancy induced hypertension",
    "patientId": 120000,
}


@pytest.mark.parametrize(
    "json, patient_id, output_type",
    [
        (valid_post_request, valid_post_request.get("patientId"), type(None)),
        (valid_missing_id, None, type(None)),
        (
            invalid_mismatching_patient_id,
            invalid_mismatching_patient_id.get("patientId") + 10,
            str,
        ),
        (invalid_missing_histories, invalid_missing_histories.get("patientId"), str),
        (invalid_extra_keys, invalid_extra_keys.get("patientId"), str),
    ],
)
def test_validate_post_request(json, patient_id, output_type):
    message = validate_post_request(json, patient_id)
    assert type(message) is output_type


@pytest.mark.skip(reason="PUT request for medical records not being used in front-end")
@pytest.mark.parametrize(
    "json, record_id, output_type",
    [
        (valid_post_request, valid_post_request.get("patientId"), type(None)),
        (valid_missing_id, None, type(None)),
        (
            invalid_mismatching_patient_id,
            invalid_mismatching_patient_id.get("patientId") + 10,
            str,
        ),
        (invalid_missing_histories, invalid_missing_histories.get("patientId"), str),
        (invalid_extra_keys, invalid_extra_keys.get("patientId"), str),
    ],
)
def test_validate_put_request(json, record_id, output_type):
    message = validate_put_request(json, record_id)
    assert type(message) is output_type


valid_empty_list = []
valid_subset_list = ["id", "medicalHistory"]
invalid_extra_key_list = ["test"]
invalid_extra_key_subset_list = ["id", "medicalHistory", "test"]


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
