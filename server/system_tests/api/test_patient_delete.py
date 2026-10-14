import time

import pytest
from humps import decamelize

import data.db_operations as crud
from data import orm_serializer
from enums import SexEnum
from models import (
    DeletedPatientOrm,
    PatientAssociationsOrm,
    PatientOrm,
    PatientSchema,
    ReadingOrm,
)


@pytest.fixture
def create_patient_with_reading(database, patient_info, reading):
    """
    Creates a patient with one reading. Uses crud directly instead of the factories,
    since the factories would try to delete the rows again after the test, and these
    tests delete them through the API. The test database is cleaned up after the test.
    """

    def f():
        crud.create_model(patient_info, PatientSchema)
        crud.create(
            orm_serializer.unmarshal(
                ReadingOrm, {**reading, "date_taken": 1594514397, "user_id": 1}
            )
        )

    yield f

    # Remove whatever the test left behind. CI doesn't empty the database between
    # tests, and this also ends the session's open transaction.
    patient = crud.read(PatientOrm, id=patient_info["id"])
    if patient is not None:
        database.session.delete(patient)
    deleted_patient = crud.read(DeletedPatientOrm, patient_id=patient_info["id"])
    if deleted_patient is not None:
        database.session.delete(deleted_patient)
    database.session.commit()


def test_admin_can_delete_patient(
    create_patient_with_reading, patient_id, reading_id, database, api_delete
):
    create_patient_with_reading()

    response = api_delete(endpoint=f"/api/patients/{patient_id}")
    database.session.commit()

    assert response.status_code == 200
    assert crud.read(PatientOrm, id=patient_id) is None
    # Related data is deleted along with the patient
    assert crud.read(ReadingOrm, id=reading_id) is None
    # The deletion is recorded so sync can tell mobile devices
    deleted_patient = crud.read(DeletedPatientOrm, patient_id=patient_id)
    assert deleted_patient is not None
    assert deleted_patient.deleted_by is not None


@pytest.mark.parametrize(
    "credentials",
    [
        ("hcw@email.com", "cradle-hcw"),
        ("cho@email.com", "cradle-cho"),
        ("vht@email.com", "cradle-vht"),
    ],
)
def test_non_admin_cannot_delete_patient(
    credentials, create_patient_with_reading, patient_id, database, api_delete
):
    create_patient_with_reading()

    response = api_delete(endpoint=f"/api/patients/{patient_id}")
    database.session.commit()

    assert response.status_code == 403
    assert crud.read(PatientOrm, id=patient_id) is not None
    assert crud.read(DeletedPatientOrm, patient_id=patient_id) is None


def test_delete_unknown_patient_returns_404(api_delete):
    response = api_delete(endpoint="/api/patients/99999999999")

    assert response.status_code == 404


def test_sync_returns_patients_deleted_since_last_sync(
    create_patient_with_reading, patient_id, database, api_delete, api_post
):
    create_patient_with_reading()
    api_delete(endpoint=f"/api/patients/{patient_id}")
    database.session.commit()
    deleted_at = crud.read(DeletedPatientOrm, patient_id=patient_id).deleted_at

    # Last synced before the deletion: the device is told to remove the patient
    response = api_post(endpoint=f"/api/sync/patients?since={deleted_at - 1}", json=[])
    assert response.status_code == 200
    assert patient_id in decamelize(response.json())["deleted_patient_ids"]

    # Already synced since the deletion: nothing to remove
    response = api_post(endpoint=f"/api/sync/patients?since={deleted_at}", json=[])
    assert response.status_code == 200
    assert patient_id not in decamelize(response.json())["deleted_patient_ids"]


def test_sync_does_not_recreate_deleted_patient(
    create_patient_with_reading,
    patient_id,
    patient_info,
    database,
    api_delete,
    api_post,
):
    create_patient_with_reading()
    api_delete(endpoint=f"/api/patients/{patient_id}")
    database.session.commit()

    # A device that still has the patient uploads an offline edit
    last_sync = int(time.time()) - 1
    mobile_patient = {
        "id": patient_id,
        "name": "Edited Offline",
        "sex": SexEnum.FEMALE.value,
        "date_of_birth": patient_info["date_of_birth"],
        "is_exact_date_of_birth": False,
        "last_edited": last_sync + 1,
    }
    response = api_post(
        endpoint=f"/api/sync/patients?since={last_sync}", json=[mobile_patient]
    )
    database.session.commit()

    assert response.status_code == 200
    assert crud.read(PatientOrm, id=patient_id) is None
    assert crud.read(PatientAssociationsOrm, patient_id=patient_id) is None


def test_sync_skips_readings_for_deleted_patient(
    create_patient_with_reading, patient_id, database, api_delete, api_post
):
    create_patient_with_reading()
    api_delete(endpoint=f"/api/patients/{patient_id}")
    database.session.commit()

    mobile_reading_id = "c1d2e3f4-0000-4000-8000-000000000001"
    mobile_reading = {
        "id": mobile_reading_id,
        "patient_id": patient_id,
        "systolic_blood_pressure": 120,
        "diastolic_blood_pressure": 80,
        "heart_rate": 70,
        "symptoms": [],
    }
    last_sync = int(time.time()) - 1
    response = api_post(
        endpoint=f"/api/sync/readings?since={last_sync}", json=[mobile_reading]
    )
    database.session.commit()

    assert response.status_code == 200
    assert crud.read(ReadingOrm, id=mobile_reading_id) is None
