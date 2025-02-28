from datetime import datetime, timedelta

import pytest
from pydantic import ValidationError

from validation.patients import NestedPatient, UpdatePatientRequestBody

# Dynamically calculate valid and invalid gestation ages from todays date.
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
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
    "is_archived": False,
}

patient_post_missing_required_field_name_should_throw_exception = {
    "id": PATIENT_ID,
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

patient_post_missing_required_field_sex_should_throw_exception = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

patient_post_missing_required_field_date_of_birth_should_throw_exception = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
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
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}

patient_post_missing_optional_field_is_pregnant_return_none = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
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

# name must be type string
patient_field_name_has_invalid_type_should_throw_exception = {
    "id": PATIENT_ID,
    "name": 1,
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

# id must be type str
patient_field_id_has_invalid_type_should_throw_exception = {
    "id": 1,
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

# date_of_birth must be in YYYY-mm-dd format
patient_field_date_of_birth_has_wrong_format_should_throw_exception = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": "January 1, 1990",
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
    "drug_history": HISTORY,
    "medical_history": HISTORY,
    "allergy": ALLERGY,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (patient_with_valid_fields_should_return_none, None),
        (
            patient_post_missing_required_field_name_should_throw_exception,
            ValidationError,
        ),
        (
            patient_post_missing_required_field_sex_should_throw_exception,
            ValidationError,
        ),
        (
            patient_post_missing_required_field_date_of_birth_should_throw_exception,
            ValidationError,
        ),
        (
            patient_post_missing_required_field_isExactDob_should_throw_exception,
            ValidationError,
        ),
        (
            patient_post_missing_optional_field_is_pregnant_return_none,
            None,
        ),
        (
            patient_field_name_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            patient_field_id_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            patient_field_date_of_birth_has_wrong_format_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            print(json)
            NestedPatient(**json)
    else:
        try:
            NestedPatient(**json)
        except ValidationError as e:
            print(json)
            raise AssertionError(f"Unexpected validation error:{e}") from e


#####################################
# Testing validation of PUT request #
#####################################
patient_put_with_valid_fields_should_return_none = {
    "id": PATIENT_ID,
    "name": PATIENT_NAME,
    "is_pregnant": True,
    "sex": SEX,
    "household_number": HOUSEHOLD_NUMBER,
    "date_of_birth": DATE_STRING,
    "is_exact_date_of_birth": False,
    "zone": ZONE,
    "village_number": VILLAGE_NUMBER,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (patient_put_with_valid_fields_should_return_none, None),
        (
            patient_field_name_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            patient_field_id_has_invalid_type_should_throw_exception,
            ValidationError,
        ),
        (
            patient_field_date_of_birth_has_wrong_format_should_throw_exception,
            ValidationError,
        ),
    ],
)
def test_put_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            UpdatePatientRequestBody(**json)
    else:
        try:
            UpdatePatientRequestBody(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
