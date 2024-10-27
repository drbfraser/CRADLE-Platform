import pytest

from validation.medicalRecords import (
    validate_key,
    validate_post_request,
    validate_put_request,
)
from validation.validation_exception import ValidationExceptionError

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
    "json, patient_id, expectation",
    [
        (valid_post_request, valid_post_request.get("patientId"), None),
        (valid_missing_id, None, None),
        (
            invalid_mismatching_patient_id,
            invalid_mismatching_patient_id.get("patientId") + 10,
            ValidationExceptionError,
        ),
        (
            invalid_missing_histories,
            invalid_missing_histories.get("patientId"),
            ValidationExceptionError,
        ),
        (
            invalid_extra_keys,
            invalid_extra_keys.get("patientId"),
            ValidationExceptionError,
        ),
    ],
)
def test_validate_post_request(json, patient_id, expectation):
    if expectation:
        with pytest.raises(expectation):
            validate_post_request(json, patient_id)
    else:
        message = validate_post_request(json, patient_id)
        assert message is None, f"Expected None, but got {message}"


@pytest.mark.skip(reason="PUT request for medical records not being used in front-end")
@pytest.mark.parametrize(
    "json, record_id, expectation",
    [
        (valid_post_request, valid_post_request.get("patientId"), None),
        (valid_missing_id, None, None),
        (
            invalid_mismatching_patient_id,
            invalid_mismatching_patient_id.get("patientId") + 10,
            ValidationExceptionError,
        ),
        (
            invalid_missing_histories,
            invalid_missing_histories.get("patientId"),
            ValidationExceptionError,
        ),
        (
            invalid_extra_keys,
            invalid_extra_keys.get("patientId"),
            ValidationExceptionError,
        ),
    ],
)
def test_validate_put_request(json, record_id, expectation):
    if expectation:
        with pytest.raises(expectation):
            validate_put_request(json, record_id)
    else:
        message = validate_put_request(json, record_id)
        assert message is None, f"Expected None, but got {message}"


valid_list_with_history = {"medicalHistory": "history"}
valid_subset_list = {"id": "1", "medicalHistory": "history"}
invalid_extra_key_list = {"test": "test"}
invalid_extra_key_subset_list = {"id": "1", "medicalHistory": "history", "test": "test"}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_list_with_history, None),
        (valid_subset_list, None),
        (invalid_extra_key_list, ValidationExceptionError),
        (invalid_extra_key_subset_list, ValidationExceptionError),
    ],
)
def test_validate_key(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            validate_key(json)
    else:
        message = validate_key(json)
        assert message is None, f"Expected None, but got {message}"
