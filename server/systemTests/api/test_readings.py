import pytest

import data.crud as crud
from models import Reading, Referral, FollowUp


def test_invalid_reading_not_created(reading_id, reading, patient_factory, api_post):
    patient_factory.create(patientId="123")
    # Removed bpSystolic to make the eading invalid
    del reading_referral_followup["bpSystolic"]

    response = api_post(endpoint="/api/readings", json=reading)
    assert response.status_code == 400
    assert crud.read(Reading, readingId=reading_id) is None


@pytest.fixture
def reading_id():
    return "9771e6ee-81af-41a4-afff-9676cadcc00a"


@pytest.fixture
def reading_referral_followup(reading_id):
    return {
        "readingId": reading_id,
        "bpSystolic": 110,
        "bpDiastolic": 80,
        "heartRateBPM": 70,
        "symptoms": ["unwell", "bleeding"],
        "dateTimeTaken": 320,
        "userId": 1,
        "patientId": "123",
    }
