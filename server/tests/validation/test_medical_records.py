import pytest
from pydantic import ValidationError

from validation.medicalRecords import MedicalRecordModel

ID = 1
PATIENT_ID = "120000"
MEDICAL_INFO = "Pregnancy induced hypertension"
DRUG_INFO = "Test drug history"
# unix epoch code for January 1, 2020 12:00:00 AM
DATE_CREATED = 1577865600
# unix epoch code for October 1, 2020 12:00:00 AM
DATE_EDITED = 1601535600

medical_record_with_valid_fields_should_return_none = {
    "id": ID,
    "patient_id": PATIENT_ID,
    "information": MEDICAL_INFO,
    "is_drug_record": False,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}

medical_record_missing_optional_field_id_should_return_none = {
    "patient_id": PATIENT_ID,
    "information": MEDICAL_INFO,
    "is_drug_record": False,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}

medical_record_missing_field_patient_id_should_throw = {
    "id": ID,
    "information": MEDICAL_INFO,
    "is_drug_record": False,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}

medical_record_missing_optional_field_date_created_should_return_none = {
    "id": ID,
    "patient_id": PATIENT_ID,
    "information": MEDICAL_INFO,
    "is_drug_record": False,
    "last_edited": DATE_EDITED,
}

medical_record_missing_optional_field_last_edited_should_return_none = {
    "id": ID,
    "patient_id": PATIENT_ID,
    "information": MEDICAL_INFO,
    "is_drug_record": False,
    "date_created": DATE_CREATED,
}


medical_record_has_invalid_extra_field_should_throw_exception = {
    "test": "test",
    "id": ID,
    "patient_id": PATIENT_ID,
    "information": MEDICAL_INFO,
    "is_drug_record": False,
    "date_created": DATE_CREATED,
    "last_edited": DATE_EDITED,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (
            medical_record_with_valid_fields_should_return_none,
            None,
        ),
        (
            medical_record_missing_optional_field_id_should_return_none,
            None,
        ),
        (
            medical_record_missing_field_patient_id_should_throw,
            ValidationError,
        ),
        (
            medical_record_missing_optional_field_date_created_should_return_none,
            None,
        ),
        (
            medical_record_missing_optional_field_last_edited_should_return_none,
            None,
        ),
        (
            medical_record_has_invalid_extra_field_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validate_medical_record(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            MedicalRecordModel(**json)
    else:
        try:
            MedicalRecordModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
