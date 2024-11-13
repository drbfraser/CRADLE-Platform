import gzip
import io
import json
from typing import List

import requests

from data import crud
from enums import TrafficLightEnum
from models import (
    FollowUpOrm,
    PatientOrm,
    ReadingOrm,
    ReferralOrm,
    SmsSecretKeyOrm,
    UserOrm,
    UserPhoneNumberOrm,
)
from service import compressor, encryptor

sms_relay_endpoint = "/api/sms_relay"


def test_create_patient_with_sms_relay(database, api_post):
    patient_id = "5390160146141"
    reading_ids = [
        "65acfe28-b0d6-4a63-a484-eceb3277fb4e",
        "90293637-d763-494a-8cc7-85a88d023f3e",
    ]

    patient_json = __make_patient(patient_id, reading_ids)

    method = "POST"
    endpoint = "api/patients"

    json_body = make_sms_relay_json(1, method, endpoint, body=patient_json)
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)
    database.session.commit()
    response_dict = json.loads(response.text)
    try:
        assert response.status_code == 200
        assert response_dict["code"] == 201
        assert crud.read(PatientOrm, patientId=patient_id) is not None

        for r in reading_ids:
            reading = crud.read(ReadingOrm, readingId=r)
            assert reading is not None
            assert reading.traffic_light_status == TrafficLightEnum.GREEN
    finally:
        for r in reading_ids:
            crud.delete_by(ReadingOrm, id=r)
        crud.delete_by(PatientOrm, id=patient_id)


def test_create_referral_with_sms_relay(
    database,
    api_post,
    create_patient,
    patient_info,
):
    create_patient()
    patient_id = patient_info["id"]
    referral_id = "65acfe28-b0d6-4a63-a484-eceb3277fb4e"
    referral_json = __make_referral(referral_id, patient_id)

    method = "POST"
    endpoint = "api/referrals"

    json_body = make_sms_relay_json(2, method, endpoint, body=referral_json)

    response = api_post(endpoint=sms_relay_endpoint, json=json_body)
    database.session.commit()
    response_dict = json.loads(response.text)

    try:
        assert response.status_code == 200
        assert response_dict["code"] == 201
        assert crud.read(ReferralOrm, id=referral_id) is not None

    finally:
        crud.delete_by(ReferralOrm, id=referral_id)


def test_create_readings_with_sms_relay(
    database,
    api_post,
    create_patient,
    patient_info,
):
    create_patient()
    patient_id = patient_info["id"]
    reading_id = "65acfe28-b0d6-4a63-a484-eceb3277fb4e"
    referral_json = __make_reading(reading_id, patient_id)

    method = "POST"
    endpoint = "api/readings"

    json_body = make_sms_relay_json(3, method, endpoint, body=referral_json)

    response = api_post(endpoint=sms_relay_endpoint, json=json_body)
    database.session.commit()
    response_dict = json.loads(response.text)

    try:
        assert response.status_code == 200
        assert response_dict["code"] == 201
        assert crud.read(ReadingOrm, readingId=reading_id) is not None

    finally:
        crud.delete_by(ReadingOrm, readingId=reading_id)


def test_update_patient_name_with_sms_relay(database, patient_factory, api_post):
    patient_id = "64164134515"
    patient_factory.create(patientId=patient_id, patientName="AB")
    new_patient_name = "CD"

    patient_update_json = {"name": new_patient_name}

    method = "PUT"
    endpoint = f"api/patients/{patient_id}/info"

    json_body = make_sms_relay_json(4, method, endpoint, body=patient_update_json)

    response = api_post(endpoint=sms_relay_endpoint, json=json_body)
    database.session.commit()
    response_dict = json.loads(response.text)

    assert response.status_code == 200
    assert response_dict["code"] == 200
    assert crud.read(PatientOrm, id=patient_id).name == new_patient_name


def test_create_assessments_with_sms_relay(
    database,
    create_patient,
    patient_info,
    api_post,
):
    create_patient()
    patient_id = patient_info["id"]
    assessment_json = __make_assessment(patient_id)

    method = "POST"
    endpoint = "api/assessments"

    json_body = make_sms_relay_json(5, method, endpoint, body=assessment_json)

    response = api_post(endpoint=sms_relay_endpoint, json=json_body)
    database.session.commit()

    follow_up_instructions = assessment_json["follow_up_instructions"]
    response_dict = json.loads(response.text)

    assert response.status_code == 200
    assert response_dict["code"] == 201
    assert (
        crud.read(FollowUpOrm, patientId=patient_id).follow_up_instructions
        == follow_up_instructions
    )


def test_update_assessments_with_sms_relay(
    database,
    patient_factory,
    followup_factory,
    api_post,
):
    patient_id = "64164134515"
    patient_factory.create(patientId=patient_id, patientName="AB")

    assessment_json = __make_assessment(patient_id)
    followup_factory.create(patientId=patient_id)
    assessment_id = crud.read(FollowUpOrm, patientId=patient_id).id

    newInstructions = "II"
    assessment_json["follow_up_instructions"] = newInstructions

    method = "PUT"
    endpoint = f"api/assessments/{assessment_id}"

    json_body = make_sms_relay_json(6, method, endpoint, body=assessment_json)
    response = api_post(endpoint=sms_relay_endpoint, json=json_body)
    database.session.commit()
    response_dict = json.loads(response.text)
    assert response.status_code == 200
    assert response_dict["code"] == 200
    assert (
        crud.read(FollowUpOrm, id=assessment_id).follow_up_instructions
        == newInstructions
    )


def make_sms_relay_json(
    request_number: int,
    method: str,
    endpoint: str,
    header: str = None,
    body: str = None,
) -> dict:
    user = crud.read(UserOrm, id=1)
    secret_key = crud.read(SmsSecretKeyOrm, user_id=1)
    # update for multiple phone numbers schema: each user is guaranteed to have at least one phone number
    phone_number = crud.read_all(
        UserPhoneNumberOrm,
        user_id=user.id,
    ).pop()  # just need one phone number that belongs to the user

    data = {"request_number": request_number, "method": method, "endpoint": endpoint}

    if header:
        data["header"] = header

    if body:
        body_string = json.dumps(body)
        data["body"] = body_string

    compressed_data = compressor.compress_from_string(json.dumps(data))
    iv = "00112233445566778899aabbccddeeff"
    encrypted_data = encryptor.encrypt(compressed_data, iv, secret_key.secret_key)

    return {"phone_number": phone_number.phone_number, "encrypted_data": encrypted_data}


def get_sms_relay_response(response: requests.Response) -> dict:
    secret_key = crud.read(SmsSecretKeyOrm, userId=1)

    response_dict = json.loads(response.text)
    decrypted_data = encryptor.decrypt(response_dict["body"], secret_key.secret_key)
    decoded_string = (
        gzip.GzipFile(fileobj=io.BytesIO(decrypted_data), mode="r").read().decode()
    )

    new_response = {"body": decoded_string, "code": response_dict["code"]}

    return new_response


def __make_patient(patient_id: str, reading_ids: List[str]) -> dict:
    return {
        "id": patient_id,
        "name": "TEST",
        "sex": "FEMALE",
        "is_pregnant": False,
        "date_of_birth": "2004-01-01",
        "is_exact_date_of_birth": False,
        "village_number": "1",
        "zone": "1",
        "readings": [__make_reading(r, patient_id) for r in reading_ids],
    }


def __make_reading(reading_id: str, patient_id: str) -> dict:
    return {
        "id": reading_id,
        "systolic_blood_pressure": 99,
        "diastolic_blood_pressure": 80,
        "heart_rate": 70,
        "symptoms": ["a", "b", "c"],
        "date_taken": 100,
        "user_id": 1,
        "patient_id": patient_id,
    }


def __make_referral(referral_id: str, patient_id: str) -> dict:
    return {
        "id": referral_id,
        "comment": "here is a comment",
        "patient_id": patient_id,
        "health_facility_name": "H0000",
    }


def __make_assessment(patient_id: str) -> dict:
    return {
        "patient_id": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medication_prescribed": "M",
        "special_investigations": "S",
        "follow_up_instructions": "I",
        "follow_up_needed": True,
    }
