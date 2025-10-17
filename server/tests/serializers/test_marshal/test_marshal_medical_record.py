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
    """
    Creates a MedicalRecordOrm instance with the provided parameters.

    :param id_: Medical record ID (defaults to 101)
    :param patient_id: Patient ID (defaults to "p-xyz")
    :param information: Medical information (defaults to "Hypertension noted")
    :param is_drug_record: Flag indicating whether this is a drug record (defaults to False)
    :param date_created: Timestamp when this record was created (defaults to 2020-01-01)
    :param last_edited: Timestamp when this record was last edited (defaults to 2020-01-02)
    :return: A MedicalRecordOrm instance with the provided parameters
    """
    medical_record = MedicalRecordOrm()
    medical_record.id = id_
    medical_record.patient_id = patient_id
    medical_record.information = information
    medical_record.is_drug_record = is_drug_record
    medical_record.date_created = date_created
    medical_record.last_edited = last_edited
    return medical_record


def test_medical_record_medical_path_maps_information_to_medical_history_only():
    """When is_drug_record=False, marshal must emit medical_history and NOT drug_history."""
    medical_record = make_medical_record(
        is_drug_record=False, information="Asthma (childhood)"
    )
    marshalled = m.marshal(medical_record)

    assert set(marshalled.keys()) == {
        "id",
        "patient_id",
        "date_created",
        "last_edited",
        "medical_history",
    }

    assert marshalled["id"] == 101
    assert marshalled["patient_id"] == "p-xyz"
    assert marshalled["date_created"] == 1577836800
    assert marshalled["last_edited"] == 1577923200
    assert marshalled["medical_history"] == "Asthma (childhood)"
    assert (
        "drug_history" not in marshalled
    ), "drug_history must not be present for non-drug records"


def test_medical_record_drug_path_maps_information_to_drug_history_only():
    """When is_drug_record=True, marshal must emit drug_history and NOT medical_history."""
    medical_record = make_medical_record(
        is_drug_record=True,
        information="Amoxicillin 500mg BID x7d",
    )
    marshalled = m.marshal(medical_record)

    assert set(marshalled.keys()) == {
        "id",
        "patient_id",
        "date_created",
        "last_edited",
        "drug_history",
    }

    assert marshalled["drug_history"] == "Amoxicillin 500mg BID x7d"
    assert (
        "medical_history" not in marshalled
    ), "medical_history must not be present for drug records"


def test_medical_record_keeps_empty_information_string():
    medical_record = make_medical_record(is_drug_record=False, information="")
    marshalled = m.marshal(medical_record)
    assert "medical_history" in marshalled
    assert marshalled["medical_history"] == ""


def test_medical_record_relationship_not_leaked_and_input_not_mutated():
    """
    Even if the relationship is populated, marshal must not emit ORM relationship objects.
    Also verify we don't mutate the source instance.
    """
    medical_record = make_medical_record(
        is_drug_record=True, information="Ibuprofen PRN"
    )
    patient = PatientOrm()
    patient.id = medical_record.patient_id
    medical_record.patient = patient

    # adding a private attribute; it should never leak
    medical_record._secret = "nope"

    before_info = medical_record.information
    before_secret = medical_record._secret

    marshalled = m.marshal(medical_record)

    assert (
        "patient" not in marshalled
    ), "Relationship object must not leak into the payload"
    assert "_secret" not in marshalled, "Private attrs must never leak"
    # verifying original object not mutated
    assert medical_record.information == before_info
    assert medical_record._secret == before_secret


def test_medical_record_internal_columns_not_leaked():
    medical_record = make_medical_record(
        is_drug_record=False, information="Diabetes Type II"
    )
    marshalled = m.marshal(medical_record)

    assert "information" not in marshalled
    assert "is_drug_record" not in marshalled

    medical_record2 = make_medical_record(
        is_drug_record=True, information="Metformin 500mg"
    )
    marshalled2 = m.marshal(medical_record2)
    assert "information" not in marshalled2
    assert "is_drug_record" not in marshalled2


def test_medical_record_type_sanity_and_ids():
    medical_record = make_medical_record(
        id_=7,
        patient_id="pat-77",
        information="ACE inhibitors",
        is_drug_record=True,
        date_created=1700000001,
        last_edited=1700011111,
    )
    marshalled = m.marshal(medical_record)

    assert isinstance(marshalled["id"], int) and marshalled["id"] == 7
    assert (
        isinstance(marshalled["patient_id"], str)
        and marshalled["patient_id"] == "pat-77"
    )
    assert (
        isinstance(marshalled["date_created"], int)
        and marshalled["date_created"] == 1700000001
    )
    assert (
        isinstance(marshalled["last_edited"], int)
        and marshalled["last_edited"] == 1700011111
    )
    assert marshalled["drug_history"] == "ACE inhibitors"
