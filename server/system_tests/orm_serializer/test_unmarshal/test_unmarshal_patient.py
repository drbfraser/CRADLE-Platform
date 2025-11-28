from __future__ import annotations

from typing import Any

from data import orm_serializer
from models import PatientOrm


def __create_patient_payload(
    *,
    id: str = "p-001",
    name: str = "Mary Brown",
    sex: str = "FEMALE",
    is_pregnant: bool = False,
    medical_history: str = "Asthma",
    drug_history: str = "Tylenol 300mg",
    allergy: str = "Peanuts",
    zone: str = "1",
    date_of_birth: str = "1998-01-01",
    is_exact_date_of_birth: bool = False,
    village_number: str = "3",
    household_number: str = "1",
    date_created: int = 111,
    last_edited: int = 222,
    is_archived: bool = False,
    readings: list | None = None,
    referrals: list | None = None,
    assessments: list | None = None,
    forms: list | None = None,
    base: int | None = None,
    **extra: Any,
) -> dict:
    """Create a patient payload suitable for unmarshaling."""
    payload = {
        "id": id,
        "name": name,
        "sex": sex,
        "is_pregnant": is_pregnant,
        "medical_history": medical_history,
        "drug_history": drug_history,
        "allergy": allergy,
        "zone": zone,
        "date_of_birth": date_of_birth,
        "is_exact_date_of_birth": is_exact_date_of_birth,
        "village_number": village_number,
        "household_number": household_number,
        "date_created": date_created,
        "last_edited": last_edited,
        "is_archived": is_archived,
    }

    if readings is not None:
        payload["readings"] = readings
    if referrals is not None:
        payload["referrals"] = referrals
    if assessments is not None:
        payload["assessments"] = assessments
    if forms is not None:
        payload["forms"] = forms
    if base is not None:
        payload["base"] = base

    payload.update(extra)
    return payload


def test_unmarshal_patient_strips_base_and_preserves_scalars():
    """
    Test that unmarshaling a PatientOrm strips out "base" and preserves scalar values.
    """
    payload = __create_patient_payload(base=222)

    patient = orm_serializer.unmarshal(PatientOrm, payload)
    assert patient.id == "p-001"
    assert patient.name == "Mary Brown"
    assert patient.zone == "1"
    # Column exists on the model; value should be stripped out to None
    assert getattr(patient, "drug_history", None) is None
    assert getattr(patient, "medical_history", None) is None
    # and "base" is not a column—shouldn't survive
    assert not hasattr(patient, "base")


def test_unmarshal_patient_moves_histories_into_records_and_removes_original_fields():
    """
    Test that unmarshaling a PatientOrm moves drug_history and medical_history
    into a list of MedicalRecordOrms and removes the original fields.
    """
    payload = __create_patient_payload(
        id="p-002",
        medical_history="Asthma",
        drug_history="Labetalol 300mg",
    )
    patient = orm_serializer.unmarshal(PatientOrm, payload)

    # Columns still exist; values should be cleared
    assert getattr(patient, "drug_history", None) is None
    assert getattr(patient, "medical_history", None) is None

    # Records created correctly
    assert hasattr(patient, "records") and len(patient.records) == 2
    info = {(r.is_drug_record, r.information, r.patient_id) for r in patient.records}
    assert (True, "Labetalol 300mg", "p-002") in info
    assert (False, "Asthma", "p-002") in info


def test_unmarshal_patient_derives_pregnancy_and_cleans_flags():
    """
    Test that unmarshaling a PatientOrm derives a PregnancyOrm from
    the is_pregnant and pregnancy_start_date fields, and removes the original
    fields.
    """
    payload = __create_patient_payload(
        id="p-003", is_pregnant=True, pregnancy_start_date=1725148800
    )
    patient = orm_serializer.unmarshal(PatientOrm, payload)

    assert hasattr(patient, "pregnancies") and len(patient.pregnancies) == 1
    p = patient.pregnancies[0]
    assert p.patient_id == "p-003"
    assert p.start_date == 1725148800
    # Column exists; value should be cleared
    assert getattr(patient, "is_pregnant", None) is None
    # not a column; must be gone
    assert not hasattr(patient, "pregnancy_start_date")


def test_unmarshal_patient_ignores_empty_relationship_lists():
    """
    Test that unmarshaling a PatientOrm does not set empty relationship lists to None,
    but instead sets them to empty lists.
    """
    payload = __create_patient_payload(
        id="p-004",
        sex="FEMALE",
        referrals=[],
        assessments=[],
        forms=[],
    )
    patient = orm_serializer.unmarshal(PatientOrm, payload)

    # Relationships exist on ORM; they should be empty, not missing
    assert not patient.referrals
    assert not patient.assessments
    assert not patient.forms


def test_unmarshal_patient_relationship_lists_are_unmarshaled():
    """
    Test that unmarshaling a PatientOrm with non-empty relationship lists results in
    an object with the same number of elements in the relationship lists.
    """
    payload = __create_patient_payload(
        id="p-005",
        sex="FEMALE",
        referrals=[
            {"id": "r-001", "patient_id": "p-005"},
            {"id": "r-002", "patient_id": "p-005"},
        ],
        assessments=[
            {
                "id": "a-001",
                "patient_id": "p-005",
                "healthcare_worker_id": 1,
                "date_assessed": 111,
            },
            {
                "id": "a-002",
                "patient_id": "p-005",
                "healthcare_worker_id": 2,
                "date_assessed": 112,
            },
        ],
        forms=[
            {"id": "f-001", "patient_id": "p-005", "lang": "en"},
            {"id": "f-002", "patient_id": "p-005", "lang": "en"},
        ],
        readings=[
            {"id": "rd-001", "patient_id": "p-005", "symptoms": ["dizzy"]},
            {"id": "rd-002", "patient_id": "p-005", "symptoms": ["nausea", "headache"]},
        ],
    )

    patient = orm_serializer.unmarshal(PatientOrm, payload)

    assert len(getattr(patient, "referrals", [])) == 2
    assert len(getattr(patient, "assessments", [])) == 2
    assert len(getattr(patient, "forms", [])) == 2
    assert len(getattr(patient, "readings", [])) == 2
