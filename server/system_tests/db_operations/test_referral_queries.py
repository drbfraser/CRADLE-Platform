import data.db_operations as crud
import models
from enums import TrafficLightEnum

# read_referral_list tests


def test_read_referral_list_health_facility(patient_factory, referral_factory):
    patient = patient_factory.create(id="referral-list-facility-patient")
    matching_referral = referral_factory.create(
        id="matching-facility-referral",
        patient_id=patient.id,
        health_facility_name="H0000",
        date_referred=100,
    )
    referral_factory.create(
        id="other-facility-referral",
        patient_id=patient.id,
        health_facility_name="H1000",
        date_referred=200,
    )

    referrals = crud.read_referral_list(
        search=patient.id,
        health_facilities=["H0000"],
    )

    assert [r.referral_id for r in referrals] == [matching_referral.id]


def test_read_referral_list_is_assessed(patient_factory, referral_factory):
    patient = patient_factory.create(id="referral-list-assessed-patient")
    assessed = referral_factory.create(
        id="assessed-referral",
        patient_id=patient.id,
        is_assessed=True,
    )
    referral_factory.create(
        id="unassessed-referral",
        patient_id=patient.id,
        is_assessed=False,
    )

    referrals = crud.read_referral_list(
        search=patient.id,
        is_assessed="1",
    )

    assert [r.referral_id for r in referrals] == [assessed.id]


def test_read_referral_list_vital_signs(
    patient_factory,
    reading_factory,
    referral_factory,
):
    patient = patient_factory.create(id="referral-list-vitals-patient")
    reading_factory.create(
        id="referral-list-vitals-reading",
        patient_id=patient.id,
        date_taken=100,
        systolic_blood_pressure=170,
        diastolic_blood_pressure=80,
        heart_rate=70,
    )
    reading_factory.create(
        id="referral-list-vitals-reading-safe",
        patient_id=patient.id,
        date_taken=300,
        systolic_blood_pressure=110,
        diastolic_blood_pressure=80,
        heart_rate=70,
    )
    referral_factory.create(
        id="referral-list-vitals-safe-referral",
        patient_id=patient.id,
        date_referred=400,
    )

    referral = referral_factory.create(
        id="referral-list-vitals-referral",
        patient_id=patient.id,
        date_referred=200,
    )

    referrals = crud.read_referral_list(
        search=patient.id,
        vital_signs=[TrafficLightEnum.RED_UP.value],
    )
    assert [r.referral_id for r in referrals] == [referral.id]


def test_read_referral_list_pregnant(
    patient_factory, pregnancy_factory, referral_factory
):
    pregnant_patient = patient_factory.create(id="pregnancy-filter-patient-yes")
    non_pregnant_patient = patient_factory.create(id="pregnancy-filter-patient-no")

    pregnancy_factory.create(
        patient_id=pregnant_patient.id,
        start_date=100,
    )

    pregnant_referral = referral_factory.create(
        id="is-pregnant-referral",
        patient_id=pregnant_patient.id,
    )
    referral_factory.create(
        id="non-pregnant-referral",
        patient_id=non_pregnant_patient.id,
    )

    referrals = crud.read_referral_list(
        search="pregnancy-filter-patient",
        is_pregnant="1",
    )

    assert [r.referral_id for r in referrals] == [pregnant_referral.id]


# read_referrals_or_assessments tests


def test_read_referrals_or_assessments_referral_patient_filter(
    patient_factory,
    referral_factory,
):
    patient = patient_factory.create(id="referral-filter-patient")
    other_patient = patient_factory.create(id="other-referral-filter-patient")

    referral = referral_factory.create(
        id="patient-filter-referral",
        patient_id=patient.id,
    )
    referral_factory.create(
        id="other-patient-filter-referral",
        patient_id=other_patient.id,
    )

    referrals = crud.read_referrals_or_assessments(
        models.ReferralOrm,
        patient_id=patient.id,
    )

    assert [r.id for r in referrals] == [referral.id]


def test_read_referrals_or_assessments_referral_last_edited(
    patient_factory,
    referral_factory,
):
    patient = patient_factory.create(id="referral-last-edited-patient")
    referral = referral_factory.create(
        id="new-last-edited-referral",
        patient_id=patient.id,
        date_assessed=100,
        last_edited=300,
    )
    referral_factory.create(
        id="old-last-edited-referral",
        patient_id=patient.id,
        date_assessed=100,
        last_edited=100,
    )

    referrals = crud.read_referrals_or_assessments(
        models.ReferralOrm,
        patient_id=patient.id,
        last_edited=200,
    )

    assert [r.id for r in referrals] == [referral.id]


def test_read_referrals_or_assessments_assessment_last_edited(
    patient_factory,
    followup_factory,
):
    patient = patient_factory.create(id="assessment-last-edited-patient")
    assessment = followup_factory.create(
        id="new-assessment",
        patient_id=patient.id,
        date_assessed=300,
    )
    followup_factory.create(
        id="old-assessment",
        patient_id=patient.id,
        date_assessed=100,
    )

    assessments = crud.read_referrals_or_assessments(
        models.AssessmentOrm,
        patient_id=patient.id,
        last_edited=200,
    )

    assert [a.id for a in assessments] == [assessment.id]
