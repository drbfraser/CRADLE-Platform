from datetime import datetime, timedelta

import pytest

from validation.patients import PatientPostValidator, PatientPutValidator
from validation.validation_exception import ValidationExceptionError

# Dynamically calculate valid and invalid gestatation ages from todays date.
todays_date = datetime.today()
two_weeks_ago = int((todays_date - timedelta(weeks=2)).strftime("%s"))
fifty_weeks_ago = int((todays_date - timedelta(weeks=50)).strftime("%s"))

valid_json = {
    "id": "123456",
    "name": "test_name",
    "is_pregnant": True,
    "sex": "FEMALE",
    "household_number": "20",
    "date_of_birth": "1990-05-30",
    "is_exact_date_of_birth": False,
    "zone": "15",
    "village_number": "50",
    "pregnancy_start_date": two_weeks_ago,
    "drug_history": "too much tylenol",
    "medical_history": "not enough advil",
    "allergy": "seafood",
}

# Patient is pregnant but gestational_timestamp is missing
missing_pregnancy_start_date = {
    "id": "123456",
    "name": "test_name",
    "is_pregnant": True,
    "sex": "FEMALE",
    "household_number": "20",
    "date_of_birth": "1990-05-30",
    "is_exact_date_of_birth": False,
    "zone": "15",
    "village_number": "50",
    "gestationalAgeUnit": "WEEKS",
    "drug_history": "too much tylenol",
    "medical_history": "not enough advil",
    "allergy": "seafood",
}

# gestational_timestamp must be less than or equal to 43 weeks/10 months
invalid_pregnancy_start_date = {
    "id": "123456",
    "name": "testName",
    "is_pregnant": True,
    "sex": "FEMALE",
    "household_number": "20",
    "date_of_birth": "1990-05-30",
    "is_exact_date_of_birth": False,
    "zone": "15",
    "village_number": "50",
    "gestational_timestamp": fifty_weeks_ago,
    "drug_history": "too much tylenol",
    "medical_history": "not enough advil",
    "allergy": "seafood",
}

# name must be type string
not_type_string = {
    "id": "123456",
    "name": 11,
    "is_pregnant": True,
    "sex": "FEMALE",
    "household_number": "20",
    "date_of_birth": "1990-05-30",
    "is_exact_date_of_birth": False,
    "zone": "15",
    "village_number": "50",
    "gestational_timestamp": two_weeks_ago,
    "drug_history": "too much tylenol",
    "medical_history": "not enough advil",
    "allergy": "seafood",
}

# id must be type int
not_type_int = {
    "id": "abc",
    "name": "testName",
    "is_pregnant": True,
    "sex": "FEMALE",
    "household_number": "20",
    "date_of_birth": "1990-05-30",
    "is_exact_date_of_birth": False,
    "zone": "15",
    "village_number": "50",
    "gestational_timestamp": two_weeks_ago,
    "drug_history": "too much tylenol",
    "medical_history": "not enough advil",
    "allergy": "seafood",
}

# id must be less than or equal to 14 digits long
patient_id_too_long = {
    "id": "123456789012345",
    "name": "testName",
    "is_pregnant": True,
    "sex": "FEMALE",
    "household_number": "20",
    "date_of_birth": "1990-05-30",
    "is_exact_date_of_birth": False,
    "zone": "15",
    "village_number": "50",
    "gestational_timestamp": two_weeks_ago,
    "drug_history": "too much tylenol",
    "medical_history": "not enough advil",
    "allergy": "seafood",
}

# date_of_birth must be in YYYY-mm-dd format
incorrect_dob_format = {
    "id": "123456",
    "name": "testName",
    "is_pregnant": True,
    "sex": "FEMALE",
    "household_number": "20",
    "date_of_birth": "January 1, 1990",
    "is_exact_date_of_birth": False,
    "zone": "15",
    "village_number": "50",
    "gestational_timestamp": two_weeks_ago,
    "drug_history": "too much tylenol",
    "medical_history": "not enough advil",
    "allergy": "seafood",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_json, None),
        (missing_pregnancy_start_date, ValidationExceptionError),
        (invalid_pregnancy_start_date, ValidationExceptionError),
        (not_type_string, ValidationExceptionError),
        (not_type_int, ValidationExceptionError),
        (patient_id_too_long, ValidationExceptionError),
        (incorrect_dob_format, ValidationExceptionError),
    ],
)
def test_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            PatientPostValidator.validate(json)
    else:
        try:
            PatientPostValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e


#####################################
# Testing validation of PUT request #
#####################################

valid_put_request = {"name": "AA"}
put_mismatched_patient_id = {"id": "456"}
put_invalid_key = {"reading_id": "asdfg123"}
put_not_type_str = {"name": 12}
put_invalid_dob = {"date_of_birth": "Oct 12, 2000"}
put_invalid_gest_timestamp = {"gestational_timestamp": fifty_weeks_ago}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_put_request, None),
        (put_mismatched_patient_id, ValidationExceptionError),
        (put_invalid_key, ValidationExceptionError),
        (put_not_type_str, ValidationExceptionError),
        (put_invalid_dob, ValidationExceptionError),
        (put_invalid_gest_timestamp, ValidationExceptionError),
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
