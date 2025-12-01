# ruff: noqa: SLF001
import data.orm_serializer as orm_seralizer
from models import AssessmentOrm, PatientOrm, UserOrm


def make_assessment(
    *,
    id_="assess-1",
    patient_id="p-1",
    healthcare_worker_id=101,
    date_assessed=1577923200,  # 2020-01-02
    follow_up_instructions=None,
    follow_up_needed=None,
    special_investigations=None,
    diagnosis=None,
    treatment=None,
    medication_prescribed=None,
):
    a = AssessmentOrm()
    a.id = id_
    a.patient_id = patient_id
    a.healthcare_worker_id = healthcare_worker_id
    a.date_assessed = date_assessed

    a.follow_up_instructions = follow_up_instructions
    a.follow_up_needed = follow_up_needed
    a.special_investigations = special_investigations
    a.diagnosis = diagnosis
    a.treatment = treatment
    a.medication_prescribed = medication_prescribed
    return a


def test_assessment_strips_relationship_objects_when_present():
    assessment = make_assessment()

    patient = PatientOrm()
    patient.id = "p-1"
    user = UserOrm()
    user.id = 101

    assessment.patient = patient
    assessment.healthcare_worker = user

    marshalled = orm_seralizer.marshal(assessment)

    # NOTE: Relationship objects must be removed from marshalledput.
    # BUG EXPOSED (current marshal only deletes 'health_facility' which doesn't exist):
    # Relationship objects must be removed from marshalledput.
    assert "patient" not in marshalled
    assert "healthcare_worker" not in marshalled

    # FK scalars remain
    assert marshalled["patient_id"] == "p-1"
    assert marshalled["healthcare_worker_id"] == 101


def test_assessment_strips_none_fields_but_preserves_false_boolean_and_scalars():
    assessment = make_assessment(
        follow_up_instructions=None,
        special_investigations=None,
        diagnosis=None,
        treatment=None,
        medication_prescribed=None,
        follow_up_needed=False,  # ensure False isn't stripped
    )

    marshalled = orm_seralizer.marshal(assessment)

    # None fields should be gone
    for attr in (
        "follow_up_instructions",
        "special_investigations",
        "diagnosis",
        "treatment",
        "medication_prescribed",
    ):
        assert attr not in marshalled

    assert marshalled["follow_up_needed"] is False

    assert marshalled["date_assessed"] == 1577923200
    assert marshalled["patient_id"] == "p-1"
    assert marshalled["healthcare_worker_id"] == 101


def test_assessment_preserves_nonempty_text_and_true_boolean():
    """
    Test that marshalling preserves non-empty text fields and true boolean fields in Assessment.
    """
    a = make_assessment(
        follow_up_instructions="Return in 3 days",
        special_investigations="CBC, LFT",
        diagnosis="Hypertension",
        treatment="Start amlodipine 5mg",
        medication_prescribed="Amlodipine 5mg qd",
        follow_up_needed=True,
    )

    marshalled = orm_seralizer.marshal(a)

    assert marshalled["follow_up_instructions"] == "Return in 3 days"
    assert marshalled["special_investigations"] == "CBC, LFT"
    assert marshalled["diagnosis"] == "Hypertension"
    assert marshalled["treatment"] == "Start amlodipine 5mg"
    assert marshalled["medication_prescribed"] == "Amlodipine 5mg qd"
    assert marshalled["follow_up_needed"] is True
    assert marshalled["date_assessed"] == 1577923200


def test_assessment_private_attrs_stripped_and_input_not_mutated():
    """
    Test that marshalling an Assessment strips private attributes (e.g., _secret) and
    removes relationship objects (e.g., patient, healthcare_worker) from the marshalled output.
    Additionally, ensure that the original object passed to marshal is not mutated.
    """
    assesment = make_assessment()
    assesment._secret = "do-not-leak"  # should be removed by __pre_process

    patient = PatientOrm()
    patient.id = "p-1"
    user = UserOrm()
    user.id = 101
    assesment.patient = patient
    assesment.healthcare_worker = user

    before_patient = assesment.patient
    before_worker = assesment.healthcare_worker

    marshalled = orm_seralizer.marshal(assesment)

    # Private attr gone
    assert "_secret" not in marshalled

    # Relationships removed from marshalledput…
    assert "patient" not in marshalled
    assert "healthcare_worker" not in marshalled

    # …but original object remains intact (marshal works on a copy)
    assert assesment.patient is before_patient
    assert assesment.healthcare_worker is before_worker


def test_assessment_minimum_expected_keys_present():
    a = make_assessment()
    marshalled = orm_seralizer.marshal(a)

    for k in ("id", "patient_id", "healthcare_worker_id", "date_assessed"):
        assert k in marshalled
