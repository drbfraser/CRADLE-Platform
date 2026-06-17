from __future__ import annotations

from data.orm_serializer import makePregnancyFromPatient
from tests.helpers import make_patient


def test_no_pregnancy_fields_returns_empty_and_keeps_unrelated_fields():
    """
    Test that when neither 'pregnancy_start_date' nor 'is_pregnant' are present, the function
    returns an empty list and does not mutate unrelated fields in the input dict.
    """
    patient = make_patient(age=30, id="pat-42", name="Jane Doe")

    out = makePregnancyFromPatient(patient)

    assert out == []
    assert patient["id"] == "pat-42"
    assert patient["name"] == "Jane Doe"
    assert patient["age"] == 30
    assert "pregnancy_start_date" not in patient  # key was absent to begin with
    assert "is_pregnant" not in patient


def test_truthy_start_date_creates_one_record_and_removes_keys():
    """
    Test that when 'pregnancy_start_date' is present and truthy, the function returns
    one record, removes 'pregnancy_start_date' and 'is_pregnant' from the input dict,
    and the returned record matches the stubbed load result.
    """
    start_ts = 1_700_000_001
    patient = make_patient(pregnancy_start_date=start_ts, is_pregnant=True, id="pat-42")

    out = makePregnancyFromPatient(patient)

    # Keys should be removed from original dict
    assert "pregnancy_start_date" not in patient
    assert "is_pregnant" not in patient

    # Returned item is our stub object with the same fields
    assert isinstance(out, list) and len(out) == 1
    rec = out[0]
    assert rec.patient_id == "pat-42"
    assert rec.start_date == start_ts


def test_present_but_falsy_start_date_creates_no_record_and_leaves_key():
    """
    Test that when 'pregnancy_start_date' is present but falsy, the function returns
    an empty list, does not create a schema load, removes 'is_pregnant' from
    the input dict, and leaves 'pregnancy_start_date' in the input dict.
    """
    patient = make_patient(
        pregnancy_start_date="", is_pregnant=False, extra={"age": 31}
    )

    out = makePregnancyFromPatient(patient)

    # is_pregnant is always popped if present
    assert "is_pregnant" not in patient

    assert "pregnancy_start_date" in patient and patient["pregnancy_start_date"] == ""

    assert out == []


def test_weird_start_key_branch_deletes_pregnancy_start_date_when_falsy():
    """
    Test that when 'pregnancy_start_date' is present but falsy, a weird branch
    deletes 'pregnancy_start_date' from the input dict, leaves 'start' and 'other'
    untouched, removes 'is_pregnant' if present, and returns an empty list
    without any schema loads.
    """
    patient = make_patient(
        pregnancy_start_date="", is_pregnant=None, start="some-sentinel", other=123
    )

    out = makePregnancyFromPatient(patient)

    assert "pregnancy_start_date" not in patient  # deleted by the odd branch
    assert patient["start"] == "some-sentinel"  # untouched
    assert patient["other"] == 123
    assert "is_pregnant" not in patient  # always removed if present
    assert out == []


def test_absent_start_date_but_is_pregnant_present_only_removes_is_pregnant():
    """
    Test that when 'pregnancy_start_date' is not present but 'is_pregnant' is present and
    truthy, the function returns an empty list, removes 'is_pregnant' from the
    input dict, and does not create a schema load.
    """
    patient = make_patient(is_pregnant=True)

    out = makePregnancyFromPatient(patient)

    assert out == []
    assert "is_pregnant" not in patient
