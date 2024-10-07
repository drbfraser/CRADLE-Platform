from data import crud
from models import Patient


def test_read(patient_factory):
    expected = patient_factory.create(patientId="abc", patientName="ABC")
    actual = crud.read(Patient, patientId="abc")
    assert actual == expected


def test_update(patient_factory):
    patient_factory.create(patientId="abc", patientName="ABC")

    crud.update(Patient, {"patientName": "CDE"}, patientId="abc")

    query = crud.read(Patient, patientId="abc")
    assert query.patientName == "CDE"


def test_delete(patient_factory):
    patient = patient_factory.create(patientId="abc")
    crud.delete(patient)
    assert not crud.read(Patient, patientId="abc")


def test_delete_by(patient_factory):
    patient_factory.create(patientId="abc")
    crud.delete_by(Patient, patientId="abc")
    assert not crud.read(Patient, patientId="abc")
