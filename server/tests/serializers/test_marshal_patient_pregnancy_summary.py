from __future__ import annotations

import types

from data.marshal import marshal_patient_pregnancy_summary


def _Create_pregnancy(
    id: str,
    start: int,
    end: int | None,
    outcome: str | None,
    patient_id: str = "pat-1",
    last_edited: int = 1_700_000_999,
):
    """
    Create a PregnancyOrm-like object with given attributes.

    Args:
        id: str
        start: int
        end: int | None
        outcome: str | None
        patient_id: str, default="pat-1"
        last_edited: int, default=1_700_000_999

    Returns:
        types.SimpleNamespace: PregnancyOrm-like object with given attributes

    """
    return types.SimpleNamespace(
        id=id,
        start_date=start,
        end_date=end,
        outcome=outcome,
        patient_id=patient_id,
        last_edited=last_edited,
    )


def test_empty_list_returns_default_summary():
    """
    Verify that an empty list of pregnancy records results in a default
    marshal_patient_pregnancy_summary dict with is_pregnant=False and
    past_pregnancies=[].
    """
    records = []
    marshal_summary = marshal_patient_pregnancy_summary(records)

    assert marshal_summary == {"is_pregnant": False, "past_pregnancies": []}


def test_only_current_pregnancy_sets_flag_and_fields():
    """
    A single ongoing pregnancy should:
      - set is_pregnant=True
      - set pregnancy_id and pregnancy_start_date
      - produce an empty past_pregnancies list
    """
    current = _Create_pregnancy(
        id="pg-100", start=1_700_001_000, end=None, outcome=None
    )
    records = [current]

    marshal_summary = marshal_patient_pregnancy_summary(records)

    assert marshal_summary["is_pregnant"] is True
    assert marshal_summary["pregnancy_id"] == "pg-100"
    assert marshal_summary["pregnancy_start_date"] == 1_700_001_000
    assert marshal_summary["past_pregnancies"] == []


def test_only_past_pregnancy_lists_one_past_entry():
    """
    A single completed pregnancy should:
      - set is_pregnant=False
      - include one past_pregnancy with id, outcome, pregnancy_start_date, and pregnancy_end_date
      - not include any current-pregnancy keys
    """
    completed = _Create_pregnancy(
        id="pg-200",
        start=1_690_000_000,
        end=1_690_500_000,
        outcome="Live birth",
    )
    records = [completed]

    marshal_summary = marshal_patient_pregnancy_summary(records)

    assert marshal_summary["is_pregnant"] is False
    assert marshal_summary["past_pregnancies"] == [
        {
            "id": "pg-200",
            "outcome": "Live birth",
            "pregnancy_start_date": 1_690_000_000,
            "pregnancy_end_date": 1_690_500_000,
        }
    ]
    # no current-pregnancy keys expected
    assert "pregnancy_id" not in marshal_summary
    assert (
        "pregnancy_start_date" not in marshal_summary
        or marshal_summary["pregnancy_start_date"] != 1_690_000_000
    )


def test_current_then_multiple_past_preserves_order_and_fields():
    """
    A patient with a single ongoing pregnancy and multiple completed pregnancies
    should:
      - set is_pregnant=True
      - set pregnancy_id and pregnancy_start_date
      - include a list of past_pregnancies with id, outcome, pregnancy_start_date, and pregnancy_end_date
      - preserve the order of the input records (i.e. current pregnancy first, then completed pregnancies in the order they were passed)
    """
    current = _Create_pregnancy(
        id="pg-300", start=1_700_100_000, end=None, outcome=None
    )
    past1 = _Create_pregnancy(
        id="pg-250", start=1_699_000_000, end=1_699_500_000, outcome="Live birth"
    )
    past2 = _Create_pregnancy(
        id="pg-150", start=1_680_000_000, end=1_681_000_000, outcome="Miscarriage"
    )
    records = [current, past1, past2]

    marshal_summary = marshal_patient_pregnancy_summary(records)

    assert marshal_summary["is_pregnant"] is True
    assert marshal_summary["pregnancy_id"] == "pg-300"
    assert marshal_summary["pregnancy_start_date"] == 1_700_100_000

    assert marshal_summary["past_pregnancies"] == [
        {
            "id": "pg-250",
            "outcome": "Live birth",
            "pregnancy_start_date": 1_699_000_000,
            "pregnancy_end_date": 1_699_500_000,
        },
        {
            "id": "pg-150",
            "outcome": "Miscarriage",
            "pregnancy_start_date": 1_680_000_000,
            "pregnancy_end_date": 1_681_000_000,
        },
    ]


def test_function_mutates_input_list_when_current_present(marshal_mod):
    """
    Verify that marshal_patient_pregnancy_summary mutates the input list when a current pregnancy is present.

    Given a list of pregnancy records containing a single ongoing pregnancy and one completed pregnancy,
    when marshal_patient_pregnancy_summary is called, the function should delete the ongoing pregnancy from the input list,
    leaving only the completed pregnancy records.

    This test ensures that the marshal_patient_pregnancy_summary function does not leave any ongoing pregnancies in the input list.
    """
    current = _Create_pregnancy(
        id="pg-400", start=1_701_000_000, end=None, outcome=None
    )
    pastX = _Create_pregnancy(
        id="pg-350", start=1_700_000_000, end=1_700_100_000, outcome="Live birth"
    )
    records = [current, pastX]

    marshal_patient_pregnancy_summary(records)

    # The first element (current) is deleted by the function
    assert records == [pastX]
