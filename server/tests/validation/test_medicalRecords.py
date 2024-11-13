import pytest

from validation.medicalRecords import MedicalRecordValidator
from validation.validation_exception import ValidationExceptionError

valid_post_request = {
    "medical_history": "Pregnancy induced hypertension",
    "patient_id": 120000,
}

valid_missing_id = {
    "drug_history": "Test drug history",
}

invalid_mismatching_patient_id = {
    "medical_history": "Pregnancy induced hypertension",
    "patient_id": 120000,
}

invalid_missing_histories = {"patient_id": 120000}

invalid_extra_keys = {
    "test": "test",
    "medical_history": "Pregnancy induced hypertension",
    "patient_id": 120000,
}


@pytest.mark.parametrize(
    "json, patient_id, expectation",
    [
        (valid_post_request, valid_post_request.get("patient_id"), None),
        (valid_missing_id, None, None),
        (
            invalid_mismatching_patient_id,
            invalid_mismatching_patient_id["patient_id"] + 10,
            ValidationExceptionError,
        ),
        (
            invalid_missing_histories,
            invalid_missing_histories.get("patient_id"),
            ValidationExceptionError,
        ),
        (
            invalid_extra_keys,
            invalid_extra_keys.get("patient_id"),
            ValidationExceptionError,
        ),
    ],
)
def test_validate_post_request(json, patient_id, expectation):
    if expectation:
        with pytest.raises(expectation):
            MedicalRecordValidator.validate_post_request(json, patient_id)
    else:
        try:
            MedicalRecordValidator.validate_post_request(json, patient_id)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


@pytest.mark.skip(reason="PUT request for medical records not being used in front-end")
@pytest.mark.parametrize(
    "json, record_id, expectation",
    [
        (valid_post_request, valid_post_request.get("patient_id"), None),
        (valid_missing_id, None, None),
        (
            invalid_mismatching_patient_id,
            invalid_mismatching_patient_id["patient_id"] + 10,
            ValidationExceptionError,
        ),
        (
            invalid_missing_histories,
            invalid_missing_histories.get("patient_id"),
            ValidationExceptionError,
        ),
        (
            invalid_extra_keys,
            invalid_extra_keys.get("patient_id"),
            ValidationExceptionError,
        ),
    ],
)
def test_validate_put_request(json, record_id, expectation):
    if expectation:
        with pytest.raises(expectation):
            MedicalRecordValidator.validate_put_request(json, record_id)
    else:
        try:
            MedicalRecordValidator.validate_put_request(json, record_id)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


valid_list_with_history = {"medical_history": "history"}
valid_subset_list = {"id": "1", "medical_history": "history"}
invalid_extra_key_list = {"test": "test"}
invalid_extra_key_subset_list = {
    "id": "1",
    "medical_history": "history",
    "test": "test",
}


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
            MedicalRecordValidator.validate_key(json)
    else:
        try:
            MedicalRecordValidator.validate_key(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
