from flask import Response
from humps import decamelize

from data import crud
from models import MedicalRecordOrm


def test_get_record(create_patient, medical_record_factory, medical_record, api_get):
    create_patient()
    medical_record_factory.create(**medical_record)

    record_id = medical_record["id"]
    response = api_get(endpoint=f"/api/medical_records/{record_id}")

    assert response.status_code == 200
    response_body = decamelize(response.json())
    assert response_body["medical_history"] == medical_record["information"]


def test_put_record(create_patient, medical_record_factory, drug_record, api_put):
    create_patient()
    medical_record_factory.create(**drug_record)

    record_id = drug_record["id"]
    info = "Labetalol 200mg three times daily."
    response: Response = api_put(
        endpoint=f"/api/medical_records/{record_id}",
        json={"drug_history": info},
    )
    new_record = crud.read(MedicalRecordOrm, id=record_id)

    assert response.status_code == 200
    assert new_record is not None
    assert new_record.information == info
    assert new_record.is_drug_record


def test_post_and_delete_record(
    create_patient,
    patient_id,
    medical_record,
    database,
    api_post,
    api_delete,
):
    create_patient()
    record_id = medical_record["id"]

    record = {"id": record_id, "medical_history": medical_record["information"]}
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/medical_records",
        json=record,
    )

    new_record = crud.read(MedicalRecordOrm, id=record_id)

    assert response.status_code == 201
    assert new_record.patient_id == patient_id
    assert new_record.information == record["medical_history"]
    assert not new_record.is_drug_record

    response = api_delete(endpoint=f"/api/medical_records/{record_id}")
    database.session.commit()

    assert response.status_code == 200
    assert crud.read(MedicalRecordOrm, id=record_id) is None


def test_get_record_lists(
    create_patient,
    medical_record_factory,
    patient_id,
    medical_record,
    drug_record,
    api_get,
):
    create_patient()
    medical_record_factory.create(**medical_record)
    medical_record_factory.create(**drug_record)

    response = api_get(endpoint=f"/api/patients/{patient_id}/medical_records")
    response_body = decamelize(response.json())

    assert response.status_code == 200
    assert len(response_body["medical"]) >= 1
    assert len(response_body["drug"]) >= 1


def test_invalid_record_not_updated(
    create_patient,
    medical_record_factory,
    drug_record,
    api_put,
):
    create_patient()
    medical_record_factory.create(**drug_record)

    record_id = drug_record["id"]
    response = api_put(
        endpoint=f"/api/medical_records/{record_id}",
        json={"patient_id": "0"},
    )

    record = crud.read(MedicalRecordOrm, id=record_id)
    assert record is not None
    assert response.status_code == 400
    assert record.patient_id == drug_record["patient_id"]


def test_invalid_record_not_created(
    create_patient,
    medical_record_factory,
    patient_id,
    drug_record,
    api_post,
):
    create_patient()
    medical_record_factory.create(**drug_record)

    response = api_post(
        endpoint=f"/api/patients/{patient_id}/medical_records",
        json={"id": drug_record["id"], "drug_history": "Aspirin 75mg"},
    )

    assert response.status_code == 409
