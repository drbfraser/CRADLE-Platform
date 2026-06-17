import datetime as dt

import pytest

import data.orm_serializer as orm_seralizer
from enums import SexEnum
from models import PatientOrm, ReadingOrm


@pytest.fixture
def patient_orm():
    """
    Returns a PatientOrm object with the following attributes:

    - id: "p-1"
    - name: "Mary Brown"
    - sex: SexEnum.FEMALE
    - is_pregnant: True
    - medical_history: None
    - drug_history: None
    - allergy: "Peanuts"
    - zone: "1"
    - date_of_birth: datetime.date(1998, 1, 1)
    - last_edited: 1577836800 (2020-01-01 00:00:00 UTC epoch)

    This fixture is used in tests that require a PatientOrm object
    with a specific set of attributes.
    """
    patient = PatientOrm()
    patient.id = "p-1"
    patient.name = "Mary Brown"
    patient.sex = SexEnum.FEMALE
    patient.is_pregnant = True
    patient.medical_history = None
    patient.drug_history = None
    patient.allergy = "Peanuts"
    patient.zone = "1"
    patient.date_of_birth = dt.date(1998, 1, 1)
    patient.last_edited = 1577836800  # 2020-01-01 00:00:00 UTC epoch
    return patient


def test_patient_shallow_sets_base_and_converts_types(patient_orm):
    """
    Test that shallow marshaling of a PatientOrm sets the "base" field to the same
    value as "last_edited", and that it converts Enum values to their string
    representations. Additionally, it should strip None-valued fields and omit nested
    relationships.

    This test creates a PatientOrm with specific attributes and then marshals it with
    shallow=True. It then asserts that the marshalled output contains the expected
    fields and values.

    :param patient_orm: A PatientOrm object with specific attributes.
    """
    marshalled = orm_seralizer.marshal(patient_orm, shallow=True)
    assert marshalled["id"] == "p-1"
    assert marshalled["name"] == "Mary Brown"
    assert marshalled["date_of_birth"] == "1998-01-01"
    assert marshalled["sex"] == patient_orm.sex.value  # NOT the Enum
    assert marshalled["is_pregnant"] is True
    assert "medical_history" not in marshalled  # None stripped
    assert "drug_history" not in marshalled
    assert marshalled["base"] == marshalled["last_edited"] == 1577836800
    # shallow should omit nested
    for k in ("readings", "referrals", "assessments"):
        assert k not in marshalled


def test_patient_non_shallow_includes_nested_lists(patient_orm):
    """
    Test that non-shallow marshaling of a PatientOrm includes nested lists of readings, referrals,
    and assessments.

    This test creates a PatientOrm with a single reading and then marshals it with shallow=False.
    It then asserts that the marshalled output contains a nested list of readings with the
    expected fields and values.

    :param patient_orm: A PatientOrm object with a single reading.
    """
    reading = ReadingOrm()
    reading.id = 1
    reading.symptoms = None
    patient_orm.readings = [reading]
    marshalled = orm_seralizer.marshal(patient_orm, shallow=False)
    assert "readings" in marshalled and isinstance(marshalled["readings"], list)
    assert marshalled["readings"][0]["id"] == 1
