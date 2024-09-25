import pytest
from requests import Response

import models


def test_create_followup_without_referral(
    database, patient_factory, reading_factory, api_post,
):
    patient_id = "7800"
    patient_factory.create(patientId=patient_id)

    followup_json = {
        "patientId": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medicationPrescribed": "M",
        "specialInvestigations": "S",
        "followupInstructions": "I",
        "followupNeeded": True,
    }
    response: Response = api_post(endpoint="/api/assessments", json=followup_json)
    database.session.commit()

    assert response.status_code == 201


@pytest.mark.skip(
    reason="Referral is no longer marked as assessed. TODO: check this is correct.",
)
def test_create_followup_marks_referral_as_assessed(
    database, patient_factory, reading_factory, referral_factory, api_post,
):
    patient_id = "7800"
    reading_id = "8311d551-03d2-44c6-857a-f1927c5177e3"
    patient_factory.create(patientId=patient_id)
    reading_factory.create(patientId=patient_id, readingId=reading_id)
    referral = referral_factory.create(patientId=patient_id)
    assert not referral.isAssessed

    followup_json = {
        "patientId": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medicationPrescribed": "M",
        "specialInvestigations": "S",
        "followupInstructions": "I",
        "followupNeeded": True,
    }
    response: Response = api_post(endpoint="/api/assessments", json=followup_json)
    database.session.commit()

    assert response.status_code == 201
    referral = models.Referral.query.filter_by(id=referral.id).first()
    assert referral.isAssessed


def test_invalid_followup_not_created(
    database, patient_factory, referral_factory, api_post,
):
    patient_id = "7800"
    patient_factory.create(patientId=patient_id)

    # Invalid as followupInstructions is missing when followupNeeded is True
    followup_json = {
        "patientId": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medicationPrescribed": "M",
        "specialInvestigations": "S",
        "followupNeeded": True,
    }
    response: Response = api_post(endpoint="/api/assessments", json=followup_json)
    database.session.commit()
    assert response.status_code == 400
