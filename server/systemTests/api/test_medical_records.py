import data.crud as crud
from models import MedicalRecord


def test_get_record(create_patient, medical_record_factory, medical_record, api_get):
    create_patient()
    medical_record_factory.create(**medical_record)

    record_id = medical_record["id"]
    response = api_get(endpoint=f"/api/medical_records/{record_id}")

    assert response.status_code == 200
    assert response.json()["medicalHistory"] == medical_record["information"]


def test_put_record(create_patient, medical_record_factory, drug_record, api_put):
    create_patient()
    medical_record_factory.create(**drug_record)

    record_id = drug_record["id"]
    info = "Labetalol 200mg three times daily."
    response = api_put(
        endpoint=f"/api/medical_records/{record_id}",
        json={"drugHistory": info},
    )

    new_record = crud.read(MedicalRecord, id=record_id)

    assert response.status_code == 200
    assert new_record.information == info
    assert new_record.isDrugRecord


def test_post_and_delete_record(
    create_patient, patient_id, medical_record, database, api_post, api_delete
):
    create_patient()
    record_id = medical_record["id"]

    record = {"id": record_id, "medicalHistory": medical_record["information"]}
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/medical_records",
        json=record,
    )

    new_record = crud.read(MedicalRecord, id=record_id)

    assert response.status_code == 201
    assert new_record.patientId == patient_id
    assert new_record.information == record["medicalHistory"]
    assert not new_record.isDrugRecord

    response = api_delete(endpoint=f"/api/medical_records/{record_id}")
    database.session.commit()

    assert response.status_code == 200
    assert crud.read(MedicalRecord, id=record_id) is None


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

    assert response.status_code == 200
    assert len(response.json()["medical"]) >= 1
    assert len(response.json()["drug"]) >= 1


def test_invalid_record_not_updated(
    create_patient, medical_record_factory, drug_record, api_put
):
    create_patient()
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
    create_patient, medical_record_factory, patient_id, drug_record, api_post
):
    create_patient()
    medical_record_factory.create(**drug_record)

    response = api_post(
        endpoint=f"/api/patients/{patient_id}/medical_records",
        json={"id": drug_record["id"], "drugHistory": "Aspirin 75mg"},
    )

    assert response.status_code == 409
