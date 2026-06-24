import pytest
import sqlalchemy

import data.db_operations as crud
import models
from common.commonUtil import get_current_time, get_uuid
from enums import SexEnum

# create & read tests


def test_create_read_basic():
    patient = models.PatientOrm(sex=SexEnum.FEMALE, name="Test Name")

    crud.create(patient)
    patientRead = crud.read(models.PatientOrm, id=patient.id)

    assert patientRead.name == "Test Name"
    assert patientRead.sex == SexEnum.FEMALE


def test_create_commit_rollback():
    patient = models.PatientOrm(sex=SexEnum.FEMALE, name="Test Name")
    crud.create(patient, autocommit=False)
    patientRead = crud.read(models.PatientOrm, id=patient.id)

    assert patientRead.name == "Test Name"
    assert patientRead.sex == SexEnum.FEMALE
    crud.db_session.rollback()

    assert crud.read(models.PatientOrm, id=patient.id) is None


def test_create_refresh_rollback():
    patient1 = models.PatientOrm(sex=SexEnum.FEMALE, name="Test Name")
    patient2 = models.PatientOrm(sex=SexEnum.FEMALE, name="Test Name 2")

    crud.create(patient1, refresh=True, autocommit=False)
    crud.create(patient2, refresh=True, autocommit=False)

    crud.db_session.rollback()
    assert crud.read(models.PatientOrm, id=patient1.id) is None
    assert crud.read(models.PatientOrm, id=patient2.id) is None


def test_transaction_scope():
    patient1 = models.PatientOrm(sex=SexEnum.FEMALE, name="Test Name")
    patient2 = models.PatientOrm(sex=SexEnum.FEMALE, name="Test Name 2")
    patient3 = models.PatientOrm(sex=SexEnum.FEMALE, name="Test Name 3")

    crud.create(patient1)
    crud.create(patient2, autocommit=False)
    crud.db_session.rollback()
    crud.create(patient3)

    assert crud.read(models.PatientOrm, id=patient1.id).id == patient1.id
    assert crud.read(models.PatientOrm, id=patient2.id) is None
    assert crud.read(models.PatientOrm, id=patient3.id).id == patient3.id


def test_bad_create():
    patient = None
    with pytest.raises(Exception):
        crud.create(patient)

    patient = models.PatientOrm()
    with pytest.raises(Exception):
        crud.create(patient)


# create_model tests


def test_create_model_basic():
    patientDict = dict(sex=SexEnum.FEMALE, name="Create Model Test")
    model = crud.create_model(patientDict, models.PatientSchema)

    # Verifies the model contains all information in the dict
    assert patientDict.items() <= model.as_dict().items()
    assert crud.read(models.PatientOrm, id=model.id) == model


def test_create_model_bad():
    patientDict = dict(sex=SexEnum.FEMALE, name="Create Model Test")
    with pytest.raises(Exception):
        crud.create_model(patientDict, None)

    with pytest.raises(Exception):
        crud.create_model(None, models.PatientSchema)


# create_all tests


def test_create_all_basic():
    # Ensures tests can be ran more than once
    crud.delete_by(models.UserOrm, username="TestUsername")

    patient = models.PatientOrm(sex=SexEnum.FEMALE, name="Test Name")
    user = models.UserOrm(
        name="Test Name", username="TestUsername", email="test@test.com"
    )

    userNumber = models.UserPhoneNumberOrm(user=user, phone_number="804-222-1111")

    crud.create_all([patient, user, userNumber])

    assert crud.read(models.PatientOrm, id=patient.id) == patient
    assert crud.read(models.UserOrm, id=user.id) == user
    assert crud.read(models.UserPhoneNumberOrm, id=userNumber.id) == userNumber
    assert len(crud.read_all(models.UserPhoneNumberOrm, user=user)) == 1


def test_create_all_bad_rolls_back_all_models():
    patient = models.PatientOrm(sex=SexEnum.FEMALE, name="Test Name")
    with pytest.raises(Exception):
        crud.create_all([patient, None])
    assert crud.read(models.PatientOrm, id=patient.id) is None


def test_create_all_transaction():
    patient = models.PatientOrm(sex=SexEnum.FEMALE, name="Test Name")
    record = models.MedicalRecordOrm(
        information="Test Record", is_drug_record=False, patient=patient
    )

    crud.create_all([patient, record], False)

    assert crud.read(models.PatientOrm, id=patient.id) == patient
    assert len(crud.read_all(models.MedicalRecordOrm, patient=patient)) == 1

    crud.db_session.rollback()

    assert crud.read(models.PatientOrm, id=patient.id) is None
    assert len(crud.read_all(models.MedicalRecordOrm, patient=patient)) == 0


# read tests
# Basic read tests are done throughout the other tests, so only edge cases need to be tested


def test_read_null():
    with pytest.raises(Exception):
        crud.read(None)


def test_read_empty():
    assert crud.read(models.PatientOrm, id="fake id") is None


def test_read_many():
    with pytest.raises(sqlalchemy.exc.MultipleResultsFound):
        crud.read(models.PatientOrm)


# update tests


def test_update_basic(patient_factory):
    patient = patient_factory.create(id="abc")
    patientDict = patient.as_dict()

    updatedPatientDict = crud.update(
        models.PatientOrm, dict(name="Updated Name"), id=patient.id
    ).as_dict()
    assert patientDict != updatedPatientDict

    patientDict["name"] = "Updated Name"
    assert patientDict == updatedPatientDict


def test_update_many():
    with pytest.raises(sqlalchemy.exc.MultipleResultsFound):
        crud.update(models.PatientOrm, dict(name="test"))


def test_update_transaction(patient_factory):
    patient = patient_factory.create(id="abc")
    patientDict = patient.as_dict()

    updatedPatientDict = crud.update(
        models.PatientOrm, dict(name="New Name"), autocommit=False, id=patient.id
    ).as_dict()

    assert updatedPatientDict != patientDict
    assert crud.read(models.PatientOrm, id=patient.id).as_dict() != patientDict

    crud.db_session.rollback()

    assert crud.read(models.PatientOrm, id=patient.id).as_dict() == patientDict


def test_update_invalid_member(patient_factory):
    patient = patient_factory.create(id="abc")
    with pytest.raises(ValueError):
        crud.update(models.PatientOrm, dict(fake_entry="new test"), id=patient.id)

    assert not hasattr(patient, "fake_entry")
    assert not hasattr(crud.read(models.PatientOrm, id=patient.id), "fake_entry")


def test_update_reading_transaction_rolls_back_invariants(
    patient_factory, reading_factory
):
    patient = patient_factory.create()
    reading = reading_factory.create(
        systolic_blood_pressure=110, diastolic_blood_pressure=80, patient_id=patient.id
    )
    original = reading.systolic_blood_pressure

    crud.update(
        models.ReadingOrm,
        dict(systolic_blood_pressure=150),
        autocommit=False,
        id=reading.id,
    )

    crud.db_session.rollback()

    assert (
        crud.read(models.ReadingOrm, id=reading.id).systolic_blood_pressure == original
    )


# merge tests


def test_merge_basic():
    patient = models.PatientOrm(
        sex=SexEnum.FEMALE,
        name="Original Name",
        id=get_uuid(),
        date_created=get_current_time(),
        last_edited=get_current_time(),
    )
    patientDict = patient.as_dict()

    crud.merge(patient)
    assert patientDict == crud.read(models.PatientOrm, id=patient.id).as_dict()

    updatedPatient = models.PatientOrm(
        id=patient.id, sex=SexEnum.MALE, name="Updated Name"
    )

    crud.merge(updatedPatient)

    assert patientDict != updatedPatient.as_dict()

    newPatient = crud.read(models.PatientOrm, id=patient.id)
    assert newPatient.name == updatedPatient.name
    assert newPatient.sex == updatedPatient.sex
    assert newPatient.date_created == patient.date_created


def test_merge_transaction():
    patient = models.PatientOrm(
        sex=SexEnum.FEMALE,
        name="Original Name",
        id=get_uuid(),
        date_created=get_current_time(),
        last_edited=get_current_time(),
    )
    patientDict = patient.as_dict()

    crud.merge(patient)
    assert patientDict == crud.read(models.PatientOrm, id=patient.id).as_dict()

    updatedPatient = models.PatientOrm(
        id=patient.id, sex=SexEnum.MALE, name="Updated Name"
    )

    crud.merge(updatedPatient, autocommit=False)

    newPatient = crud.read(models.PatientOrm, id=patient.id)
    assert newPatient.name == updatedPatient.name
    assert newPatient.sex == updatedPatient.sex
    assert newPatient.date_created == patient.date_created

    crud.db_session.rollback()

    assert patientDict == crud.read(models.PatientOrm, id=patient.id).as_dict()


def test_merge_null():
    with pytest.raises(Exception):
        crud.merge(None)


# delete tests


def test_delete_basic(patient_factory):
    patient = patient_factory.create()
    crud.delete(patient)

    assert crud.read(models.PatientOrm, id=patient.id) is None


# delete_by tests


def test_delete_by_basic(patient_factory):
    patient = patient_factory.create(name="Delete Test Name")
    crud.delete_by(models.PatientOrm, name=patient.name)

    assert crud.read(models.PatientOrm, id=patient.id) is None


def test_delete_by_multi():
    with pytest.raises(sqlalchemy.exc.MultipleResultsFound):
        crud.delete_by(models.PatientOrm, sex=SexEnum.FEMALE)


def test_delete_by_none(get_row_count):
    tableSize = get_row_count(models.PatientOrm)

    crud.delete_by(models.PatientOrm, id="Some Fake ID Delete")

    newTableSize = get_row_count(models.PatientOrm)

    assert tableSize == newTableSize


# delete_all tests


def test_delete_all_basic(patient_factory, get_row_count):
    name = "Bulk Delete"
    for _i in range(10):
        patient_factory.create(name=name)

    assert len(crud.read_all(models.PatientOrm, name=name)) == 10
    tableSize = get_row_count(models.PatientOrm)

    crud.delete_all(models.PatientOrm, name=name)

    assert len(crud.read_all(models.PatientOrm, name=name)) == 0
    newTableSize = get_row_count(models.PatientOrm)

    assert tableSize == newTableSize + 10


def test_delete_all_none(get_row_count):
    tableSize = get_row_count(models.PatientOrm)

    crud.delete_all(models.PatientOrm, id="Some Fake ID Delete")

    newTableSize = get_row_count(models.PatientOrm)

    assert tableSize == newTableSize


# find tests


def test_find_basic(patient_factory):
    maxTime = 260
    numPatients = 10
    name = "Find Basic"

    for i in range(numPatients):
        patient_factory.create(date_created=maxTime - i, name=name)

    readSize = len(
        crud.find(
            models.PatientOrm,
            models.PatientOrm.date_created <= maxTime,
            models.PatientOrm.name == name,
        )
    )

    assert readSize == numPatients


def test_find_empty():
    readCount = len(crud.find(models.PatientOrm, models.PatientOrm.date_created < 0))
    assert readCount == 0


# read_all tests


def test_read_all_basic(patient_factory):
    name = "Read All Basic"
    patient = patient_factory.create(name=name)

    foundPatients = crud.read_all(models.PatientOrm, name=name)

    assert len(foundPatients) == 1
    assert foundPatients[0] == patient


def test_read_all_empty():
    foundPatients = crud.read_all(models.PatientOrm, name="Not A Name Used")
    assert len(foundPatients) == 0


def test_read_all_fake_member():
    with pytest.raises(Exception):
        crud.read_all(models.PatientOrm, fake_member="What")


def test_read_all_no_filters(patient_factory):
    patient = patient_factory.create(name="Read All No Filters")

    foundPatients = crud.read_all(models.PatientOrm)

    assert patient in foundPatients


# read_by_filter tests


def test_read_by_filter_basic(patient_factory):
    newPatient = patient_factory.create(date_created=0)

    foundPatient = crud.read_by_filter(
        models.PatientOrm, models.PatientOrm.date_created <= 10
    )

    assert foundPatient == newPatient


def test_read_by_filter_empty():
    foundPatient = crud.read_by_filter(
        models.PatientOrm, models.PatientOrm.date_created <= 10
    )
    assert foundPatient is None


def test_read_by_filter_many():
    with pytest.raises(sqlalchemy.exc.MultipleResultsFound):
        crud.read_by_filter(models.PatientOrm, models.PatientOrm.date_created >= 0)
