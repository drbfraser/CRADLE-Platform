import data.crud as crud
from models import MedicalRecord


def test_get_record(medical_record_factory, medical_record, api_get):
    medical_record_factory.create(**medical_record)

    record_id = medical_record["id"]
    response = api_get(endpoint=f"/api/medical_records/{record_id}")

    assert response.status_code == 200

    response_body = response.json()
    del response_body["dateCreated"]
    del response_body["lastEdited"]
    assert response_body == medical_record


def test_put_record(medical_record_factory, drug_record, api_put):
    medical_record_factory.create(**drug_record)

    record_id = drug_record["id"]
    info = "Labetalol 200mg three times daily."
    response = api_put(
        endpoint=f"/api/medical_records/{record_id}",
        json={"information": info},
    )

    new_record = crud.read(MedicalRecord, id=record_id)

    assert response.status_code == 200
    assert new_record.information == info


def test_post_record(patient_id, drug_record, api_post):
    try:
        response = api_post(
            endpoint=f"/api/patients/{patient_id}/medical_records",
            json=drug_record,
        )

        record_id = drug_record["id"]
        new_record = crud.read(MedicalRecord, id=record_id)

        assert response.status_code == 201
        assert new_record.patientId == patient_id
        assert new_record.information == drug_record["information"]

    finally:
        crud.delete_by(MedicalRecord, id=record_id)


def test_get_record_lists(
    medical_record_factory, patient_id, medical_record, drug_record, api_get
):
    medical_record_factory.create(**medical_record)
    medical_record_factory.create(**drug_record)

    response = api_get(
        endpoint=f"/api/patients/{patient_id}/medical_records",
    )

    assert response.status_code == 200
    assert len(response.json()["medical"]) >= 1
    assert len(response.json()["drug"]) >= 1


def test_invalid_record_not_updated(medical_record_factory, drug_record, api_put):
    medical_record_factory.create(**drug_record)

    record_id = drug_record["id"]
    response = api_put(
        endpoint=f"/api/medical_records/{record_id}",
        json={"patientId": "0"},
    )

    record = crud.read(MedicalRecord, id=record_id)

    assert response.status_code == 400
    assert record.patientId == drug_record["patientId"]


def test_invalid_record_not_created(
    medical_record_factory, patient_id, drug_record, api_post
):
    medical_record_factory.create(**drug_record)

    response = api_post(
        endpoint=f"/api/patients/{patient_id}/medical_records",
        json=drug_record,
    )

    assert response.status_code == 409
