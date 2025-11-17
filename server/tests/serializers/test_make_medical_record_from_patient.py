from __future__ import annotations

import types

from data.orm_serializer import make_medical_record_from_patient


def _make_patient(
    pid: str = "pat-42",
    drug_history: str | None = None,
    medical_history: str | None = None,
    extra: dict | None = None,
) -> dict:
    """
    Build a dict payload like the one __unmarshal_patient passes through to
    make_medical_record_from_patient. Keep extra fields to assert non-history
    attributes remain untouched.
    """
    d = {"id": pid, "name": "Jane Doe"}
    if drug_history is not None:
        d["drug_history"] = drug_history
    if medical_history is not None:
        d["medical_history"] = medical_history
    if extra:
        d.update(extra)
    return d


def test_no_histories_returns_empty_and_does_not_mutate_unrelated_fields(
    schema_loads_by_model,
):
    """
    Test that when neither drug nor medical history is present, the function
    returns an empty list and does not mutate unrelated fields in the input dict.
    """
    patient = _make_patient(drug_history=None, medical_history=None, extra={"age": 30})
    pre = len(schema_loads_by_model("MedicalRecordOrm"))

    out = make_medical_record_from_patient(patient)

    assert out == []
    # Keys not involved are left intact
    assert patient["id"] == "pat-42"
    assert patient["name"] == "Jane Doe"
    assert patient["age"] == 30
    # No loads
    assert len(schema_loads_by_model("MedicalRecordOrm")) == pre


def test_both_histories_create_two_records_and_remove_keys(schema_loads_by_model):
    """
    Test that when both drug and medical history are present, the function
    returns two records and removes both keys from the input dict. The two
    records should be in the order of drug record, then medical record.
    """
    patient = _make_patient(
        drug_history="On insulin and metformin",
        medical_history="Hypertension, type 2 diabetes",
    )
    pre = len(schema_loads_by_model("MedicalRecordOrm"))

    records = make_medical_record_from_patient(patient)

    # Keys should be removed from original dict
    assert "drug_history" not in patient
    assert "medical_history" not in patient

    # Two loads captured, in order
    loads = schema_loads_by_model("MedicalRecordOrm")[pre:]
    assert len(loads) == 2

    # First is the drug record
    assert loads[0] == {
        "patient_id": "pat-42",
        "information": "On insulin and metformin",
        "is_drug_record": True,
    }
    # Second is the medical record
    assert loads[1] == {
        "patient_id": "pat-42",
        "information": "Hypertension, type 2 diabetes",
        "is_drug_record": False,
    }

    # Return values are SimpleNamespaces from the schema stub with the same fields
    assert len(records) == 2
    drug, med = records
    assert isinstance(drug, types.SimpleNamespace)
    assert isinstance(med, types.SimpleNamespace)

    assert drug.patient_id == "pat-42"
    assert drug.information == "On insulin and metformin"
    assert drug.is_drug_record is True

    assert med.patient_id == "pat-42"
    assert med.information == "Hypertension, type 2 diabetes"
    assert med.is_drug_record is False


def test_only_drug_history_creates_one_record_and_removes_key(schema_loads_by_model):
    """
    Test that when only drug history is present, the function returns one record
    and removes only the drug history key from the input dict. The returned
    record should match the stubbed load result and the original payload should
    not have "medical_history" present.
    """
    patient = _make_patient(drug_history="Aspirin 81mg daily", medical_history=None)
    pre = len(schema_loads_by_model("MedicalRecordOrm"))

    out = make_medical_record_from_patient(patient)

    # One load only, and it's a drug record
    loads = schema_loads_by_model("MedicalRecordOrm")[pre:]
    assert len(loads) == 1
    assert loads[0] == {
        "patient_id": "pat-42",
        "information": "Aspirin 81mg daily",
        "is_drug_record": True,
    }

    # Key removed from original payload
    assert "drug_history" not in patient
    # medical_history was not present, still not present
    assert "medical_history" not in patient

    # Return value mirrors the stubbed load result
    assert len(out) == 1
    rec = out[0]
    assert rec.patient_id == "pat-42"
    assert rec.information == "Aspirin 81mg daily"
    assert rec.is_drug_record is True


def test_only_medical_history_creates_one_record_and_removes_key(schema_loads_by_model):
    """
    Test that when only medical history is present, the function returns one record
    and removes only the medical history key from the input dict. The returned
    record should match the stubbed load result and the original payload should
    not have "drug_history" present.
    """
    patient = _make_patient(
        drug_history=None, medical_history="Chronic kidney disease stage 2"
    )
    pre = len(schema_loads_by_model("MedicalRecordOrm"))

    out = make_medical_record_from_patient(patient)

    loads = schema_loads_by_model("MedicalRecordOrm")[pre:]
    assert len(loads) == 1
    assert loads[0] == {
        "patient_id": "pat-42",
        "information": "Chronic kidney disease stage 2",
        "is_drug_record": False,
    }

    assert "medical_history" not in patient
    assert "drug_history" not in patient  # was not present, remains absent

    assert len(out) == 1
    rec = out[0]
    assert rec.patient_id == "pat-42"
    assert rec.information == "Chronic kidney disease stage 2"
    assert rec.is_drug_record is False


def test_falsy_values_do_not_create_records_but_keys_are_removed(schema_loads_by_model):
    """
    Test that when only falsy values are present, the function does not create any records,
    but still removes the present keys from the input dict. The returned list should be empty.
    """
    patient = _make_patient(drug_history="", medical_history=None)
    pre = len(schema_loads_by_model("MedicalRecordOrm"))

    out = make_medical_record_from_patient(patient)

    # No loads because the only present value was empty/falsey
    assert len(schema_loads_by_model("MedicalRecordOrm")) == pre

    # Key was present but falsey -> still removed
    assert "drug_history" not in patient
    assert "medical_history" not in patient

    # No records returned
    assert out == []
