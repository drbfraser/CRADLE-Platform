import pytest

from validation.medicalRecords import MedicalRecordValidator
from validation.validation_exception import ValidationExceptionError

ID = 1
PATIENT_ID = 120000
MEDICAL_HISTORY = "Pregnancy induced hypertension"
DRUG_HISTORY = "Test drug history"
# unix epoch code for January 1, 2020 12:00:00 AM
DATE_CREATED = 1577865600
# unix epoch code for October 1, 2020 12:00:00 AM
DATE_EDITED = 1601535600

medical_record_with_valid_fields_should_return_none = {
    "id": ID,
    "patientId": PATIENT_ID,
    "medicalHistory": MEDICAL_HISTORY,
    "drugHistory": DRUG_HISTORY,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_EDITED,
}

medical_record_missing_optional_field_id_should_return_none = {
    "patientId": PATIENT_ID,
    "medicalHistory": MEDICAL_HISTORY,
    "drugHistory": DRUG_HISTORY,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_EDITED,
}

medical_record_missing_optional_field_patientId_should_return_none = {
    "id": ID,
    "medicalHistory": MEDICAL_HISTORY,
    "drugHistory": DRUG_HISTORY,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_EDITED,
}

medical_record_missing_optional_field_medicalHistory_should_return_none = {
    "id": ID,
    "patientId": PATIENT_ID,
    "drugHistory": DRUG_HISTORY,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_EDITED,
}

medical_record_missing_optional_field_drugHistory_should_return_none = {
    "id": ID,
    "patientId": PATIENT_ID,
    "medicalHistory": MEDICAL_HISTORY,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_EDITED,
}

medical_record_missing_optional_field_dateCreated_should_return_none = {
    "id": ID,
    "patientId": PATIENT_ID,
    "medicalHistory": MEDICAL_HISTORY,
    "drugHistory": DRUG_HISTORY,
    "lastEdited": DATE_EDITED,
}

medical_record_missing_optional_field_lastEdited_should_return_none = {
    "id": ID,
    "patientId": PATIENT_ID,
    "medicalHistory": MEDICAL_HISTORY,
    "drugHistory": DRUG_HISTORY,
    "dateCreated": DATE_CREATED,
}

medical_record_missing_both_medicalHistory_and_drugHistory_should_throw_exception = {
    "id": ID,
    "patientId": PATIENT_ID,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_EDITED,
}

medical_record_with_mismatching_patient_id_should_throw_exception = {
    "id": ID,
    "patientId": PATIENT_ID,
    "medicalHistory": MEDICAL_HISTORY,
    "drugHistory": DRUG_HISTORY,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_EDITED,
}

medical_record_has_invalid_extra_field_should_throw_exception = {
    "test": "test",
    "id": ID,
    "patientId": PATIENT_ID,
    "medicalHistory": MEDICAL_HISTORY,
    "drugHistory": DRUG_HISTORY,
    "dateCreated": DATE_CREATED,
    "lastEdited": DATE_EDITED,
}


@pytest.mark.parametrize(
    "json, patient_id, expectation",
    [
        (
            medical_record_with_valid_fields_should_return_none,
            medical_record_with_valid_fields_should_return_none.get("patientId"),
            None,
        ),
        (
            medical_record_missing_optional_field_id_should_return_none,
            medical_record_missing_optional_field_id_should_return_none.get(
                "patientId"
            ),
            None,
        ),
        (
            medical_record_missing_optional_field_patientId_should_return_none,
            None,
            None,
        ),
        (
            medical_record_missing_optional_field_medicalHistory_should_return_none,
            medical_record_missing_optional_field_medicalHistory_should_return_none.get(
                "patientId"
            ),
            None,
        ),
        (
            medical_record_missing_optional_field_drugHistory_should_return_none,
            medical_record_missing_optional_field_drugHistory_should_return_none.get(
                "patientId"
            ),
            None,
        ),
        (
            medical_record_missing_optional_field_dateCreated_should_return_none,
            medical_record_missing_optional_field_dateCreated_should_return_none.get(
                "patientId"
            ),
            None,
        ),
        (
            medical_record_missing_optional_field_lastEdited_should_return_none,
            medical_record_missing_optional_field_lastEdited_should_return_none.get(
                "patientId"
            ),
            None,
        ),
        (
            medical_record_missing_both_medicalHistory_and_drugHistory_should_throw_exception,
            medical_record_missing_both_medicalHistory_and_drugHistory_should_throw_exception.get(
                "patientId"
            ),
            ValidationExceptionError,
        ),
        (
            medical_record_with_mismatching_patient_id_should_throw_exception,
            medical_record_with_mismatching_patient_id_should_throw_exception.get(
                "patientId"
            )
            + 10,
            ValidationExceptionError,
        ),
        (
            medical_record_has_invalid_extra_field_should_throw_exception,
            medical_record_has_invalid_extra_field_should_throw_exception.get(
                "patientId"
            ),
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
        (
            medical_record_with_valid_fields_should_return_none,
            medical_record_with_valid_fields_should_return_none.get("patientId"),
            None,
        ),
        (medical_record_missing_optional_field_id_should_return_none, None, None),
        (
            medical_record_with_mismatching_patient_id_should_throw_exception,
            medical_record_with_mismatching_patient_id_should_throw_exception.get(
                "patientId"
            )
            + 10,
            ValidationExceptionError,
        ),
        (
            medical_record_missing_both_medicalHistory_and_drugHistory_should_throw_exception,
            medical_record_missing_both_medicalHistory_and_drugHistory_should_throw_exception.get(
                "patientId"
            ),
            ValidationExceptionError,
        ),
        (
            medical_record_has_invalid_extra_field_should_throw_exception,
            medical_record_has_invalid_extra_field_should_throw_exception.get(
                "patientId"
            ),
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
