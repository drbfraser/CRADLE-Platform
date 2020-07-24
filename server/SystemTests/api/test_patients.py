from typing import List

import data.crud as crud
from models import Patient, Reading, TrafficLightEnum


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

    assert response.status_code == 200
    assert crud.read(Patient, patientId=patient_id).patientName == "CD"


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
