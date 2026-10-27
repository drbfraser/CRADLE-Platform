import pytest
from humps import decamelize

import data.db_operations as crud
from common.print_utils import pretty_print
from models import ReadingOrm


def test_invalid_reading_not_created(
    patient_id,
    reading_id,
    reading,
    patient_factory,
    api_post,
):
    patient_factory.create(id=patient_id)
    # Removed systolic_blood_pressure to make the reading invalid
    del reading["systolic_blood_pressure"]

    response = api_post(endpoint="/api/readings", json=reading)
    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 422
    assert crud.read(ReadingOrm, id=reading_id) is None


@pytest.fixture
def reading_id():
    return "9771e6ee-81af-41a4-afff-9676cadcc00a"


@pytest.mark.parametrize("endpoint", ["/api/readings", "/api/sync/readings?since=0"])
def test_mobile_reading_keeps_event_data_and_uses_signed_in_actor(
    patient_factory, api_post, endpoint
):
    patient = patient_factory.create()
    body = {
        "id": "mobile-reading-contract",
        "patientId": patient.id,
        "systolicBloodPressure": 110,
        "diastolicBloodPressure": 80,
        "heartRate": 70,
        "symptoms": ["Headache"],
        "dateTaken": 1704067200,
        "lastEdited": 1704067210,
        "dateRetestNeeded": 1704068100,
        "userId": 2,
    }
    try:
        response = api_post(
            endpoint=endpoint, json=[body] if "/sync/" in endpoint else body
        )

        assert response.status_code == (200 if "/sync/" in endpoint else 201)
        crud.db_session.rollback()
        stored = crud.read(ReadingOrm, id=body["id"])
        assert stored.user_id == 1
        assert stored.date_taken == body["dateTaken"]
        assert stored.last_edited == body["lastEdited"]
        assert stored.date_retest_needed == body["dateRetestNeeded"]
        assert stored.symptoms == "Headache"
    finally:
        crud.delete_by(ReadingOrm, id=body["id"])


@pytest.mark.parametrize(
    "retest_fields, expected_date",
    [
        ({"dateRetestNeeded": 1704068100}, 1704068100),
        ({"dateRetestNeeded": None}, None),
        ({}, None),
    ],
    ids=["reschedule", "clear-null", "clear-omitted"],
)
def test_reading_sync_updates_only_retest_date(
    patient_factory, reading_factory, api_post, retest_fields, expected_date
):
    patient = patient_factory.create()
    reading = reading_factory.create(
        patient_id=patient.id, user_id=2, date_retest_needed=1704067500
    )
    body = {
        "id": reading.id,
        "patientId": patient.id,
        "systolicBloodPressure": 160,
        "diastolicBloodPressure": 110,
        "heartRate": 100,
        "userId": 1,
        **retest_fields,
    }

    response = api_post(endpoint="/api/sync/readings?since=0", json=[body])

    assert response.status_code == 200
    crud.db_session.rollback()
    stored = crud.read(ReadingOrm, id=reading.id)
    assert stored.date_retest_needed == expected_date
    assert stored.user_id == 2
    assert stored.systolic_blood_pressure == 110
