from data import crud
from models import PatientOrm


def test_read(patient_factory):
    expected = patient_factory.create(id="abc", name="ABC")
    actual = crud.read(PatientOrm, id="abc")
    assert actual == expected


def test_update(patient_factory):
    patient_factory.create(id="abc", patientName="ABC")

    crud.update(PatientOrm, {"name": "CDE"}, id="abc")

    query = crud.read(PatientOrm, id="abc")
    assert query is not None and query.name == "CDE"


def test_delete(patient_factory):
    patient = patient_factory.create(id="abc")
    crud.delete(patient)
    assert not crud.read(PatientOrm, id="abc")


def test_delete_by(patient_factory):
    patient_factory.create(id="abc")
    crud.delete_by(PatientOrm, id="abc")
    assert not crud.read(PatientOrm, id="abc")
