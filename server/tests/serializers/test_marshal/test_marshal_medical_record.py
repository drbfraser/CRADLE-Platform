# ruff: noqa: SLF001
from data import marshal as m
from models import MedicalRecordOrm, PatientOrm


def make_medical_record(
    *,
    id_=101,
    patient_id="p-xyz",
    information="Hypertension noted",
    is_drug_record=False,
    date_created=1577836800,  # 2020-01-01
    last_edited=1577923200,  # 2020-01-02
):
    mr = MedicalRecordOrm()
    mr.id = id_
    mr.patient_id = patient_id
    mr.information = information
    mr.is_drug_record = is_drug_record
    mr.date_created = date_created
    mr.last_edited = last_edited
    return mr


def test_medical_record_medical_path_maps_information_to_medical_history_only():
    """When is_drug_record=False, marshal must emit medical_history and NOT drug_history."""
    mr = make_medical_record(is_drug_record=False, information="Asthma (childhood)")
    out = m.marshal(mr)

    assert set(out.keys()) == {
        "id",
        "patient_id",
        "date_created",
        "last_edited",
        "medical_history",
    }

    assert out["id"] == 101
    assert out["patient_id"] == "p-xyz"
    assert out["date_created"] == 1577836800
    assert out["last_edited"] == 1577923200
    assert out["medical_history"] == "Asthma (childhood)"
    assert "drug_history" not in out, (
        "drug_history must not be present for non-drug records"
    )


def test_medical_record_drug_path_maps_information_to_drug_history_only():
    """When is_drug_record=True, marshal must emit drug_history and NOT medical_history."""
    mr = make_medical_record(
        is_drug_record=True,
        information="Amoxicillin 500mg BID ×7d",
    )
    out = m.marshal(mr)

    assert set(out.keys()) == {
        "id",
        "patient_id",
        "date_created",
        "last_edited",
        "drug_history",
    }

    assert out["drug_history"] == "Amoxicillin 500mg BID ×7d"
    assert "medical_history" not in out, (
        "medical_history must not be present for drug records"
    )


def test_medical_record_keeps_empty_information_string():
    mr = make_medical_record(is_drug_record=False, information="")
    out = m.marshal(mr)
    assert "medical_history" in out
    assert out["medical_history"] == ""


def test_medical_record_relationship_not_leaked_and_input_not_mutated():
    """
    Even if the relationship is populated, marshal must not emit ORM relationship objects.
    Also verify we don't mutate the source instance.
    """
    mr = make_medical_record(is_drug_record=True, information="Ibuprofen PRN")
    patient = PatientOrm()
    patient.id = mr.patient_id
    mr.patient = patient

    # adding a private attribute; it should never leak
    mr._secret = "nope"

    before_info = mr.information
    before_secret = mr._secret

    out = m.marshal(mr)

    assert "patient" not in out, "Relationship object must not leak into the payload"
    assert "_secret" not in out, "Private attrs must never leak"
    # verifying original object not mutated
    assert mr.information == before_info
    assert mr._secret == before_secret


def test_medical_record_internal_columns_not_leaked():
    mr = make_medical_record(is_drug_record=False, information="Diabetes Type II")
    out = m.marshal(mr)

    assert "information" not in out
    assert "is_drug_record" not in out

    mr2 = make_medical_record(is_drug_record=True, information="Metformin 500mg")
    out2 = m.marshal(mr2)
    assert "information" not in out2
    assert "is_drug_record" not in out2


def test_medical_record_type_sanity_and_ids():
    mr = make_medical_record(
        id_=7,
        patient_id="pat-77",
        information="ACE inhibitors",
        is_drug_record=True,
        date_created=1700000001,
        last_edited=1700011111,
    )
    out = m.marshal(mr)

    assert isinstance(out["id"], int) and out["id"] == 7
    assert isinstance(out["patient_id"], str) and out["patient_id"] == "pat-77"
    assert isinstance(out["date_created"], int) and out["date_created"] == 1700000001
    assert isinstance(out["last_edited"], int) and out["last_edited"] == 1700011111
    assert out["drug_history"] == "ACE inhibitors"
