# ruff: noqa: SLF001
import data.orm_serializer as orm_seralizer
from models import HealthFacilityOrm, PatientOrm, ReferralOrm


def make_referral(
    *,
    id_="ref-1",
    patient_id="p-1",
    facility_name="General Hospital",
    date_referred=1577836800,  # 2020-01-01
    last_edited=1577836800,
    comment=None,
    action_taken=None,
    is_assessed=False,
    date_assessed=None,
    is_cancelled=False,
    cancel_reason=None,
    date_cancelled=None,
    not_attended=False,
    not_attend_reason=None,
    date_not_attended=None,
):
    """
    Creates a Referral object with the given parameters

    Parameters
    ----------
    id_ : str, optional
        The ID of the referral. Defaults to "ref-1".
    patient_id : str, optional
        The ID of the patient referred. Defaults to "p-1".
    facility_name : str, optional
        The name of the health facility referred to. Defaults to "General Hospital".
    date_referred : int, optional
        The timestamp of when the referral was made. Defaults to 1577836800 (2020-01-01).
    last_edited : int, optional
        The timestamp of when the referral was last edited. Defaults to 1577836800 (2020-01-01).
    comment : str, optional
        A comment about the referral. Defaults to None.
    action_taken : str, optional
        The action taken by the patient. Defaults to None.
    is_assessed : bool, optional
        Whether the patient has been assessed. Defaults to False.
    date_assessed : int, optional
        The timestamp of when the patient was assessed. Defaults to None.
    is_cancelled : bool, optional
        Whether the referral has been cancelled. Defaults to False.
    cancel_reason : str, optional
        The reason for cancellation. Defaults to None.
    date_cancelled : int, optional
        The timestamp of when the referral was cancelled. Defaults to None.
    not_attended : bool, optional
        Whether the patient did not attend. Defaults to False.
    not_attend_reason : str, optional
        The reason for not attending. Defaults to None.
    date_not_attended : int, optional
        The timestamp of when the patient did not attend. Defaults to None.

    Returns
    -------
    Referral
        The created referral object

    """
    reading = ReferralOrm()
    reading.id = id_
    reading.patient_id = patient_id
    reading.health_facility_name = facility_name

    reading.date_referred = date_referred
    reading.comment = comment

    reading.action_taken = action_taken
    reading.is_assessed = is_assessed
    reading.date_assessed = date_assessed

    reading.is_cancelled = is_cancelled
    reading.cancel_reason = cancel_reason
    reading.date_cancelled = date_cancelled

    reading.not_attended = not_attended
    reading.not_attend_reason = not_attend_reason
    reading.date_not_attended = date_not_attended

    reading.last_edited = last_edited
    return reading


def test_referral_strips_relationship_objects_when_present():
    """
    Test that ReferralSerializer removes relationship objects when they are present

    It checks that when Referral object is passed to ReferralSerializer, it removes
    the relationship objects (health_facility and patient) and replaces them with
    the corresponding IDs (health_facility_name and patient_id)

    It also checks that the IDs are correctly populated in the output
    """
    reading = make_referral()

    health_facility = HealthFacilityOrm()
    health_facility.name = "General Hospital"
    reading.health_facility = health_facility

    patient = PatientOrm()
    patient.id = "p-1"
    reading.patient = patient

    marshalled = orm_seralizer.marshal(reading)

    # Relationships must be removed
    assert "health_facility" not in marshalled
    assert "patient" not in marshalled

    assert marshalled["patient_id"] == "p-1"
    assert marshalled["health_facility_name"] == "General Hospital"


def test_referral_strips_none_fields_but_preserves_false_booleans_and_timestamps():
    """
    Test that ReferralSerializer removes None fields but preserves False booleans and timestamps.

    It creates a Referral object with None fields and verifies that the marshalled output
    does not contain the None fields. It also checks that the False booleans and timestamps
    are preserved in the output.

    """
    reading = make_referral(
        comment=None,
        action_taken=None,
        date_assessed=None,
        cancel_reason=None,
        date_cancelled=None,
        not_attend_reason=None,
        date_not_attended=None,
        is_assessed=False,
        is_cancelled=False,
        not_attended=False,
    )

    marshalled = orm_seralizer.marshal(reading)

    # None fields should be gone
    for k in (
        "comment",
        "action_taken",
        "date_assessed",
        "cancel_reason",
        "date_cancelled",
        "not_attend_reason",
        "date_not_attended",
    ):
        assert k not in marshalled

    # Booleans defaulting to False should remain
    assert marshalled["is_assessed"] is False
    assert marshalled["is_cancelled"] is False
    assert marshalled["not_attended"] is False

    assert marshalled["date_referred"] == 1577836800
    assert marshalled["last_edited"] == 1577836800


def test_referral_preserves_non_empty_strings_and_scalars():
    """
    Test that ReferralSerializer preserves non-empty strings and scalars

    It creates a Referral object with non-empty strings and scalars and verifies that the
    marshalled output contains the same values.

    """
    reading = make_referral(
        comment="Patient referred for evaluation",
        action_taken="Initial triage completed",
        is_assessed=True,
        date_assessed=1577923200,  # 2020-01-02
    )
    marshalled = orm_seralizer.marshal(reading)

    assert marshalled["comment"] == "Patient referred for evaluation"
    assert marshalled["action_taken"] == "Initial triage completed"
    assert marshalled["is_assessed"] is True
    assert marshalled["date_assessed"] == 1577923200


def test_referral_private_attrs_are_stripped_and_input_not_mutated():
    """
    Test that ReferralSerializer removes private attributes and doesn't mutate the input object

    It creates a Referral object with a private attribute, marshals it, and verifies that the
    marshalled output doesn't contain the private attribute and the input object remains unchanged.

    """
    reading = make_referral()
    reading._secret = 123  # should be removed by __pre_process

    health_facility = HealthFacilityOrm()
    health_facility.name = "General Hospital"
    reading.health_facility = health_facility
    before_rel = reading.health_facility

    marshalled = orm_seralizer.marshal(reading)

    assert "_secret" not in marshalled

    assert "health_facility" not in marshalled

    assert reading.health_facility is before_rel


def test_referral_minimum_expected_keys_present():
    """
    Test that ReferralSerializer outputs the minimum expected keys

    It creates a Referral object and marshals it, then verifies that the marshalled
    output contains the minimum expected keys (id, patient_id, health_facility_name,
    date_referred, last_edited)
    """
    reading = make_referral()
    marshalled = orm_seralizer.marshal(reading)

    for k in (
        "id",
        "patient_id",
        "health_facility_name",
        "date_referred",
        "last_edited",
    ):
        assert k in marshalled
