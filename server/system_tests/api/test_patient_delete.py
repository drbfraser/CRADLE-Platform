import pytest

import data.db_operations as crud
from data import orm_serializer
from models import DeletedPatientOrm, PatientOrm, PatientSchema, ReadingOrm


@pytest.fixture
def create_patient_with_reading(database, patient_info, reading):
    """
    Creates a patient with one reading. Uses crud directly instead of the factories,
    since the factories would try to delete the rows again after the test, and these
    tests delete them through the API. The test database is emptied after each test.
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
