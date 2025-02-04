from humps import decamelize

from common.print_utils import pretty_print
from data import crud
from models import MedicalRecordOrm


def test_get_record(create_patient, medical_record_factory, medical_record, api_get):
    create_patient()
    medical_record_factory.create(**medical_record)

    record_id = medical_record["id"]
    response = api_get(endpoint=f"/api/medical_records/{record_id}")

    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 200
    assert response_body["medical_history"] == medical_record["information"]


def test_put_record(create_patient, medical_record_factory, drug_record, api_put):
    create_patient()
    medical_record_factory.create(**drug_record)

    record_id = drug_record["id"]
    info = "Labetalol 200mg three times daily."
    response = api_put(
        endpoint=f"/api/medical_records/{record_id}",
        json={
            "id": drug_record["id"],
            "patient_id": drug_record["patient_id"],
            "information": info,
            "is_drug_record": True,
        },
    )
    new_record = crud.read(MedicalRecordOrm, id=record_id)

    response_body = decamelize(response.json())
    pretty_print(response_body)
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

    record = {
        "id": record_id,
        "patient_id": medical_record["patient_id"],
        "information": medical_record["information"],
        "is_drug_record": False,
    }
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/medical_records",
        json=record,
    )

    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 201

    new_record = crud.read(MedicalRecordOrm, id=record_id)
    assert new_record is not None
    assert new_record.patient_id == patient_id
    assert new_record.information == record["information"]
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
    pretty_print(response_body)
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
        json={
            "patient_id": "0",
            "information": drug_record["information"],
            "is_drug_record": True,
        },
    )

    response_body = decamelize(response.json())
    pretty_print(response_body)
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

    # Missing `patient_id` field.
    response = api_post(
        endpoint=f"/api/patients/{patient_id}/medical_records",
        json={
            "information": "Aspirin 75mg",
            "is_drug_record": True,
        },
    )

    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 422


def test_record_conflict_not_created(
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
        json={
            "id": drug_record["id"],
            "patient_id": drug_record["patient_id"],
            "information": "Aspirin 75mg",
            "is_drug_record": True,
        },
    )

    response_body = decamelize(response.json())
    pretty_print(response_body)
    assert response.status_code == 409
