from datetime import datetime, timedelta
import pytest
from Validation.patients import validate

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
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": two_weeks_ago, 
    "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil" 
}

# Patient is pregnant but gestationalTimestamp is missing
missing_gestational_timestamp = {
    "patientId": "123456",
    "patientName": "testName",
    "isPregnant": True, 
    "patientSex": "FEMALE",
    "householdNumber": "20", 
    "dob": "1990-05-30",
    "zone": "15",
    "villageNumber": "50",
    "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil" 
}

# gestationalTimestamp must be less than or equal to 43 weeks/10 months
invalid_gestational_timestamp = {
    "patientId": "123456",
    "patientName": "testName",
    "isPregnant": True, 
    "patientSex": "FEMALE",
    "householdNumber": "20", 
    "dob": "1990-05-30",
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": fifty_weeks_ago, 
    "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil" 
}

# patientName must be type string
not_type_string = {
    "patientId": "123456",
    "patientName": 11,
    "isPregnant": True, 
    "patientSex": "FEMALE",
    "householdNumber": "20", 
    "dob": "1990-05-30",
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": two_weeks_ago, 
    "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil" 
}

# patientId must be type int
not_type_int = {
    "patientId": "abc",
    "patientName": "testName",
    "isPregnant": True, 
    "patientSex": "FEMALE",
    "householdNumber": "20", 
    "dob": "1990-05-30",
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": two_weeks_ago, 
    "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil" 
}

# patientId must be less than or equal to 14 digits long
patient_id_too_long = {
    "patientId": "123456789012345",
    "patientName": "testName",
    "isPregnant": True, 
    "patientSex": "FEMALE",
    "householdNumber": "20", 
    "dob": "1990-05-30",
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": two_weeks_ago, 
    "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil" 
}

# dob must be in YYYY-mm-dd format
incorrect_dob_format = {
    "patientId": "123456",
    "patientName": "testName",
    "isPregnant": True, 
    "patientSex": "FEMALE",
    "householdNumber": "20", 
    "dob": "January 1, 1990",
    "zone": "15",
    "villageNumber": "50",
    "gestationalTimestamp": two_weeks_ago, 
    "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS",
    "drugHistory": "too much tylenol",
    "medicalHistory": "not enough advil" 
}

@pytest.mark.parametrize(
    "json, output",
    [(valid_json, type(None)), (missing_gestational_timestamp, str), (invalid_gestational_timestamp, str), (not_type_string, str), (not_type_int, str), (patient_id_too_long, str), (incorrect_dob_format, str)],
)
def test_validation(json, output):
    message = validate(json)
    assert type(message) == output