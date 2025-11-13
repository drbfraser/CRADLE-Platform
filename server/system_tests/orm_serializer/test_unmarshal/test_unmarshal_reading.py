from __future__ import annotations

from typing import Any

from data.marshal import unmarshal
from enums import TrafficLightEnum
from models import ReadingOrm


def _create_reading(
    id: str = "r-001",
    systolic_blood_pressure: int = 120,
    diastolic_blood_pressure: int = 80,
    heart_rate: int = 80,
    symptoms: str | None = None,
    traffic_light_status: TrafficLightEnum = TrafficLightEnum.GREEN,
    date_taken: int = 1577836800,
    date_retest_needed: int | None = None,
    retest_of_previous_reading_ids: str | None = None,
    is_flagged_for_follow_up: bool | None = None,
    last_edited: int = 1577836800,
    user_id: int = 1,
    patient_id: str = "p-001",
    **extras: Any,
) -> dict:
    """Factory payload for ReadingOrm."""
    return dict(
        id=id,
        systolic_blood_pressure=systolic_blood_pressure,
        diastolic_blood_pressure=diastolic_blood_pressure,
        heart_rate=heart_rate,
        symptoms=symptoms,
        traffic_light_status=traffic_light_status,
        date_taken=date_taken,
        date_retest_needed=date_retest_needed,
        retest_of_previous_reading_ids=retest_of_previous_reading_ids,
        is_flagged_for_follow_up=is_flagged_for_follow_up,
        last_edited=last_edited,
        user_id=user_id,
        patient_id=patient_id,
        **extras,
    )


def test_unmarshal_reading_roundtrip_and_absent_fields_are_none():
    """
    Test that unmarshaling a reading with omitted fields results in an object with None for those fields.
    Test that unmarshaling a reading with all fields present results in an object with the same values for those fields.
    """
    payload = (
        _create_reading()
    )  # symptoms/retest_* omitted (None → filtered before load)
    r = unmarshal(ReadingOrm, payload)

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
    payload = _create_reading(
        id="r-002",
        systolic_blood_pressure=145,  # ≥140
        diastolic_blood_pressure=95,  # ≥90
        heart_rate=92,
        symptoms="headache,cough",
        traffic_light_status=TrafficLightEnum.YELLOW_UP,
        retest_of_previous_reading_ids="r-0001,r-0002",
    )
    r = unmarshal(ReadingOrm, payload)

    assert r.symptoms == "headache,cough"

    assert r.systolic_blood_pressure == 145
    assert r.diastolic_blood_pressure == 95
    assert r.heart_rate == 92
    assert r.traffic_light_status == TrafficLightEnum.YELLOW_UP
    assert r.retest_of_previous_reading_ids == "r-0001,r-0002"
    assert r.patient_id == "p-001"
    assert r.user_id == 1
