from datetime import datetime, timedelta

import pytest

from validation.patients import PatientPostValidator, PatientPutValidator
from validation.validation_exception import ValidationExceptionError

# Dynamically calculate valid and invalid gestatation ages from todays date.
todays_date = datetime.today()
two_weeks_ago = int((todays_date - timedelta(weeks=2)).strftime("%s"))
fifty_weeks_ago = int((todays_date - timedelta(weeks=50)).strftime("%s"))

valid_json = {
    "patientId": "123456",
    "patientName": "testName",
    "isPregnant": True,
    "patientSex": "FEMALE",
    "householdNumber": "20",
    "dob": "1990-05-30",
    "isExactDob": False,
    "zone": "15",
    "villageNumber": "50",
    "pregnancyStartDate": two_weeks_ago,
    "gestationalAgeUnit": "WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil",
    "allergy": "seafood",
}

# Patient is pregnant but gestationalTimestamp is missing
missing_pregnancy_start_date = {
    "patientId": "123456",
    "patientName": "testName",
    "isPregnant": True,
    "patientSex": "FEMALE",
    "householdNumber": "20",
    "dob": "1990-05-30",
    "isExactDob": False,
    "zone": "15",
    "villageNumber": "50",
    "gestationalAgeUnit": "WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil",
    "allergy": "seafood",
}

# gestationalTimestamp must be less than or equal to 43 weeks/10 months
invalid_pregnancy_start_date = {
    "patientId": "123456",
    "patientName": "testName",
    "isPregnant": True,
    "patientSex": "FEMALE",
    "householdNumber": "20",
    "dob": "1990-05-30",
    "isExactDob": False,
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": fifty_weeks_ago,
    "gestationalAgeUnit": "WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil",
    "allergy": "seafood",
}

# patientName must be type string
not_type_string = {
    "patientId": "123456",
    "patientName": 11,
    "isPregnant": True,
    "patientSex": "FEMALE",
    "householdNumber": "20",
    "dob": "1990-05-30",
    "isExactDob": False,
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": two_weeks_ago,
    "gestationalAgeUnit": "WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil",
    "allergy": "seafood",
}

# patientId must be type int
not_type_int = {
    "patientId": "abc",
    "patientName": "testName",
    "isPregnant": True,
    "patientSex": "FEMALE",
    "householdNumber": "20",
    "dob": "1990-05-30",
    "isExactDob": False,
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": two_weeks_ago,
    "gestationalAgeUnit": "WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil",
    "allergy": "seafood",
}

# patientId must be less than or equal to 14 digits long
patient_id_too_long = {
    "patientId": "123456789012345",
    "patientName": "testName",
    "isPregnant": True,
    "patientSex": "FEMALE",
    "householdNumber": "20",
    "dob": "1990-05-30",
    "isExactDob": False,
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": two_weeks_ago,
    "gestationalAgeUnit": "WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil",
    "allergy": "seafood",
}

# dob must be in YYYY-mm-dd format
incorrect_dob_format = {
    "patientId": "123456",
    "patientName": "testName",
    "isPregnant": True,
    "patientSex": "FEMALE",
    "householdNumber": "20",
    "dob": "January 1, 1990",
    "isExactDob": False,
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": two_weeks_ago,
    "gestationalAgeUnit": "WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil",
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
        message = PatientPostValidator.validate(json)
        assert message is None, f"Expected None, but got {message}"


#####################################
# Testing validation of PUT request #
#####################################

valid_put_request = {"patientName": "AA"}
put_mismatched_patientId = {"patientId": "456"}
put_invalid_key = {"readingId": "asdfg123"}
put_not_type_str = {"patientName": 12}
put_invalid_dob = {"dob": "Oct 12, 2000"}
put_invalid_gest_timestamp = {"gestationalTimestamp": fifty_weeks_ago}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_put_request, None),
        (put_mismatched_patientId, ValidationExceptionError),
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
            PatientPutValidator.validate_put_request(json, patient_id)
    else:
        message = PatientPutValidator.validate_put_request(json, patient_id)
        assert message is None, f"Expected None, but got {message}"
