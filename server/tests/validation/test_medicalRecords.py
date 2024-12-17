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
    "patient_id": PATIENT_ID,
    "medical_history": MEDICAL_HISTORY,
    "drug_history": DRUG_HISTORY,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}

medical_record_missing_optional_field_id_should_return_none = {
    "patient_id": PATIENT_ID,
    "medical_history": MEDICAL_HISTORY,
    "drug_history": DRUG_HISTORY,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}

medical_record_missing_optional_field_patientId_should_return_none = {
    "id": ID,
    "medical_history": MEDICAL_HISTORY,
    "drug_history": DRUG_HISTORY,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}

medical_record_missing_optional_field_medicalHistory_should_return_none = {
    "id": ID,
    "patient_id": PATIENT_ID,
    "drug_history": DRUG_HISTORY,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}

medical_record_missing_optional_field_drugHistory_should_return_none = {
    "id": ID,
    "patient_id": PATIENT_ID,
    "medical_history": MEDICAL_HISTORY,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}

medical_record_missing_optional_field_dateCreated_should_return_none = {
    "id": ID,
    "patient_id": PATIENT_ID,
    "medical_history": MEDICAL_HISTORY,
    "drug_history": DRUG_HISTORY,
    "last_edited": DATE_EDITED,
}

medical_record_missing_optional_field_lastEdited_should_return_none = {
    "id": ID,
    "patient_id": PATIENT_ID,
    "medical_history": MEDICAL_HISTORY,
    "drug_history": DRUG_HISTORY,
    "date_created": DATE_CREATED,
}

medical_record_missing_both_medicalHistory_and_drugHistory_should_throw_exception = {
    "id": ID,
    "patient_id": PATIENT_ID,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}

medical_record_with_mismatching_patient_id_should_throw_exception = {
    "id": ID,
    "patient_id": PATIENT_ID,
    "medical_history": MEDICAL_HISTORY,
    "drug_history": DRUG_HISTORY,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}

medical_record_has_invalid_extra_field_should_throw_exception = {
    "test": "test",
    "id": ID,
    "patient_id": PATIENT_ID,
    "medical_history": MEDICAL_HISTORY,
    "drug_history": DRUG_HISTORY,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}


@pytest.mark.parametrize(
    "json, patient_id, expectation",
    [
        (
            medical_record_with_valid_fields_should_return_none,
            medical_record_with_valid_fields_should_return_none.get("patient_id"),
            None,
        ),
        (
            medical_record_missing_optional_field_id_should_return_none,
            medical_record_missing_optional_field_id_should_return_none.get(
                "patient_id"
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
                "patient_id"
            ),
            None,
        ),
        (
            medical_record_missing_optional_field_drugHistory_should_return_none,
            medical_record_missing_optional_field_drugHistory_should_return_none.get(
                "patient_id"
            ),
            None,
        ),
        (
            medical_record_missing_optional_field_dateCreated_should_return_none,
            medical_record_missing_optional_field_dateCreated_should_return_none.get(
                "patient_id"
            ),
            None,
        ),
        (
            medical_record_missing_optional_field_lastEdited_should_return_none,
            medical_record_missing_optional_field_lastEdited_should_return_none.get(
                "patient_id"
            ),
            None,
        ),
        (
            medical_record_missing_both_medicalHistory_and_drugHistory_should_throw_exception,
            medical_record_missing_both_medicalHistory_and_drugHistory_should_throw_exception.get(
                "patient_id"
            ),
            ValidationExceptionError,
        ),
        (
            medical_record_with_mismatching_patient_id_should_throw_exception,
            medical_record_with_mismatching_patient_id_should_throw_exception.get(
                "patient_id"
            )
            + 10,
            ValidationExceptionError,
        ),
        (
            medical_record_has_invalid_extra_field_should_throw_exception,
            medical_record_has_invalid_extra_field_should_throw_exception.get(
                "patient_id"
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
            medical_record_with_valid_fields_should_return_none.get("patient_id"),
            None,
        ),
        (medical_record_missing_optional_field_id_should_return_none, None, None),
        (
            medical_record_with_mismatching_patient_id_should_throw_exception,
            medical_record_with_mismatching_patient_id_should_throw_exception.get(
                "patient_id"
            )
            + 10,
            ValidationExceptionError,
        ),
        (
            medical_record_missing_both_medicalHistory_and_drugHistory_should_throw_exception,
            medical_record_missing_both_medicalHistory_and_drugHistory_should_throw_exception.get(
                "patient_id"
            ),
            ValidationExceptionError,
        ),
        (
            medical_record_has_invalid_extra_field_should_throw_exception,
            medical_record_has_invalid_extra_field_should_throw_exception.get(
                "patient_id"
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
