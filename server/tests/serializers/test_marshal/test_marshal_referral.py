# tests/serializers/test_marshal/test_marshal_referral.py

import pytest
from data import marshal as m
from models import ReferralOrm, HealthFacilityOrm, PatientOrm


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
    r = ReferralOrm()
    r.id = id_
    r.patient_id = patient_id
    r.health_facility_name = facility_name

    r.date_referred = date_referred
    r.comment = comment

    r.action_taken = action_taken
    r.is_assessed = is_assessed
    r.date_assessed = date_assessed

    r.is_cancelled = is_cancelled
    r.cancel_reason = cancel_reason
    r.date_cancelled = date_cancelled

    r.not_attended = not_attended
    r.not_attend_reason = not_attend_reason
    r.date_not_attended = date_not_attended

    r.last_edited = last_edited
    return r


def test_referral_strips_relationship_objects_when_present():
    r = make_referral()

    # Use proper mapped instances so SQLAlchemy doesn't choke
    hf = HealthFacilityOrm()
    hf.name = "General Hospital"
    r.health_facility = hf

    p = PatientOrm()
    p.id = "p-1"
    r.patient = p

    out = m.marshal(r)

    # Relationships must be removed
    assert "health_facility" not in out
    assert "patient" not in out

    # Scalar FKs remain
    assert out["patient_id"] == "p-1"
    assert out["health_facility_name"] == "General Hospital"


def test_referral_strips_none_fields_but_preserves_false_booleans_and_timestamps():
    r = make_referral(
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

    out = m.marshal(r)

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
        assert k not in out

    # Booleans defaulting to False should remain
    assert out["is_assessed"] is False
    assert out["is_cancelled"] is False
    assert out["not_attended"] is False

    assert out["date_referred"] == 1577836800
    assert out["last_edited"] == 1577836800


def test_referral_preserves_non_empty_strings_and_scalars():
    r = make_referral(
        comment="Patient referred for evaluation",
        action_taken="Initial triage completed",
        is_assessed=True,
        date_assessed=1577923200,  # 2020-01-02
    )
    out = m.marshal(r)

    assert out["comment"] == "Patient referred for evaluation"
    assert out["action_taken"] == "Initial triage completed"
    assert out["is_assessed"] is True
    assert out["date_assessed"] == 1577923200


def test_referral_private_attrs_are_stripped_and_input_not_mutated():
    r = make_referral()
    r._secret = 123  # should be removed by __pre_process

    hf = HealthFacilityOrm()
    hf.name = "General Hospital"
    r.health_facility = hf
    before_rel = r.health_facility

    out = m.marshal(r)

    assert "_secret" not in out

    assert "health_facility" not in out

    assert r.health_facility is before_rel


def test_referral_minimum_expected_keys_present():
    r = make_referral()
    out = m.marshal(r)

    for k in (
        "id",
        "patient_id",
        "health_facility_name",
        "date_referred",
        "last_edited",
    ):
        assert k in out
