import models
from requests import Response


def test_create_followup_without_referral(
    database, patient_factory, reading_factory, api_post
):
    patient_id = "7800"
    reading_id = "ee7c9bf2-0f53-4eaa-9bdf-47c1975f041f"
    patient_factory.create(patientId=patient_id)
    reading_factory.create(patientId=patient_id, readingId=reading_id)

    followup_json = {
        "diagnosis": "D",
        "treatment": "T",
        "medicationPrescribed": "M",
        "specialInvestigations": "S",
        "followupInstructions": "I",
        "followupNeeded": True,
        "readingId": reading_id,
    }
    response: Response = api_post(endpoint="/api/assessments", json=followup_json)
    database.session.commit()

    assert response.status_code == 201
    reading = models.Reading.query.filter_by(readingId=reading_id).first()
    assert reading.followup is not None


def test_create_followup_marks_referral_as_assessed(
    database, patient_factory, reading_factory, referral_factory, api_post
):
    patient_id = "7800"
    reading_id = "8311d551-03d2-44c6-857a-f1927c5177e3"
    patient_factory.create(patientId=patient_id)
    reading_factory.create(patientId=patient_id, readingId=reading_id)
    referral = referral_factory.create(patientId=patient_id, readingId=reading_id)
    assert not referral.isAssessed

    followup_json = {
        "diagnosis": "D",
        "treatment": "T",
        "medicationPrescribed": "M",
        "specialInvestigations": "S",
        "followupInstructions": "I",
        "followupNeeded": True,
        "readingId": reading_id,
    }
    response: Response = api_post(endpoint="/api/assessments", json=followup_json)
    database.session.commit()

    assert response.status_code == 201
    referral = models.Referral.query.filter_by(id=referral.id).first()
    assert referral.isAssessed
