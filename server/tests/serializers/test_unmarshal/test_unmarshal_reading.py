from typing import Any

from data.marshal import unmarshal
from enums import TrafficLightEnum
from models import ReadingOrm


def _create_reading(
    id: str = "r-001",
    systolic_blood_pressure: int = 120,
    diastolic_blood_pressure: int = 80,
    heart_rate: int = 80,
    symptoms: str = None,
    traffic_light_status: TrafficLightEnum = TrafficLightEnum.GREEN,
    date_taken: int = 1577836800,
    date_retest_needed: int = None,
    retest_of_previous_reading_ids: str = None,
    is_flagged_for_follow_up: bool = None,
    last_edited: int = 1577836800,
    user_id: int = 1,
    patient_id: str = "p-001",
    **extras: Any,
) -> dict:
    """
    Creates a dictionary representing a reading, with the given parameters.
    The dictionary is suitable for passing to unmarshal() to create a ReadingOrm object.
    Parameters can be omitted, in which case they will take on their default values.
    Additional parameters can be passed in as keyword arguments, in which case they will be included in the returned dictionary.
    """
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


def test_unmarshal_reading():
    """
    Tests that unmarshaling a reading returns an object with the correct attributes, and that the unmarshaled object does not have any of the attributes that were not provided in the original reading.
    """
    reading = _create_reading()
    reading_orm = unmarshal(ReadingOrm, reading)

    # Unmarshaled reading should have the same values as the original
    assert reading_orm.id == reading["id"]
    assert reading_orm.systolic_blood_pressure == reading["systolic_blood_pressure"]
    assert reading_orm.diastolic_blood_pressure == reading["diastolic_blood_pressure"]
    assert reading_orm.heart_rate == reading["heart_rate"]
    assert reading_orm.traffic_light_status == reading["traffic_light_status"]
    assert reading_orm.date_taken == reading["date_taken"]
    assert reading_orm.user_id == reading["user_id"]
    assert reading_orm.patient_id == reading["patient_id"]
    assert reading_orm.last_edited == reading["last_edited"]

    # Unmarshaled reading should not have any of the following attributes
    assert not hasattr(reading_orm, "symptoms")
    assert not hasattr(reading_orm, "date_retest_needed")
    assert not hasattr(reading_orm, "retest_of_previous_reading_ids")
    assert not hasattr(reading_orm, "is_flagged_for_follow_up")


def test_unmarshal_reading_keeps_symptoms_string_and_preserves_scalars():
    """
    If symptoms is already a string, it should pass through unchanged;
    other scalar fields should be preserved.
    """
    payload = _create_reading(
        id="r-002",
        systolic_blood_pressure=135,
        diastolic_blood_pressure=88,
        heart_rate=92,
        symptoms="headache,cough",
        traffic_light_status=TrafficLightEnum.YELLOW_UP,
        retest_of_previous_reading_ids="r-0001,r-0002",
    )
    reading = unmarshal(ReadingOrm, payload)

    # Passthrough of symptoms string
    assert reading.symptoms == "headache,cough"

    # Scalars preserved
    assert reading.systolic_blood_pressure == 135
    assert reading.diastolic_blood_pressure == 88
    assert reading.heart_rate == 92
    assert reading.traffic_light_status == TrafficLightEnum.YELLOW_UP
    assert reading.retest_of_previous_reading_ids == "r-0001,r-0002"
    assert reading.patient_id == "p-001"
    assert reading.user_id == 1
