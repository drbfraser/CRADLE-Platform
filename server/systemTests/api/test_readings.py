import pytest

import data.crud as crud
from models import Reading, Referral, FollowUp


def test_post_reading_with_referral_and_followup(
    reading_id, reading_referral_followup, patient_factory, api_post
):
    patient_factory.create(patientId="123")
    try:
        response = api_post(endpoint="/api/readings", json=reading_referral_followup)
        assert response.status_code == 201
        assert crud.read(Reading, readingId=reading_id) is not None
        assert crud.read(Referral, readingId=reading_id) is not None
        assert crud.read(FollowUp, readingId=reading_id) is not None

        # Reading should have it's traffic light computed
        reading = crud.read(Reading, readingId=reading_id)
        assert reading.trafficLightStatus.value == "GREEN"

        # Referral should be marked as assessed
        referral = crud.read(Referral, readingId=reading_id)
        assert referral.isAssessed
    finally:
        crud.delete_by(FollowUp, readingId=reading_id)
        crud.delete_by(Referral, readingId=reading_id)
        crud.delete_by(Reading, readingId=reading_id)


def test_post_reading_with_referral(
    reading_id, reading_referral_followup, patient_factory, api_post
):
    patient_factory.create(patientId="123")
    # Remove the followup
    del reading_referral_followup["followup"]
    try:
        response = api_post(endpoint="/api/readings", json=reading_referral_followup)
        assert response.status_code == 201
        assert crud.read(Reading, readingId=reading_id) is not None
        assert crud.read(Referral, readingId=reading_id) is not None
        assert crud.read(FollowUp, readingId=reading_id) is None

        # Reading should have it's traffic light computed
        reading = crud.read(Reading, readingId=reading_id)
        assert reading.trafficLightStatus.value == "GREEN"

        # Referral should be marked as not assessed
        referral = crud.read(Referral, readingId=reading_id)
        assert not referral.isAssessed
    finally:
        crud.delete_by(Referral, readingId=reading_id)
        crud.delete_by(Reading, readingId=reading_id)


def test_invalid_reading_not_created(
    reading_id, reading_referral_followup, patient_factory, api_post
):
    patient_factory.create(patientId="123")
    # Removed bpSystolic to make the eading invalid
    del reading_referral_followup["bpSystolic"]

    response = api_post(endpoint="/api/readings", json=reading_referral_followup)
    assert response.status_code == 400
    assert crud.read(Reading, readingId=reading_id) is None
    assert crud.read(Referral, readingId=reading_id) is None
    assert crud.read(FollowUp, readingId=reading_id) is None


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
        "referral": {
            "dateReferred": 340,
            "comment": "comment",
            "actionTaken": "action",
            "userId": 1,
            "patientId": "123",
            "referralHealthFacilityName": "H0000",
            "readingId": reading_id,
        },
        "followup": {
            "diagnosis": "diagnosis",
            "treatment": "treatment",
            "dateAssessed": 123456,
            "healthcareWorkerId": 2,
            "followupNeeded": False,
            "medicationPrescribed": "medicationPrescribed",
            "specialInvestigations": "specialInvestigations",
        },
    }
