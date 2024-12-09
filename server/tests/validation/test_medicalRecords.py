import pytest

from validation.medicalRecords import MedicalRecordValidator
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
            MedicalRecordValidator.validate_put_request(json, record_id)
    else:
        try:
            MedicalRecordValidator.validate_put_request(json, record_id)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
