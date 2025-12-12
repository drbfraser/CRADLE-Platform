from __future__ import annotations

from data import orm_serializer
from enums import TrafficLightEnum
from models import ReadingOrm
from tests.helpers import make_reading


def test_unmarshal_reading_roundtrip_and_absent_fields_are_none():
    """
    Test that unmarshaling a reading with omitted fields results in an object with None for those fields.
    Test that unmarshaling a reading with all fields present results in an object with the same values for those fields.
    """
    payload = make_reading()  # symptoms/retest_* omitted (None → filtered before load)
    r = orm_serializer.unmarshal(ReadingOrm, payload)

    assert r.id == payload["id"]
    assert r.systolic_blood_pressure == payload["systolic_blood_pressure"]
    assert r.diastolic_blood_pressure == payload["diastolic_blood_pressure"]
    assert r.heart_rate == payload["heart_rate"]
    assert r.traffic_light_status == payload["traffic_light_status"]
    assert r.date_taken == payload["date_taken"]
    assert r.user_id == payload["user_id"]
    assert r.patient_id == payload["patient_id"]
    assert r.last_edited == payload["last_edited"]

    assert r.symptoms is None
    assert r.date_retest_needed is None
    assert r.retest_of_previous_reading_ids is None
    assert r.is_flagged_for_follow_up is None


def test_unmarshal_reading_keeps_symptoms_string_and_preserves_scalars():
    """
    If 'symptoms' is a CSV string, it passes through unchanged.
    Vitals chosen to actually correspond to YELLOW_UP if invariants recompute.
    """
    payload = make_reading(
        id="r-002",
        systolic_blood_pressure=145,  # ≥140
        diastolic_blood_pressure=95,  # ≥90
        heart_rate=92,
        symptoms="headache,cough",
        traffic_light_status=TrafficLightEnum.YELLOW_UP,
        retest_of_previous_reading_ids="r-0001,r-0002",
    )
    r = orm_serializer.unmarshal(ReadingOrm, payload)

    assert r.symptoms == "headache,cough"

    assert r.systolic_blood_pressure == 145
    assert r.diastolic_blood_pressure == 95
    assert r.heart_rate == 92
    assert r.traffic_light_status == TrafficLightEnum.YELLOW_UP
    assert r.retest_of_previous_reading_ids == "r-0001,r-0002"
    assert r.patient_id == "p-001"
    assert r.user_id == 1
