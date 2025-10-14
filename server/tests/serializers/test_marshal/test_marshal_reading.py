# ruff: noqa: SLF001
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
    r = make_reading(symptoms=raw)
    out = m.marshal(r, shallow=True)
    assert out["symptoms"] == expected


def test_enum_converted_and_nones_stripped():
    r = make_reading(traffic=TrafficLightEnum.RED_UP)
    out = m.marshal(r, shallow=True)
    # Enum -> .value via __pre_process
    assert out["traffic_light_status"] == TrafficLightEnum.RED_UP.value
    assert out["last_edited"] == 1577836800
    assert out["date_taken"] == 1577836800
    assert "date_retest_needed" not in out
    assert "is_flagged_for_follow_up" not in out
    assert "referral" not in out
    assert "patient" not in out


def test_urine_tests_respects_shallow_toggle():
    r = make_reading(symptoms="A,B")
    ut = UrineTestOrm()
    ut.id = "ut-9"
    ut.protein = "++"
    r.urine_tests = ut

    # shallow=True: nested should NOT appear
    o_shallow = m.marshal(r, shallow=True)
    assert "urine_tests" not in o_shallow

    # shallow=False: nested should appear and be marshalled
    o_deep = m.marshal(r, shallow=False)
    assert "urine_tests" in o_deep
    assert o_deep["urine_tests"]["id"] == "ut-9"
    assert o_deep["urine_tests"]["protein"] == "++"


def test_input_object_not_mutated_by_marshal():
    r = make_reading(symptoms="A,B")
    _before = r.symptoms
    out = m.marshal(r, shallow=True)
    assert out["symptoms"] == ["A", "B"]
    assert r.symptoms == _before


def test_basic_fields_preserved_minimally():
    r = make_reading(id_="r-xyz", patient_id="p-007", symptoms=None)
    out = m.marshal(r, shallow=True)
    assert out["id"] == "r-xyz"
    assert out["patient_id"] == "p-007"
    assert out["symptoms"] == []
