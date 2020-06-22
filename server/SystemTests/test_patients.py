import pytest
import requests
import json
import random
import string
import time
import uuid
from datetime import datetime
from manage import getRandomInitials


def get_login_token(email, password):
    url = "http://localhost:5000/api/user/auth"
    payload = {"email": email, "password": password}

    response = requests.post(url, json=payload)
    resp_json = response.json()
    return resp_json["token"]


def get_bearer_token(email, password):
    return "Bearer {}".format(get_login_token(email, password))


def get_authorization_header(email, password):
    auth = {"Authorization": get_bearer_token(email, password)}
    return auth


BASE_URL = "http://localhost:5000"
# date equivalent to Jan 1, 2000
EPOCH_BIRTHDATE = 946684800


def get_random_patient_id():
    return str(random.randint(48300000000, 48300099999))


def get_random_gender():
    GENDER_LIST = ["MALE", "FEMALE"]
    return GENDER_LIST[random.randint(0, 1)]


def get_random_UUID():
    return str(uuid.uuid4())


def get_random_user_id():
    return random.randint(1, 4)


def get_green_traffic_light():
    systolic = 126
    diastolic = 75
    hr = 84
    return {"bpSystolic": systolic, "bpDiastolic": diastolic, "hr": hr}


def get_yellow_up_traffic_light():
    systolic = 141
    diastolic = 83
    hr = 50
    return {"bpSystolic": systolic, "bpDiastolic": diastolic, "hr": hr}


def get_red_up_traffic_light():
    systolic = 112
    diastolic = 130
    hr = 99
    return {"bpSystolic": systolic, "bpDiastolic": diastolic, "hr": hr}


def get_random_symptoms():
    symptoms = ["headache", "body pain", "feverish", "bleeding"]
    return symptoms[random.randint(0, 3)]


auth_header = get_authorization_header("admin123@admin.com", "admin123")
##############################################################
#                     SUCCESS CODE 201 TESTS                 #
##############################################################
def test_pass_create_patient():
    patient_id = get_random_patient_id()
    patient_name = getRandomInitials()
    patient_sex = "FEMALE"

    url = BASE_URL + "/api/patient"

    data = {
        "patientId": patient_id,
        "patientName": patient_name,
        "patientSex": patient_sex,
    }

    response = requests.post(url, json=data, headers=auth_header)
    response_body = response.json()

    assert response.status_code == 201
    assert response_body["patientId"] == patient_id
    assert response_body["patientName"] == patient_name
    assert response_body["patientSex"] == patient_sex


def test_pass_create_patient_2():
    patient_id = get_random_patient_id()
    patient_name = getRandomInitials()
    patient_sex = "MALE"

    url = BASE_URL + "/api/patient"

    data = {
        "patientId": patient_id,
        "patientName": patient_name,
        "patientSex": patient_sex,
    }

    response = requests.post(url, json=data, headers=auth_header)
    response_body = json.loads(response.text)

    assert response.status_code == 201
    assert response_body["patientId"] == patient_id
    assert response_body["patientName"] == patient_name
    assert response_body["patientSex"] == patient_sex
    assert response_body["dob"] == None
    assert response_body["patientAge"] == None


def test_pass_create_patient_with_dob_no_age():
    patient_id = get_random_patient_id()
    patient_name = getRandomInitials()
    patient_sex = "MALE"

    url = BASE_URL + "/api/patient"

    data = {
        "patientId": patient_id,
        "patientName": patient_name,
        "patientSex": patient_sex,
        # dob equivalent to Jan 1, 2000
        "dob": EPOCH_BIRTHDATE,
    }

    # calculates age from Jan 1, 2000 birthdate
    SECONDS_IN_YEAR = 31557600
    age_in_database = (time.time() - EPOCH_BIRTHDATE) / SECONDS_IN_YEAR

    response = requests.post(url, json=data, headers=auth_header)
    response_body = json.loads(response.text)

    assert response.status_code == 201
    assert response_body["patientId"] == patient_id
    assert response_body["patientName"] == patient_name
    assert response_body["patientSex"] == patient_sex
    assert response_body["dob"] == EPOCH_BIRTHDATE
    assert response_body["patientAge"] == int(age_in_database)


def test_pass_create_patient_reading_with_dob_no_age():
    patient_id = get_random_patient_id()
    patient_name = getRandomInitials()
    patient_sex = get_random_gender()
    reading_id = get_random_UUID()

    vitals = get_green_traffic_light()
    bp_systolic = vitals["bpSystolic"]
    bp_diastolic = vitals["bpDiastolic"]
    hr = vitals["hr"]
    date_time_taken = int((datetime.now() - datetime(1970, 1, 1)).total_seconds())
    user_id = get_random_user_id()

    url = BASE_URL + "/api/patient/reading"

    patient = {
        "patientId": patient_id,
        "patientName": patient_name,
        "patientSex": patient_sex,
        # dob equivalent to Jan 1, 2000
        "dob": EPOCH_BIRTHDATE,
    }

    # calculates age from Jan 1, 2000 birthdate
    SECONDS_IN_YEAR = 31557600
    age_in_database = (time.time() - EPOCH_BIRTHDATE) / SECONDS_IN_YEAR

    reading = {
        "readingId": reading_id,
        "bpSystolic": bp_systolic,
        "bpDiastolic": bp_diastolic,
        "heartRateBPM": hr,
        "dateTimeTaken": date_time_taken,
        "userId": user_id,
        "isFlaggedForFollowup": "false",
        "symptoms": "heache",
    }
    data = {"patient": patient, "reading": reading}

    response = requests.post(url, json=data, headers=auth_header)
    response_body = json.loads(response.text)

    assert response.status_code == 201
    assert response_body["patient"]["patientId"] == patient_id
    assert response_body["patient"]["patientName"] == patient_name
    assert response_body["patient"]["patientSex"] == patient_sex
    assert response_body["reading"]["bpSystolic"] == bp_systolic
    assert response_body["reading"]["bpDiastolic"] == bp_diastolic
    assert response_body["reading"]["heartRateBPM"] == hr
    assert response_body["patient"]["dob"] == EPOCH_BIRTHDATE
    assert response_body["patient"]["patientAge"] == int(age_in_database)


def test_pass_create_patient_reading():
    patient_id = get_random_patient_id()
    patient_name = getRandomInitials()
    patient_sex = get_random_gender()
    reading_id = get_random_UUID()

    vitals = get_green_traffic_light()
    bp_systolic = vitals["bpSystolic"]
    bp_diastolic = vitals["bpDiastolic"]
    hr = vitals["hr"]
    date_time_taken = int((datetime.now() - datetime(1970, 1, 1)).total_seconds())
    user_id = get_random_user_id()

    url = BASE_URL + "/api/patient/reading"

    patient = {
        "patientId": patient_id,
        "patientName": patient_name,
        "patientSex": patient_sex,
    }

    reading = {
        "readingId": reading_id,
        "bpSystolic": bp_systolic,
        "bpDiastolic": bp_diastolic,
        "heartRateBPM": hr,
        "dateTimeTaken": date_time_taken,
        "userId": user_id,
        "isFlaggedForFollowup": "false",
        "symptoms": "heache",
    }
    data = {"patient": patient, "reading": reading}

    response = requests.post(url, json=data, headers=auth_header)
    response_body = json.loads(response.text)

    assert response.status_code == 201
    assert response_body["patient"]["patientId"] == patient_id
    assert response_body["patient"]["patientName"] == patient_name
    assert response_body["patient"]["patientSex"] == patient_sex
    assert response_body["reading"]["bpSystolic"] == bp_systolic
    assert response_body["reading"]["bpDiastolic"] == bp_diastolic
    assert response_body["reading"]["heartRateBPM"] == hr
    assert response_body["patient"]["dob"] == None
    assert response_body["patient"]["patientAge"] == None


def test_get_patient():

    # hardcoded id 204652 based on deterministic patient data seeded in test database
    url = BASE_URL + "/api/patient/204652"
    response = requests.get(url, headers=auth_header)
    response_body = response.json()

    # testing the 3 required fields of a patient
    assert response_body["patientId"] == "204652"
    assert response_body["patientName"] == "BB"
    assert response_body["patientSex"] == "FEMALE"
    assert response.status_code == 200


# ##############################################################
#                      ERROR CODE 400 TESTS                    #
# ##############################################################


def test_fail_create_patient_reading():
    # should fail because missing some reading information
    patient_id = get_random_patient_id()
    patient_name = getRandomInitials()
    patient_sex = get_random_gender()
    reading_id = get_random_UUID()

    url = BASE_URL + "/api/patient/reading"

    patient = {
        "patientId": patient_id,
        "patientName": patient_name,
        "patientSex": patient_sex,
    }

    reading = {
        "readingId": reading_id,
    }
    data = {"patient": patient, "reading": reading}

    response = requests.post(url, json=data, headers=auth_header)
    assert response.status_code == 400


def test_fail_create_patient_duplicate():
    # should fail because we are creating a duplicate patient

    patient_id = get_random_patient_id()
    patient_name = getRandomInitials()
    patient_sex = "MALE"

    url = BASE_URL + "/api/patient"

    data = {
        "patientId": patient_id,
        "patientName": patient_name,
        "patientSex": patient_sex,
    }

    response = requests.post(url, json=data, headers=auth_header)
    response = requests.post(url, json=data, headers=auth_header)

    assert response.status_code == 400


def test_fail_create_patient_missing_fields():
    # should fail because we are missing patient_name

    patient_id = get_random_patient_id()
    patient_sex = "FEMALE"

    url = BASE_URL + "/api/patient"

    data = {"patientId": patient_id, "patientSex": patient_sex}

    response = requests.post(url, json=data, headers=auth_header)
    assert response.status_code == 400


# Testing create patient facility relationship API
auth_header_hcw = get_authorization_header("hcw@hcw.com", "hcw123")


def test_pass_create_relationship():
    # has to be existing patient in seeded data
    patient_id = "400260"
    data = {"patientId": patient_id}
    url = BASE_URL + "/api/patient/facility"
    response = requests.post(url, json=data, headers=auth_header_hcw)
    assert response.status_code == 201
    response_body = response.json()
    assert response_body["message"] == "patient has been added to facility successfully"


def test_fail_duplicate_relationship():
    # has to be existing patient in seeded data
    patient_id = "204652"
    data = {"patientId": patient_id}
    url = BASE_URL + "/api/patient/facility" 
    # should fail because we're calling the api twice, with same patient_id
    requests.post(url,json=data, headers=auth_header_hcw)
    response = requests.post(url, json=data, headers=auth_header_hcw)
    response_body = response.json()
    assert response.status_code == 409
    assert response_body["message"] == "Duplicate entry"


def test_fail_invalid_patient_id():
    # should fail because we're passing a patient id that does not exist
    patient_id = "92837483"
    data = {"patientId": patient_id}
    url = BASE_URL + "/api/patient/facility" 
    response = requests.post(url, json=data, headers=auth_header_hcw)
    response_body = response.json()
    assert response.status_code == 404
    assert response_body["message"] == "This patient does not exist."
