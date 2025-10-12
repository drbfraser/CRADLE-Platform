# ruff: noqa: SLF001
from data import marshal as m
from models import PatientOrm, PregnancyOrm


def make_pregnancy(
    *,
    id_=42,
    patient_id="p-1",
    start_date=1577836800,  # 2020-01-01
    end_date=None,
    outcome=None,
    last_edited=1577923200,  # 2020-01-02
):
    pr = PregnancyOrm()
    pr.id = id_
    pr.patient_id = patient_id
    pr.start_date = start_date
    pr.end_date = end_date
    pr.outcome = outcome
    pr.last_edited = last_edited
    return pr


def test_pregnancy_ongoing_includes_null_end_date_and_outcome_key():
    pr = make_pregnancy(end_date=None, outcome=None)
    out = m.marshal(pr)

    assert out["id"] == 42
    assert out["patient_id"] == "p-1"
    assert out["start_date"] == 1577836800
    assert "end_date" in out and out["end_date"] is None
    assert "outcome" in out and out["outcome"] is None
    assert out["last_edited"] == 1577923200

    assert set(out.keys()) == {
        "id",
        "patient_id",
        "start_date",
        "end_date",
        "outcome",
        "last_edited",
    }


def test_pregnancy_completed_sets_end_date_and_outcome():
    pr = make_pregnancy(end_date=1580515200, outcome="Mode of delivery: assisted birth")
    out = m.marshal(pr)

    assert out["end_date"] == 1580515200
    assert out["outcome"] == "Mode of delivery: assisted birth"


def test_pregnancy_relationship_not_leaked_when_patient_loaded():
    pr = make_pregnancy()
    patient = PatientOrm()
    patient.id = "p-1"
    pr.patient = patient

    out = m.marshal(pr)
    assert "patient" not in out
    assert out["patient_id"] == "p-1"


def test_pregnancy_private_attrs_not_leaked_and_input_not_mutated():
    pr = make_pregnancy()
    pr._secret = "dont-leak-me"

    before_secret = pr._secret
    out = m.marshal(pr)

    assert "_secret" not in out
    assert pr._secret == before_secret


def test_pregnancy_types_are_preserved():
    pr = make_pregnancy(
        id_=7,
        patient_id="pat-99",
        start_date=1700000001,
        end_date=1700009999,
        outcome="Healthy newborn",
        last_edited=1700011111,
    )
    out = m.marshal(pr)

    assert isinstance(out["id"], int)
    assert out["id"] == 7
    assert isinstance(out["patient_id"], str) and out["patient_id"] == "pat-99"
    assert isinstance(out["start_date"], int) and out["start_date"] == 1700000001
    assert isinstance(out["end_date"], int) and out["end_date"] == 1700009999
    assert isinstance(out["last_edited"], int) and out["last_edited"] == 1700011111
    assert out["outcome"] == "Healthy newborn"
