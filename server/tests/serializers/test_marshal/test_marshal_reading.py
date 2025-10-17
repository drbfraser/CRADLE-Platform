import pytest

from data import marshal as m
from enums import TrafficLightEnum
from models import ReadingOrm, UrineTestOrm


def make_reading(
    *,
    id_="r-1",
    patient_id="p-1",
    systolic=120,
    diastolic=80,
    hr=70,
    symptoms=None,
    traffic=TrafficLightEnum.GREEN,
    date_taken=1577836800,  # 2020-01-01
    date_retest_needed=None,
    last_edited=1577836800,
):
    r = ReadingOrm()
    r.id = id_
    r.patient_id = patient_id
    r.systolic_blood_pressure = systolic
    r.diastolic_blood_pressure = diastolic
    r.heart_rate = hr
    r.symptoms = symptoms
    r.traffic_light_status = traffic
    r.date_taken = date_taken
    r.date_retest_needed = date_retest_needed
    r.is_flagged_for_follow_up = None
    r.last_edited = last_edited
    return r


@pytest.mark.parametrize(
    "raw, expected",
    [
        (None, []),  # None -> []
        ("", []),  # ""   -> []
        ("A,B,C", ["A", "B", "C"]),
        ("A, B, C", ["A", " B", " C"]),
    ],
)
def test_symptoms_parsing_table(raw, expected):
    """
    Test that marshalling a ReadingOrm with symptoms set to a string,
    will result in a marshalled object with the symptoms parsed into a list.
    """
    r = make_reading(symptoms=raw)
    marshalled = m.marshal(r, shallow=True)
    assert marshalled["symptoms"] == expected


def test_enum_converted_and_nones_stripped():
    """
    Test that marshalling a ReadingOrm with traffic_light_status set to an Enum
    value, will result in a marshalled object with the traffic_light_status converted
    to its .value. Additionally, test that marshalling strips None-valued fields and
    omits nested relationships when shallow=True.
    """
    reading = make_reading(traffic=TrafficLightEnum.RED_UP)
    marshalled = m.marshal(reading, shallow=True)
    # Enum -> .value via __pre_process
    assert marshalled["traffic_light_status"] == TrafficLightEnum.RED_UP.value
    assert marshalled["last_edited"] == 1577836800
    assert marshalled["date_taken"] == 1577836800
    assert "date_retest_needed" not in marshalled
    assert "is_flagged_for_follow_up" not in marshalled
    assert "referral" not in marshalled
    assert "patient" not in marshalled


def test_urine_tests_respects_shallow_toggle():
    """
    Test that marshalling a ReadingOrm with shallow=True respects the shallow parameter and
    omits the nested UrineTestOrm relationship, while marshalling with shallow=False respects
    the parameter and includes the nested relationship in the marshalled output.
    """
    reading = make_reading(symptoms="A,B")
    urine_test = UrineTestOrm()
    urine_test.id = "ut-9"
    urine_test.protein = "++"
    reading.urine_tests = urine_test

    # shallow=True: nested should NOT appear
    o_shallow = m.marshal(reading, shallow=True)
    assert "urine_tests" not in o_shallow

    # shallow=False: nested should appear and be marshalled
    o_deep = m.marshal(reading, shallow=False)
    assert "urine_tests" in o_deep
    assert o_deep["urine_tests"]["id"] == "ut-9"
    assert o_deep["urine_tests"]["protein"] == "++"


def test_input_object_not_mutated_by_marshal():
    """
    Test that marshaling an object does not mutate the original object.

    This test verifies that the input object passed to marshal is not modified
    by the marshaling process. It creates a ReadingOrm with a symptom list and
    checks that the list is not modified by the marshaling process.

    """
    reading = make_reading(symptoms="A,B")
    _before = reading.symptoms
    marshalled = m.marshal(reading, shallow=True)
    assert marshalled["symptoms"] == ["A", "B"]
    assert reading.symptoms == _before


def test_basic_fields_preserved_minimally():
    """
    Test that marshaling a ReadingOrm preserves the basic fields (id, patient_id, symptoms)
    minimally.

    This test verifies that the basic fields of a ReadingOrm instance are
    preserved when marshaling the object with shallow=True. It creates a ReadingOrm
    instance with a None value for symptoms and checks that the marshalled output
    contains the same values for the basic fields as the original object.

    """
    reading = make_reading(id_="r-xyz", patient_id="p-007", symptoms=None)
    marshalled = m.marshal(reading, shallow=True)
    assert marshalled["id"] == "r-xyz"
    assert marshalled["patient_id"] == "p-007"
    assert marshalled["symptoms"] == []
