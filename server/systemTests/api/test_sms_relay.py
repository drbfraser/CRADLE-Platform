import pytest
import time
from typing import List

import data.crud as crud
from models import Reading, Patient, User, TrafficLightEnum
from pprint import pformat

import service.compressor as compressor
import service.encryptor as encryptor
import base64


def test_create_patient_with_nested_readings(database, api_post):
    patient_id = "5390160146141"
    reading_ids = [
        "65acfe28-b0d6-4a63-a484-eceb3277fb4e",
        "90293637-d763-494a-8cc7-85a88d023f3e",
    ]
    p = __make_patient(patient_id, reading_ids)

    endpoint = "patients"

    create_sms_relay_json(endpoint, p)
    response = api_post(endpoint="/api/sms_relay", json=p)
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

    data = {
        "endpoint": endpoint,
        "request": request_string
    }
    compressed_data = compressor.compress_from_string(json.dumps(data))
    encrypted_data = encryptor.encrypt(comp, user.secretKey)

    base64_data = base64.b64encode(encrypted_data)
    
    return {
        "phoneNumber": user.phoneNumber,
        "encryptedData": base64_data
    }

