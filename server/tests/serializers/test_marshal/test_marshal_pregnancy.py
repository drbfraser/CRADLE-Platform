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
    """
    Helper function to create a PregnancyOrm instance with given parameters.

    Args:
        id_: int, default=42
        patient_id: str, default="p-1"
        start_date: int, default=1577836800 (2020-01-01)
        end_date: Optional[int], default=None
        outcome: Optional[str], default=None
        last_edited: int, default=1577923200 (2020-01-02)

    Returns:
        PregnancyOrm: instance with given parameters

    """
    pregnancy = PregnancyOrm()
    pregnancy.id = id_
    pregnancy.patient_id = patient_id
    pregnancy.start_date = start_date
    pregnancy.end_date = end_date
    pregnancy.outcome = outcome
    pregnancy.last_edited = last_edited
    return pregnancy


def test_pregnancy_ongoing_includes_null_end_date_and_outcome_key():
    """
    Test that marshal_pregnancy includes null end_date and outcome key
    for an ongoing pregnancy.
    """
    pr = make_pregnancy(end_date=None, outcome=None)
    marshalled = m.marshal(pr)

    assert marshalled["id"] == 42
    assert marshalled["patient_id"] == "p-1"
    assert marshalled["start_date"] == 1577836800
    assert "end_date" in marshalled and marshalled["end_date"] is None
    assert "outcome" in marshalled and marshalled["outcome"] is None
    assert marshalled["last_edited"] == 1577923200

    assert set(marshalled.keys()) == {
        "id",
        "patient_id",
        "start_date",
        "end_date",
        "outcome",
        "last_edited",
    }


def test_pregnancy_completed_sets_end_date_and_outcome():
    """
    Test that marshal_pregnancy sets end_date and outcome
    for a completed pregnancy.
    """
    pregnancy = make_pregnancy(
        end_date=1580515200, outcome="Mode of delivery: assisted birth"
    )
    marshalled = m.marshal(pregnancy)

    assert marshalled["end_date"] == 1580515200
    assert marshalled["outcome"] == "Mode of delivery: assisted birth"


def test_pregnancy_relationship_not_leaked_when_patient_loaded():
    """
    Test that marshal_pregnancy doesn't leak the patient relationship when patient is loaded

    Given a pregnancy with a patient relationship, when the patient is loaded into memory,
    the marshal_pregnancy function should not include the patient relationship in the marshalledput.
    """
    pregnancy = make_pregnancy()
    patient = PatientOrm()
    patient.id = "p-1"
    pregnancy.patient = patient

    marshalled = m.marshal(pregnancy)
    assert "patient" not in marshalled
    assert marshalled["patient_id"] == "p-1"


def test_pregnancy_private_attrs_not_leaked_and_input_not_mutated():
    """
    Test that marshal_pregnancy doesn't leak private attributes and doesn't mutate the input object

    Given a pregnancy with a private attribute, when marshal_pregnancy is called,
    the private attribute should not be included in the marshalledput and the input object should not be mutated.
    """
    pregnancy = make_pregnancy()
    pregnancy._secret = "dont-leak-me"

    before_secret = pregnancy._secret
    marshalled = m.marshal(pregnancy)

    assert "_secret" not in marshalled
    assert pregnancy._secret == before_secret


def test_pregnancy_types_are_preserved():
    """
    Test that marshal_pregnancy preserves the types of the original PregnancyOrm instance.

    Given a PregnancyOrm instance with id, patient_id, start_date, end_date, outcome, and last_edited attributes,
    when marshal_pregnancy is called, the function should return a dict with the same attributes
    and the same types.

    This test ensures that the marshal_pregnancy function does not lose any information abmarshalled the
    types of the attributes when serializing the PregnancyOrm instance to a dict.
    """
    pregnancy = make_pregnancy(
        id_=7,
        patient_id="pat-99",
        start_date=1700000001,
        end_date=1700009999,
        outcome="Healthy newborn",
        last_edited=1700011111,
    )
    marshalled = m.marshal(pregnancy)

    assert isinstance(marshalled["id"], int)
    assert marshalled["id"] == 7
    assert (
        isinstance(marshalled["patient_id"], str)
        and marshalled["patient_id"] == "pat-99"
    )
    assert (
        isinstance(marshalled["start_date"], int)
        and marshalled["start_date"] == 1700000001
    )
    assert (
        isinstance(marshalled["end_date"], int) and marshalled["end_date"] == 1700009999
    )
    assert (
        isinstance(marshalled["last_edited"], int)
        and marshalled["last_edited"] == 1700011111
    )
    assert marshalled["outcome"] == "Healthy newborn"
