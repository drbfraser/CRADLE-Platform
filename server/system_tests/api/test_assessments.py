import pytest
from humps import decamelize
from requests import Response

import data.db_operations as crud
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
        "healthcareWorkerId": 2,
    }
    response: Response = api_post(endpoint="/api/assessments", json=assessment_json)
    database.session.commit()

    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 201
    assert response_body["healthcare_worker_id"] == 1
    assert (
        crud.read(models.AssessmentOrm, id=response_body["id"]).healthcare_worker_id
        == 1
    )


@pytest.mark.parametrize(
    "actor_fields", [{}, {"healthcareWorkerId": 1}], ids=["omitted", "legacy-field"]
)
def test_assessment_update_preserves_recorded_worker(
    patient_factory, followup_factory, api_put, actor_fields
):
    patient = patient_factory.create()
    assessment = followup_factory.create(patient_id=patient.id, healthcare_worker_id=2)
    body = {
        "id": assessment.id,
        "patientId": patient.id,
        "diagnosis": "Updated diagnosis",
        "followUpNeeded": False,
        **actor_fields,
    }
    response = api_put(endpoint=f"/api/assessments/{assessment.id}", json=body)

    assert response.status_code == 200
    assert decamelize(response.json())["healthcare_worker_id"] == 2
    crud.db_session.rollback()
    stored = crud.read(models.AssessmentOrm, id=assessment.id)
    assert stored.healthcare_worker_id == 2
    assert stored.diagnosis == "Updated diagnosis"


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
