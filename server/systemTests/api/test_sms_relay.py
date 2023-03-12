import pytest
from typing import List

import data.crud as crud
from models import Reading, Patient, User, Referral, FollowUp
from enums import TrafficLightEnum

import service.compressor as compressor
import service.encryptor as encryptor
import base64
import json

sms_relay_endpoint = "/api/sms_relay"


def test_create_patient_with_sms_relay(database, api_post):
    patient_id = "5390160146141"
    reading_ids = [
        "65acfe28-b0d6-4a63-a484-eceb3277fb4e",
        "90293637-d763-494a-8cc7-85a88d023f3e",
    ]

    patient_json = __make_patient(patient_id, reading_ids)

    method = "post"
    endpoint = "patients"

    json_request = __make_sms_relay_json(method, endpoint, patient_json)
    response = api_post(endpoint=sms_relay_endpoint, json=json_request)
    database.session.commit()

    try:
        assert response.status_code == 201
        assert crud.read(Patient, patientId=patient_id) is not None

        for r in reading_ids:
            reading = crud.read(Reading, readingId=r)
            assert reading is not None
            assert reading.trafficLightStatus == TrafficLightEnum.GREEN
    finally:
        for r in reading_ids:
            crud.delete_by(Reading, readingId=r)
        crud.delete_by(Patient, patientId=patient_id)


def test_create_referral_with_sms_relay(
    database, api_post, create_patient, patient_info
):
    create_patient()
    patient_id = patient_info["patientId"]
    referral_id = "65acfe28-b0d6-4a63-a484-eceb3277fb4e"
    referral_json = __make_referral(referral_id, patient_id)

    method = "post"
    endpoint = "referrals"

    json_request = __make_sms_relay_json(method, endpoint, referral_json)

    response = api_post(endpoint=sms_relay_endpoint, json=json_request)
    database.session.commit()

    try:
        assert response.status_code == 201
        assert crud.read(Referral, id=referral_id) is not None

    finally:
        crud.delete_by(Referral, id=referral_id)


def test_create_readings_with_sms_relay(
    database, api_post, create_patient, patient_info
):
    create_patient()
    patient_id = patient_info["patientId"]
    reading_id = "65acfe28-b0d6-4a63-a484-eceb3277fb4e"
    referral_json = __make_reading(reading_id, patient_id)

    method = "post"
    endpoint = "readings"

    json_request = __make_sms_relay_json(method, endpoint, referral_json)

    response = api_post(endpoint=sms_relay_endpoint, json=json_request)
    database.session.commit()

    try:
        assert response.status_code == 201
        assert crud.read(Reading, readingId=reading_id) is not None

    finally:
        crud.delete_by(Reading, readingId=reading_id)


def test_update_patient_name_with_sms_relay(database, patient_factory, api_post):
    patient_id = "64164134515"
    patient_factory.create(patientId=patient_id, patientName="AB")
    new_patient_name = "CD"

    patient_update_json = {"patientName": new_patient_name}

    method = "put"
    endpoint = "patients/{patient_id}/info".format(patient_id=patient_id)

    json_request = __make_sms_relay_json(method, endpoint, patient_update_json)

    response = api_post(endpoint=sms_relay_endpoint, json=json_request)
    database.session.commit()

    assert response.status_code == 200
    assert crud.read(Patient, patientId=patient_id).patientName == new_patient_name


def test_create_assessments_with_sms_relay(
    database, create_patient, patient_info, api_post
):
    create_patient()
    patient_id = patient_info["patientId"]
    assessment_json = __make_assessment(patient_id)

    method = "post"
    endpoint = "assessments"

    json_request = __make_sms_relay_json(method, endpoint, assessment_json)

    response = api_post(endpoint=sms_relay_endpoint, json=json_request)
    database.session.commit()

    followupInstructions = assessment_json["followupInstructions"]

    assert response.status_code == 201
    assert (
        crud.read(FollowUp, patientId=patient_id).followupInstructions
        == followupInstructions
    )


def test_update_assessments_with_sms_relay(
    database, patient_factory, followup_factory, api_post
):
    patient_id = "64164134515"
    patient_factory.create(patientId=patient_id, patientName="AB")

    assessment_json = __make_assessment(patient_id)
    followup_factory.create(patientId=patient_id)
    assessment_id = crud.read(FollowUp, patientId=patient_id).id

    newInstructions = "II"
    assessment_json["followupInstructions"] = newInstructions

    method = "put"
    endpoint = "assessments/{}".format(assessment_id)

    json_request = __make_sms_relay_json(method, endpoint, assessment_json)
    response = api_post(endpoint=sms_relay_endpoint, json=json_request)
    database.session.commit()

    assert response.status_code == 200
    assert crud.read(FollowUp, id=assessment_id).followupInstructions == newInstructions


def __make_sms_relay_json(method, endpoint, request):
    user = crud.read(User, id=1)

    request_string = json.dumps(request)

    data = {"method": method, "endpoint": endpoint, "request": request_string}

    compressed_data = compressor.compress_from_string(json.dumps(data))
    encrypted_data = encryptor.encrypt(compressed_data, user.secretKey)

    base64_data = base64.b64encode(encrypted_data)
    base64_string = base64_data.decode("utf-8")

    return {"phoneNumber": user.phoneNumber, "encryptedData": base64_string}


def __make_patient(patient_id: str, reading_ids: List[str]) -> dict:
    return {
        "patientId": patient_id,
        "patientName": "TEST",
        "patientSex": "FEMALE",
        "isPregnant": False,
        "dob": "2004-01-01",
        "isExactDob": False,
        "villageNumber": "1",
        "zone": "1",
        "readings": [__make_reading(r, patient_id) for r in reading_ids],
    }


def __make_reading(reading_id: str, patient_id: str) -> dict:
    return {
        "readingId": reading_id,
        "bpSystolic": 99,
        "bpDiastolic": 80,
        "heartRateBPM": 70,
        "symptoms": ["a", "b", "c"],
        "dateTimeTaken": 100,
        "userId": 1,
        "patientId": patient_id,
    }


def __make_referral(referral_id: str, patient_id: str) -> dict:
    return {
        "id": referral_id,
        "comment": "here is a comment",
        "patientId": patient_id,
        "referralHealthFacilityName": "H0000",
    }


def __make_assessment(patient_id: str) -> dict:
    return {
        "patientId": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medicationPrescribed": "M",
        "specialInvestigations": "S",
        "followupInstructions": "I",
        "followupNeeded": True,
    }
