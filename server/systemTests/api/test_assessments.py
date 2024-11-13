import pytest
from requests import Response

import models


def test_create_followup_without_referral(
    database,
    patient_factory,
    reading_factory,
    api_post,
):
    patient_id = "7800"
    patient_factory.create(id=patient_id)

    followup_json = {
        "patient_id": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medication_prescribed": "M",
        "special_investigations": "S",
        "follow_up_instructions": "I",
        "follow_up_needed": True,
    }
    response: Response = api_post(endpoint="/api/assessments", json=followup_json)
    database.session.commit()

    assert response.status_code == 201


@pytest.mark.skip(
    reason="Referral is no longer marked as assessed. TODO: check this is correct.",
)
def test_create_followup_marks_referral_as_assessed(
    database,
    patient_factory,
    reading_factory,
    referral_factory,
    api_post,
):
    patient_id = "7800"
    reading_id = "8311d551-03d2-44c6-857a-f1927c5177e3"
    patient_factory.create(id=patient_id)
    reading_factory.create(patient_id=patient_id, readingId=reading_id)
    referral = referral_factory.create(patient_id=patient_id)
    assert not referral.isAssessed

    followup_json = {
        "patient_id": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medication_prescribed": "M",
        "special_investigations": "S",
        "follow_up_instructions": "I",
        "follow_up_needed": True,
    }
    response: Response = api_post(endpoint="/api/assessments", json=followup_json)
    database.session.commit()

    assert response.status_code == 201
    referral = models.ReferralOrm.query.filter_by(id=referral.id).first()
    assert referral.isAssessed


def test_invalid_followup_not_created(
    database,
    patient_factory,
    referral_factory,
    api_post,
):
    patient_id = "7800"
    patient_factory.create(id=patient_id)

    # Invalid as follow_up_instructions is missing when follow_up_needed is True
    followup_json = {
        "patient_id": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medication_prescribed": "M",
        "special_investigations": "S",
        "follow_up_needed": True,
        "follow_up_instructions": "",
    }
    response: Response = api_post(endpoint="/api/assessments", json=followup_json)
    database.session.commit()
    assert response.status_code == 400
