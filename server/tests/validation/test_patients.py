from datetime import datetime, timedelta

import pytest

from validation.patients import PatientPostValidator, PatientPutValidator
from validation.validation_exception import ValidationExceptionError

# Dynamically calculate valid and invalid gestatation ages from todays date.
todays_date = datetime.today()
two_weeks_ago = int((todays_date - timedelta(weeks=2)).strftime("%s"))
fifty_weeks_ago = int((todays_date - timedelta(weeks=50)).strftime("%s"))

PATIENT_ID = "123456"
PATIENT_NAME = "testName"
SEX = "FEMALE"
HOUSEHOLD_NUMBER = "20"
DATE_STRING = "1990-05-30"
ZONE = "15"
VILLAGE_NUMBER = "50"
UNIT = "WEEKS"
HISTORY = "too much tylenol"
ALLERGY = "seafood"
PREGNANCY_START_DATE = two_weeks_ago

patient_with_valid_fields_should_return_none = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
    "is_archived": False,
}

patient_post_missing_required_field_patientId_should_throw_exception = {
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

patient_post_missing_required_field_patientName_should_throw_exception = {
    "id": PATIENT_ID,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

patient_post_missing_required_field_patientSex_should_throw_exception = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

patient_post_missing_required_field_dob_should_throw_exception = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

patient_post_missing_required_field_isExactDob_should_throw_exception = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

patient_post_missing_optional_field_isPregnant_return_none = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

patient_is_pregant_but_missing_pregnancyStartDate_should_throw_exception = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

# gestationalTimestamp must be less than or equal to 43 weeks/10 months
patient_pregnancy_period_exceed_43weeks_should_throw_exception = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": fifty_weeks_ago,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

# name must be type string
patient_field_patientName_has_invalid_type_should_throw_exception = {
    "id": PATIENT_ID,
    "name": 1,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

# id must be type str
patient_field_patientId_has_invalid_type_should_throw_exception = {
    "id": 1,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

# id must be less than or equal to 14 digits long
patient_field_patientId_has_more_than_14digits_should_throw_exception = {
    "id": "123456789012345",
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

# date_of_birth must be in YYYY-mm-dd format
patient_field_dob_has_wrong_format_should_throw_exception = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": "January 1, 1990",
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (patient_with_valid_fields_should_return_none, None),
        (
            patient_post_missing_required_field_patientId_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_post_missing_required_field_patientName_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_post_missing_required_field_patientSex_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_post_missing_required_field_dob_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_post_missing_required_field_isExactDob_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_post_missing_optional_field_isPregnant_return_none,
            None,
        ),
        (
            patient_is_pregant_but_missing_pregnancyStartDate_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_pregnancy_period_exceed_43weeks_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_field_patientName_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_field_patientId_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_field_patientId_has_more_than_14digits_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_field_dob_has_wrong_format_should_throw_exception,
            ValidationExceptionError,
        ),
    ],
)
def test_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            print(json)
            PatientPostValidator.validate(json)
    else:
        try:
            PatientPostValidator.validate(json)
        except ValidationExceptionError as e:
            print(json)
            raise AssertionError(f"Unexpected validation error:{e}") from e


#####################################
# Testing validation of PUT request #
#####################################
patient_put_with_valid_fields_should_return_none = {
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

patient_put_missing_optional_field_patientId_should_return_none = {
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

patient_put_has_mismatched_patientId_hould_throw_exception = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "pregnancy_start_date": PREGNANCY_START_DATE,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (patient_put_with_valid_fields_should_return_none, None),
        (patient_put_missing_optional_field_patientId_should_return_none, None),
        (
            patient_put_has_mismatched_patientId_hould_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_is_pregant_but_missing_pregnancyStartDate_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_pregnancy_period_exceed_43weeks_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_field_patientName_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_field_patientId_has_invalid_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_field_patientId_has_more_than_14digits_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            patient_field_dob_has_wrong_format_should_throw_exception,
            ValidationExceptionError,
        ),
    ],
)
def test_put_validation(json, expectation):
    patient_id = 123
    if expectation:
        with pytest.raises(expectation):
            PatientPutValidator.validate(json, patient_id)
    else:
        try:
            PatientPutValidator.validate(json, patient_id)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
