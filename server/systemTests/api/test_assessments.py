import pytest
from humps import decamelize
from requests import Response

import models
from common.print_utils import pretty_print


def test_create_assessment_without_referral(
    database,
    patient_factory,
    reading_factory,
    api_post,
):
    patient_id = "7800"
    patient_factory.create(id=patient_id)

    assessment_json = {
        "patient_id": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medication_prescribed": "M",
        "special_investigations": "S",
        "follow_up_instructions": "I",
        "follow_up_needed": True,
    }
    response: Response = api_post(endpoint="/api/assessments", json=assessment_json)
    database.session.commit()

    response_body = decamelize(response.json())
    pretty_print(response_body)
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

    assessment_json = {
        "patient_id": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medication_prescribed": "M",
        "special_investigations": "S",
        "follow_up_instructions": "I",
        "follow_up_needed": True,
    }
    response: Response = api_post(endpoint="/api/assessments", json=assessment_json)
    database.session.commit()

    assert response.status_code == 201
    referral = models.ReferralOrm.query.filter_by(id=referral.id).first()
    assert referral.isAssessed


def test_invalid_assessment_not_created(
    database,
    patient_factory,
    referral_factory,
    api_post,
):
    patient_id = "7800"
    patient_factory.create(id=patient_id)

    # Invalid as follow_up_instructions is missing when follow_up_needed is True
    assessment_json = {
        "patient_id": patient_id,
        "diagnosis": "D",
        "treatment": "T",
        "medication_prescribed": "M",
        "special_investigations": "S",
        "follow_up_needed": True,
    }
    response: Response = api_post(endpoint="/api/assessments", json=assessment_json)
    database.session.commit()
    assert response.status_code == 422
