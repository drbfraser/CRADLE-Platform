import gzip
import io
import json
from typing import List, Optional

import requests
from humps import decamelize

from common import phone_number_utils
from common import user_utils
from common.print_utils import pretty_print
from data import crud
from enums import TrafficLightEnum
from models import (
    AssessmentOrm,
    PatientOrm,
    ReadingOrm,
    ReferralOrm,
    SmsSecretKeyOrm,
    UserOrm,
)
from service import compressor, encryptor

sms_relay_endpoint = "/api/sms_relay"
USER_ID = 1

def test_create_patient_with_sms_relay(database, api_post, auth_header):
    patient_id = "5390160146141"
    reading_ids = [
        "65acfe28-b0d6-4a63-a484-eceb3277fb4e",
        "90293637-d763-494a-8cc7-85a88d023f3e",
    ]
    
    patient_json = __make_patient(patient_id, reading_ids)
    request_number = user_utils.get_expected_sms_relay_request_number(USER_ID)

    request_body = make_sms_relay_json(
        request_number=request_number,
        method="POST",
        endpoint="api/patients",
        headers=auth_header,
        body=patient_json,
    )
    response = api_post(endpoint=sms_relay_endpoint, json=request_body)
    database.session.commit()

    response_body = decamelize(response.json())
    decrypted_response = get_sms_relay_response(response)
    pretty_print(decrypted_response)

    try:
        assert response.status_code == 200
        assert response_body["code"] == 201
        assert crud.read(PatientOrm, id=patient_id) is not None

        for reading_id in reading_ids:
            reading = crud.read(ReadingOrm, id=reading_id)
            assert reading is not None
            assert reading.traffic_light_status == TrafficLightEnum.GREEN
    finally:
        for reading_id in reading_ids:
            crud.delete_by(ReadingOrm, id=reading_id)
        crud.delete_by(PatientOrm, id=patient_id)


def test_create_referral_with_sms_relay(
    database, api_post, create_patient, patient_info, auth_header
):
    create_patient()
    patient_id = patient_info["id"]
    referral_id = "65acfe28-b0d6-4a63-a484-eceb3277fb4e"
    referral_json = __make_referral(referral_id, patient_id)

    request_number = user_utils.get_expected_sms_relay_request_number(USER_ID)

    request_body = make_sms_relay_json(
        request_number,
        method="POST",
        endpoint="api/referrals",
        headers=auth_header,
        body=referral_json,
    )

    response = api_post(endpoint=sms_relay_endpoint, json=request_body)
    database.session.commit()

    response_body = decamelize(response.json())
    decrypted_response = get_sms_relay_response(response)
    pretty_print(decrypted_response)

    try:
        assert response.status_code == 200
        assert response_body["code"] == 201
        assert crud.read(ReferralOrm, id=referral_id) is not None

    finally:
        crud.delete_by(ReferralOrm, id=referral_id)


def test_create_readings_with_sms_relay(
    database,
    api_post,
    create_patient,
    patient_info,
    auth_header,
):
    create_patient()
    patient_id = patient_info["id"]
    reading_id = "65acfe28-b0d6-4a63-a484-eceb3277fb4e"
    referral_json = __make_reading(reading_id, patient_id)

    request_number = user_utils.get_expected_sms_relay_request_number(USER_ID)

    request_body = make_sms_relay_json(
        request_number=request_number,
        method="POST",
        endpoint="api/readings",
        headers=auth_header,
        body=referral_json,
    )

    response = api_post(endpoint=sms_relay_endpoint, json=request_body)
    database.session.commit()

    response_body = decamelize(response.json())
    decrypted_response = get_sms_relay_response(response)
    pretty_print(decrypted_response)

    try:
        assert response.status_code == 200
        assert response_body["code"] == 201
        assert crud.read(ReadingOrm, id=reading_id) is not None

    finally:
        crud.delete_by(ReadingOrm, id=reading_id)


def test_update_patient_name_with_sms_relay(
    database,
    patient_factory,
    api_post,
    api_get,
    auth_header,
):
    patient_id = "64164134515"
    patient_factory.create(id=patient_id, name="AB")
    new_patient_name = "CD"

    response = api_get(endpoint=f"/api/patients/{patient_id}/info")
    patient = decamelize(response.json())

    patient["name"] = new_patient_name
    request_number = user_utils.get_expected_sms_relay_request_number(USER_ID)

    request_body = make_sms_relay_json(
        request_number=request_number,
        method="PUT",
        endpoint=f"api/patients/{patient_id}/info",
        headers=auth_header,
        body=patient,
    )

    response = api_post(endpoint=sms_relay_endpoint, json=request_body)
    database.session.commit()

    response_body = decamelize(response.json())
    decrypted_response = get_sms_relay_response(response)
    pretty_print(decrypted_response)

    assert response.status_code == 200
    assert response_body["code"] == 200
    patient_orm = crud.read(PatientOrm, id=patient_id)
    assert patient_orm is not None
    assert patient_orm.name == new_patient_name


def test_create_assessments_with_sms_relay(
    database,
    create_patient,
    patient_info,
    api_post,
    auth_header,
):
    create_patient()
    patient_id = patient_info["id"]
    assessment_json = __make_assessment(patient_id)
    request_number = user_utils.get_expected_sms_relay_request_number(USER_ID)

    request_body = make_sms_relay_json(
        request_number=request_number,
        method="POST",
        endpoint="api/assessments",
        headers=auth_header,
        body=assessment_json,
    )

    response = api_post(endpoint=sms_relay_endpoint, json=request_body)
    database.session.commit()

    follow_up_instructions = assessment_json["follow_up_instructions"]

    response_body = decamelize(response.json())
    decrypted_response = get_sms_relay_response(response)
    pretty_print(decrypted_response)

    assert response.status_code == 200
    assert response_body["code"] == 201
    assert (
        crud.read(AssessmentOrm, patient_id=patient_id).follow_up_instructions
        == follow_up_instructions
    )


def test_update_assessments_with_sms_relay(
    database,
    patient_factory,
    followup_factory,
    api_post,
    api_get,
    auth_header,
):
    patient_id = "64164134515"
    patient_factory.create(id=patient_id, name="AB")

    assessment_json = __make_assessment(patient_id)
    followup_factory.create(**assessment_json)
    assessment_id = crud.read(AssessmentOrm, patient_id=patient_id).id

    response = api_get(endpoint=f"/api/assessments/{assessment_id}")
    assessment_json = decamelize(response.json())
    print(assessment_json)

    new_instructions = "II"
    assessment_json["follow_up_instructions"] = new_instructions
    request_number = user_utils.get_expected_sms_relay_request_number(USER_ID)

    request_body = make_sms_relay_json(
        request_number=request_number,
        method="PUT",
        endpoint=f"/api/assessments/{assessment_id}",
        headers=auth_header,
        body=assessment_json,
    )
    response = api_post(endpoint=sms_relay_endpoint, json=request_body)
    database.session.commit()

    response_body = decamelize(response.json())
    decrypted_response = get_sms_relay_response(response)
    pretty_print(decrypted_response)

    assert response.status_code == 200
    assert response_body["code"] == 200
    assert (
        crud.read(AssessmentOrm, id=assessment_id).follow_up_instructions
        == new_instructions
    )


def make_sms_relay_json(
    request_number: int,
    method: str,
    endpoint: str,
    headers: Optional[dict[str, str]] = None,
    body: Optional[dict[str, str]] = None,
) -> dict:
    user = crud.read(UserOrm, id=1)
    assert user is not None
    secret_key = crud.read(SmsSecretKeyOrm, user_id=1)
    # update for multiple phone numbers schema: each user is guaranteed to have at least one phone number
    phone_number = phone_number_utils.get_users_phone_numbers(user_id=1)[
        0
    ]  # just need one phone number that belongs to the user

    data = {
        "request_number": request_number,
        "method": method,
        "endpoint": endpoint,
    }

    if headers is not None:
        data["headers"] = headers
    if body is not None:
        data["body"] = json.dumps(body)

    compressed_data = compressor.compress_from_string(json.dumps(data))
    iv = "00112233445566778899aabbccddeeff"
    encrypted_data = encryptor.encrypt(compressed_data, iv, secret_key.secret_key)

    return {"phone_number": phone_number, "encrypted_data": encrypted_data}


def get_sms_relay_response(response: requests.Response) -> dict:
    secret_key = crud.read(SmsSecretKeyOrm, user_id=1)

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
