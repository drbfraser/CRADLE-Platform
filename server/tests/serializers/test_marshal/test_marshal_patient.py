import pytest
import datetime as dt
from enums import SexEnum
from data import marshal as m


@pytest.fixture
def patient_orm():
    from models import PatientOrm

    p = PatientOrm()
    p.id = "p-1"
    p.name = "Mary Brown"
    p.sex = SexEnum.FEMALE
    p.is_pregnant = True
    p.medical_history = None
    p.drug_history = None
    p.allergy = "Peanuts"
    p.zone = "1"
    p.date_of_birth = dt.date(1998, 1, 1)
    p.last_edited = 1577836800  # 2020-01-01 00:00:00 UTC epoch
    return p


def test_patient_shallow_sets_base_and_converts_types(patient_orm):
    out = m.marshal(patient_orm, shallow=True)
    assert out["id"] == "p-1"
    assert out["name"] == "Mary Brown"
    assert out["date_of_birth"] == "1998-01-01"
    assert out["sex"] == patient_orm.sex.value  # NOT the Enum
    assert out["is_pregnant"] is True
    assert "medical_history" not in out  # None stripped
    assert "drug_history" not in out
    assert out["base"] == out["last_edited"] == 1577836800
    # shallow should omit nested
    for k in ("readings", "referrals", "assessments"):
        assert k not in out


def test_patient_non_shallow_includes_nested_lists(patient_orm):
    from models import ReadingOrm

    r = ReadingOrm()
    r.id = 1
    r.symptoms = None
    patient_orm.readings = [r]
    out = m.marshal(patient_orm, shallow=False)
    assert "readings" in out and isinstance(out["readings"], list)
    assert out["readings"][0]["id"] == 1
