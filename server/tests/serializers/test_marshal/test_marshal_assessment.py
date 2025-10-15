# ruff: noqa: SLF001
from data import marshal as m
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
    a = make_assessment()

    p = PatientOrm()
    p.id = "p-1"
    u = UserOrm()
    u.id = 101

    a.patient = p
    a.healthcare_worker = u

    out = m.marshal(a)

    # NOTE: Relationship objects must be removed from output.
    # BUG EXPOSED (current marshal only deletes 'health_facility' which doesn't exist):
    # Relationship objects must be removed from output.
    assert "patient" not in out
    assert "healthcare_worker" not in out

    # FK scalars remain
    assert out["patient_id"] == "p-1"
    assert out["healthcare_worker_id"] == 101


def test_assessment_strips_none_fields_but_preserves_false_boolean_and_scalars():
    a = make_assessment(
        follow_up_instructions=None,
        special_investigations=None,
        diagnosis=None,
        treatment=None,
        medication_prescribed=None,
        follow_up_needed=False,  # ensure False isn't stripped
    )

    out = m.marshal(a)

    # None fields should be gone
    for k in (
        "follow_up_instructions",
        "special_investigations",
        "diagnosis",
        "treatment",
        "medication_prescribed",
    ):
        assert k not in out

    assert out["follow_up_needed"] is False

    assert out["date_assessed"] == 1577923200
    assert out["patient_id"] == "p-1"
    assert out["healthcare_worker_id"] == 101


def test_assessment_preserves_nonempty_text_and_true_boolean():
    a = make_assessment(
        follow_up_instructions="Return in 3 days",
        special_investigations="CBC, LFT",
        diagnosis="Hypertension",
        treatment="Start amlodipine 5mg",
        medication_prescribed="Amlodipine 5mg qd",
        follow_up_needed=True,
    )

    out = m.marshal(a)

    assert out["follow_up_instructions"] == "Return in 3 days"
    assert out["special_investigations"] == "CBC, LFT"
    assert out["diagnosis"] == "Hypertension"
    assert out["treatment"] == "Start amlodipine 5mg"
    assert out["medication_prescribed"] == "Amlodipine 5mg qd"
    assert out["follow_up_needed"] is True
    assert out["date_assessed"] == 1577923200


def test_assessment_private_attrs_stripped_and_input_not_mutated():
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

    out = m.marshal(assesment)

    # Private attr gone
    assert "_secret" not in out

    # Relationships removed from output…
    assert "patient" not in out
    assert "healthcare_worker" not in out

    # …but original object remains intact (marshal works on a copy)
    assert assesment.patient is before_patient
    assert assesment.healthcare_worker is before_worker


def test_assessment_minimum_expected_keys_present():
    a = make_assessment()
    out = m.marshal(a)

    for k in ("id", "patient_id", "healthcare_worker_id", "date_assessed"):
        assert k in out
