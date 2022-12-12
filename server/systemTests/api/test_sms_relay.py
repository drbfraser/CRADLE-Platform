import pytest
import time
from typing import List

import data.crud as crud
from models import Reading, Patient, User, TrafficLightEnum
from pprint import pformat

import service.compressor as compressor
import service.encryptor as encryptor
import base64


def test_create_patient_with_sms_relay(database, api_post):
    patient_id = "5390160146141"
    reading_ids = [
        "65acfe28-b0d6-4a63-a484-eceb3277fb4e",
        "90293637-d763-494a-8cc7-85a88d023f3e",
    ]
    patient_json = __make_patient(patient_id, reading_ids)

    endpoint = "patients"

    json_request = create_sms_relay_json(endpoint, patient_json)
    response = api_post(endpoint="/api/sms_relay", json=json_request)
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


def create_sms_relay_json(endpoint, request):
    user = crud.read(User, id=1)

    request_string = json.dumps(request)

    data = {"endpoint": endpoint, "request": request_string}
    compressed_data = compressor.compress_from_string(json.dumps(data))
    encrypted_data = encryptor.encrypt(comp, user.secretKey)

    base64_data = base64.b64encode(encrypted_data)

    return {"phoneNumber": user.phoneNumber, "encryptedData": base64_data}

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
        "readings": [
            __make_reading_no_extra_vitals(r, patient_id) for r in reading_ids
        ],
    }

def __make_reading_no_extra_vitals(reading_id: str, patient_id: str) -> dict:
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