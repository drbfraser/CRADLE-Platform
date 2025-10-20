from typing import Any

from data.marshal import unmarshal
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
    readings: list = None,
    referrals: list = None,
    assessments: list = None,
    forms: list = None,
    base: int = None,
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

    if readings:
        payload["readings"] = readings
    if referrals:
        payload["referrals"] = referrals
    if assessments:
        payload["assessments"] = assessments
    if forms:
        payload["forms"] = forms
    if base:
        payload["base"] = base

    payload.update(extra)

    return payload


def test_unmarshal_patient_strips_base_and_preserves_scalars():
    # Base is stripped
    payload = __create_patient_payload(base=222)

    patient = unmarshal(PatientOrm, payload)
    assert patient.id == "p-001"
    assert patient.name == "Mary Brown"
    assert patient.zone == "1"
    assert not hasattr(patient, "base")  # stripped


def test_unmarshal_patient_moves_histories_into_records_and_removes_original_fields():
    payload = __create_patient_payload(
        id="p-002",
        medical_history="Asthma",
        drug_history="Labetalol 300mg",
    )
    patient = unmarshal(PatientOrm, payload)

    # Original fields removed
    assert not hasattr(patient, "drug_history")
    assert not hasattr(patient, "medical_history")

    # Converted into MedicalRecordOrm-like objects on .records
    assert hasattr(patient, "records") and len(patient.records) == 2
    info = {(r.is_drug_record, r.information, r.patient_id) for r in patient.records}
    assert (True, "Labetalol 300mg", "p-002") in info
    assert (False, "Asthma", "p-002") in info


def test_unmarshal_patient_derives_pregnancy_and_cleans_flags():
    payload = __create_patient_payload(
        id="p-003", is_pregnant=True, pregnancy_start_date=1725148800
    )
    patient = unmarshal(PatientOrm, payload)

    assert hasattr(patient, "pregnancies") and len(patient.pregnancies) == 1
    p = patient.pregnancies[0]
    assert p.patient_id == "p-003"
    assert p.start_date == 1725148800
    assert not hasattr(patient, "is_pregnant")
    assert not hasattr(patient, "pregnancy_start_date")


def test_unmarshal_patient_ignores_empty_relationship_lists():
    payload = __create_patient_payload(
        id="p-004",
        sex="FEMALE",
        referrals=[],
        assessments=[],
        forms=[],
    )
    patient = unmarshal(PatientOrm, payload)

    # Nothing should be attached when effectively empty
    assert not hasattr(patient, "referrals")
    assert not hasattr(patient, "assessments")
    assert not hasattr(patient, "forms")


def test_unmarshal_patient_relationship_lists_are_unmarshaled():
    payload = __create_patient_payload(
        id="p-005",
        sex="FEMALE",
        referrals=[{"id": "r-001"}, {"id": "r-002"}],
        assessments=[{"id": "a-001"}, {"id": "a-002"}],
        forms=[{"id": "f-001"}, {"id": "f-002"}],
        readings=[
            {"symptoms": {"id": "s-001"}, "id": "r-001"},
            {"symptoms": {"id": "s-002"}, "id": "r-002"},
        ],
    )
    patient = unmarshal(PatientOrm, payload)

    assert len(patient.referrals) == 2
    assert len(patient.assessments) == 2
    assert len(patient.forms) == 2
    assert len(patient.readings) == 2
