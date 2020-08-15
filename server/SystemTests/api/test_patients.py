from typing import List

import data.crud as crud
from models import Patient, Reading, TrafficLightEnum


def test_get_patient(patient_factory, api_get):
    patient_id = "341541641613"
    patient_factory.create(patientId=patient_id, lastEdited=5, created=1)

    expected = {
        "patientId": patient_id,
        "patientName": "Test",
        "patientAge": 30,
        "patientSex": "FEMALE",
        "isPregnant": False,
        "zone": "37",
        "villageNumber": "37",
        "created": 1,
        "lastEdited": 5,
        "base": 5,
        "readings": [],
    }

    response = api_get(endpoint=f"/api/patients/{patient_id}")

    assert response.status_code == 200
    assert expected == response.json()


def test_create_patient_with_nested_readings(database, api_post):
    patient_id = "5390160146141"
    reading_ids = [
        "65acfe28-b0d6-4a63-a484-eceb3277fb4e",
        "90293637-d763-494a-8cc7-85a88d023f3e",
    ]
    p = __make_patient(patient_id, reading_ids)
    response = api_post(endpoint="/api/patients", json=p)
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


def test_update_patient_name(patient_factory, api_put):
    patient_id = "64164134514"
    patient_factory.create(patientId=patient_id, patientName="AB")

    response = api_put(
        endpoint=f"/api/patients/{patient_id}/info", json={"patientName": "CD"}
    )
    response_body = response.json()
    print(response_body)

    assert response.status_code == 200
    assert crud.read(Patient, patientId=patient_id).patientName == "CD"


def test_update_patient_with_base(patient_factory, api_put):
    patient_id = "45642677524614"
    patient_factory.create(patientId=patient_id, patientName="AB", lastEdited=5)

    json = {
        "patientName": "CD",
        "lastEdited": 6,
        "base": 5,  # base == lastEdited -> request is accepted
    }
    response = api_put(endpoint=f"/api/patients/{patient_id}/info", json=json)

    assert response.status_code == 200
    patient = crud.read(Patient, patientId=patient_id)
    assert patient.patientName == "CD"
    assert patient.lastEdited == 6


def test_update_patient_abort_due_to_conflict(patient_factory, api_put):
    patient_id = "45642677524614"
    patient_factory.create(patientId=patient_id, patientName="AB", lastEdited=7)

    json = {
        "patientName": "CD",
        "lastEdited": 6,
        "base": 5,  # base != lastEdited -> request is rejected
    }
    response = api_put(endpoint=f"/api/patients/{patient_id}/info", json=json)

    assert response.status_code == 409
    patient = crud.read(Patient, patientId=patient_id)
    assert patient.patientName == "AB"
    assert patient.lastEdited == 7


def test_invalid_patient_not_created(patient_factory, api_post):
    patient_id = "48375354"
    # invalid as patientName is missing
    patient = {
        "patientId": patient_id,
        "patientAge": 30,
        "patientSex": "FEMALE",
        "isPregnant": False,
        "zone": "37",
        "villageNumber": "37",
        "created": 1,
        "lastEdited": 5,
        "base": 5,
        "readings": [],
    }
    response = api_post(endpoint="/api/patients", json=patient)
    assert response.status_code == 400
    assert crud.read(Patient, patientId=patient_id) is None


def __make_patient(patient_id: str, reading_ids: List[str]) -> dict:
    return {
        "patientId": patient_id,
        "patientName": "TEST",
        "patientAge": 30,
        "patientSex": "FEMALE",
        "isPregnant": False,
        "villageNumber": "1",
        "zone": "1",
        "readings": [__make_reading(r, patient_id) for r in reading_ids],
    }


def __make_reading(reading_id: str, patient_id: str) -> dict:
    return {
        "readingId": reading_id,
        "bpSystolic": 110,
        "bpDiastolic": 80,
        "heartRateBPM": 70,
        "symptoms": ["a", "b", "c"],
        "dateTimeTaken": 100,
        "userId": 1,
        "patientId": patient_id,
    }
