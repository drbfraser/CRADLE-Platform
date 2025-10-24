from __future__ import annotations

import types

from data.marshal import makePregnancyFromPatient


def _make_patient(
    pid: str = "pat-42",
    pregnancy_start_date: int | None = None,
    is_pregnant: bool | None = None,
    extra: dict | None = None,
) -> dict:
    """
    Helper function to create a dict payload like the one makePregnancyFromPatient
    passes through to unmarshal_patient.
    Keep extra fields to assert non-history attributes remain untouched.
    """
    d = {"id": pid, "name": "Jane Doe"}
    if pregnancy_start_date is not None:
        d["pregnancy_start_date"] = pregnancy_start_date
    if is_pregnant is not None:
        d["is_pregnant"] = is_pregnant
    if extra:
        d.update(extra)
    return d


def test_no_pregnancy_fields_returns_empty_and_keeps_unrelated_fields(
    schema_loads_by_model,
):
    """
    Test that when neither 'pregnancy_start_date' nor 'is_pregnant' are present, the function
    returns an empty list and does not mutate unrelated fields in the input dict.
    """
    patient = _make_patient(extra={"age": 30})
    pre = len(schema_loads_by_model("PregnancyOrm"))

    out = makePregnancyFromPatient(patient)

    assert out == []
    assert patient["id"] == "pat-42"
    assert patient["name"] == "Jane Doe"
    assert patient["age"] == 30
    assert len(schema_loads_by_model("PregnancyOrm")) == pre
    assert "pregnancy_start_date" not in patient  # key was absent to begin with
    assert "is_pregnant" not in patient


def test_truthy_start_date_creates_one_record_and_removes_keys(schema_loads_by_model):
    """
    Test that when 'pregnancy_start_date' is present and truthy, the function returns
    one record, removes 'pregnancy_start_date' and 'is_pregnant' from the input dict,
    and the returned record matches the stubbed load result.
    """
    start_ts = 1_700_000_001
    patient = _make_patient(pregnancy_start_date=start_ts, is_pregnant=True)
    pre = len(schema_loads_by_model("PregnancyOrm"))

    out = makePregnancyFromPatient(patient)

    # Check the captured schema loads
    loads = schema_loads_by_model("PregnancyOrm")[pre:]
    assert len(loads) == 1
    assert loads[0] == {"patient_id": "pat-42", "start_date": start_ts}

    # Keys should be removed from original dict
    assert "pregnancy_start_date" not in patient
    assert "is_pregnant" not in patient

    # Returned item is our stub object with the same fields
    assert isinstance(out, list) and len(out) == 1
    rec = out[0]
    assert isinstance(rec, types.SimpleNamespace)
    assert rec.patient_id == "pat-42"
    assert rec.start_date == start_ts


def test_present_but_falsy_start_date_creates_no_record_and_leaves_key(
    schema_loads_by_model,
):
    """
    Test that when 'pregnancy_start_date' is present but falsy, the function returns
    an empty list, does not create a schema load, removes 'is_pregnant' from
    the input dict, and leaves 'pregnancy_start_date' in the input dict.
    """
    patient = _make_patient(
        pregnancy_start_date="", is_pregnant=False, extra={"age": 31}
    )
    pre = len(schema_loads_by_model("PregnancyOrm"))

    out = makePregnancyFromPatient(patient)

    # No loads because start_date was falsy
    assert len(schema_loads_by_model("PregnancyOrm")) == pre

    # is_pregnant is always popped if present
    assert "is_pregnant" not in patient

    assert "pregnancy_start_date" in patient and patient["pregnancy_start_date"] == ""

    assert out == []


def test_weird_start_key_branch_deletes_pregnancy_start_date_when_falsy(
    schema_loads_by_model,
):
    """
    Test that when 'pregnancy_start_date' is present but falsy, a weird branch
    deletes 'pregnancy_start_date' from the input dict, leaves 'start' and 'other'
    untouched, removes 'is_pregnant' if present, and returns an empty list
    without any schema loads.
    """
    patient = _make_patient(
        pregnancy_start_date="",
        is_pregnant=None,
        extra={"start": "some-sentinel", "other": 123},
    )
    pre = len(schema_loads_by_model("PregnancyOrm"))

    out = makePregnancyFromPatient(patient)

    assert len(schema_loads_by_model("PregnancyOrm")) == pre  # still no loads
    assert "pregnancy_start_date" not in patient  # deleted by the odd branch
    assert patient["start"] == "some-sentinel"  # untouched
    assert patient["other"] == 123
    assert "is_pregnant" not in patient  # always removed if present
    assert out == []


def test_absent_start_date_but_is_pregnant_present_only_removes_is_pregnant(
    schema_loads_by_model,
):
    """
    Test that when 'pregnancy_start_date' is not present but 'is_pregnant' is present and
    truthy, the function returns an empty list, removes 'is_pregnant' from the
    input dict, and does not create a schema load.
    """
    patient = _make_patient(is_pregnant=True)
    pre = len(schema_loads_by_model("PregnancyOrm"))

    out = makePregnancyFromPatient(patient)

    assert out == []
    assert "is_pregnant" not in patient
    assert len(schema_loads_by_model("PregnancyOrm")) == pre
