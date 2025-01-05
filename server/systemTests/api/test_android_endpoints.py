import time

import pytest
from humps import decamelize

from data import crud
from enums import SexEnum, TrafficLightEnum
from models import (
    MedicalRecordOrm,
    PatientAssociationsOrm,
    PatientOrm,
    PregnancyOrm,
    PregnancySchema,
    ReadingOrm,
)


def test_download_patients(
    create_patient,
    pregnancy_factory,
    medical_record_factory,
    patient_info,
    pregnancy_earlier,
    pregnancy_later,
    medical_record,
    drug_record,
    api_get,
):
    create_patient()
    pregnancy_factory.create(**pregnancy_earlier)
    pregnancy_factory.create(**pregnancy_later)
    medical_record_factory.create(**medical_record)
    medical_record_factory.create(**drug_record)

    response = api_get(endpoint="/api/mobile/patients")

    assert response.status_code == 200

    response_body = decamelize(response.json())

    patient = None
    for p in response_body:
        if p["id"] == patient_info["id"]:
            patient = p
            break

    assert patient is not None
    assert patient["date_of_birth"] == patient_info["date_of_birth"]
    assert patient["pregnancy_id"] == pregnancy_later["id"]
    assert patient["pregnancy_start_date"] == pregnancy_later["start_date"]
    assert patient["medical_history_id"] == medical_record["id"]
    assert patient["medical_history"] == medical_record["information"]
    assert patient["drug_history_id"] == drug_record["id"]
    assert patient["drug_history"] == drug_record["information"]


def test_download_readings(
    create_patient,
    create_reading_with_referral,
    followup_factory,
    patient_info,
    reading_id,
    api_get,
):
    create_patient()
    create_reading_with_referral()
    followup_factory.create(patient_id=patient_info["id"])

    response = api_get(endpoint="/api/mobile/readings")

    response_body = decamelize(response.json())

    assert response.status_code == 200
    assert any(
        reading["patient_id"] == patient_info["id"] and reading["id"] == reading_id
        for reading in response_body
    )


def test_sync_patients_fully_successful(
    create_patient,
    pregnancy_factory,
    medical_record_factory,
    patient_info,
    pregnancy_later,
    medical_record,
    drug_record,
    database,
    api_post,
):
    # Case 1: New patients created on server and on Android
    last_sync = int(time.time()) - 1

    server_patient_id = patient_info["id"]
    create_patient()

    mobile_patient_id = "80259047727"
    mobile_patient = {
        "id": mobile_patient_id,
        "name": "Ava Jones",
        "sex": SexEnum.FEMALE.value,
        "date_of_birth": "2000-01-01",
        "is_exact_date_of_birth": False,
        "pregnancy_start_date": last_sync - 2e7,
        "medical_history": "Gestational diabetes",
        "drug_history": "Aspirin 162mg daily",
        "last_edited": last_sync + 1,
    }

    try:
        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}",
            json={"patients": [mobile_patient]},
        )
        database.session.commit()

        response_body = decamelize(response.json())
        assert response.status_code == 200
        assert len(response_body["patients"]) == 2

        new_server_patient = None
        for p in response_body["patients"]:
            if p["id"] == server_patient_id:
                new_server_patient = p
                break

        assert new_server_patient is not None
        assert new_server_patient["name"] == patient_info["name"]
        assert new_server_patient["date_of_birth"] == patient_info["date_of_birth"]

        synced_patient = None
        for p in response_body["patients"]:
            if p["id"] == mobile_patient_id:
                synced_patient = p
                break

        assert synced_patient is not None
        assert synced_patient["name"] == mobile_patient["name"]
        assert synced_patient["date_of_birth"] == mobile_patient["date_of_birth"]
        assert (
            synced_patient["pregnancy_start_date"]
            == mobile_patient["pregnancy_start_date"]
        )
        assert synced_patient["medical_history"] == mobile_patient["medical_history"]
        assert synced_patient["drug_history"] == mobile_patient["drug_history"]
        assert (
            crud.read(PatientAssociationsOrm, patient_id=mobile_patient_id) is not None
        )

        mobile_patient = synced_patient
        last_sync = int(time.time())
        time.sleep(1)

        # Case 2: Patient edited offline on Android including patient name, previous pregnancy,
        # new pregnancy, medical history, and drug history
        mobile_patient.update(
            {
                "name": "Eva Jones",
                "pregnancy_start_date": last_sync + 1,
                "pregnancy_end_date": last_sync,
                "pregnancy_outcome": "SVD - baby weighed 2.53kg",
                "medical_history": "Pregnancy induced hypertension",
                "medical_last_edited": last_sync + 1,
                "drug_history": "Labetalol 212mg three times daily",
                "drug_last_edited": last_sync + 1,
                "last_edited": last_sync + 1,
            },
        )

        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}",
            json={"patients": [mobile_patient]},
        )
        database.session.commit()

        response_body = decamelize(response.json())

        assert response.status_code == 200
        assert len(response_body["patients"]) == 1

        synced_patient = response_body["patients"][0]
        assert synced_patient is not None
        assert mobile_patient is not None
        assert synced_patient["name"] == mobile_patient["name"]
        assert synced_patient["date_of_birth"] == mobile_patient["date_of_birth"]
        assert (
            synced_patient["pregnancy_start_date"]
            == mobile_patient["pregnancy_start_date"]
        )
        assert synced_patient["medical_history"] == mobile_patient["medical_history"]
        assert synced_patient["drug_history"] == mobile_patient["drug_history"]

        updated_pregnancy = crud.read(PregnancyOrm, id=mobile_patient["pregnancy_id"])
        assert updated_pregnancy is not None
        assert updated_pregnancy.end_date == mobile_patient["pregnancy_end_date"]
        assert updated_pregnancy.outcome == mobile_patient["pregnancy_outcome"]

        last_sync = int(time.time())
        time.sleep(1)

        # Case 3: Patient edited on server
        village_number = "2722"
        crud.update(
            PatientOrm,
            {"village_number": village_number},
            id=server_patient_id,
        )
        pregnancy = pregnancy_factory.create(**pregnancy_later)
        medical_record = medical_record_factory.create(**medical_record)
        drug_record = medical_record_factory.create(**drug_record)

        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}", json={"patients": []}
        )
        database.session.commit()

        response_body = decamelize(response.json())

        assert response.status_code == 200
        assert len(response_body["patients"]) == 1

        new_server_patient = response_body["patients"][0]
        assert new_server_patient["village_number"] == village_number
        assert new_server_patient["pregnancy_start_date"] == pregnancy.start_date
        assert new_server_patient["medical_history"] == medical_record.information
        assert new_server_patient["drug_history"] == drug_record.information

        server_patient = new_server_patient
        last_sync = int(time.time())
        time.sleep(1)

        # Case 4: Patient edited both on server and offline on Android - Server data override
        # Android data
        village_number = "3722"
        end_date = pregnancy.start_date + 2.3e7
        crud.update(
            PatientOrm,
            {"village_number": village_number},
            id=server_patient_id,
        )
        crud.update(PregnancyOrm, {"end_date": end_date}, id=pregnancy.id)
        server_patient["village_number"] = "3000"
        server_patient["pregnancy_end_date"] = end_date + 1
        del server_patient["pregnancy_start_date"]

        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}",
            json={"patients": [server_patient]},
        )
        database.session.commit()

        response_body = decamelize(response.json())

        assert response.status_code == 200
        assert len(response_body["patients"]) == 1

        new_server_patient = response_body["patients"][0]
        assert new_server_patient["village_number"] == village_number

        new_pregnancy = crud.read(PregnancyOrm, id=pregnancy.id)
        assert new_pregnancy is not None
        assert new_pregnancy.end_date == end_date

    finally:
        crud.delete_all(PregnancyOrm, patient_id=mobile_patient_id)
        crud.delete_all(MedicalRecordOrm, patient_id=mobile_patient_id)
        crud.delete_all(PatientAssociationsOrm, patient_id=mobile_patient_id)
        crud.delete_by(PatientOrm, id=mobile_patient_id)


@pytest.mark.skip(
    reason="Changes to validation of endpoints mean that the endpoint will throw an exception if any of the patients have invalid fields."
)
def test_sync_patients_partially_successful(
    create_patient,
    pregnancy_factory,
    pregnancy_earlier,
    pregnancy_later,
    database,
    api_post,
):
    """
    NOTE: Changes to how validation in API endpoints is handled means that the
        sync endpoint will now fail if any of the patients have missing fields,
        so these tests no longer works.
    """
    last_sync = int(time.time()) - 1

    patient1_id = "77694597005"
    patient1 = {
        "id": patient1_id,
        "name": "Ava Jones",
        "sex": SexEnum.FEMALE.value,
        "date_of_birth": "2000-01-01",
        "is_exact_date_of_birth": False,
        "last_edited": last_sync + 1,
    }

    patient2_id = "87694712386"
    patient2 = patient1.copy()
    patient2["id"] = patient2_id

    try:
        # Case 1: Missing required field in patient2 - Only patient1 is added to the database

        del patient2["sex"]

        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}",
            json={"patients": [patient1, patient2]},
        )
        database.session.commit()

        response_body = decamelize(response.json())

        assert response.status_code == 207
        assert len(response_body["patients"]) == 1
        assert response_body["patients"][0]["id"] == patient1_id
        assert response_body["errors"][0]["patient_id"] == patient2_id
        assert crud.read(PatientOrm, id=patient1_id) is not None
        assert crud.read(PatientOrm, id=patient2_id) is None

        patient1 = response_body["patients"][0]

        last_sync = int(time.time())
        time.sleep(1)

        # Case 2: Invalid value in patient2 - Only patient1 is updated in the database
        history = "Pregnancy induced hypertension"
        patient1.update(
            {"medical_history": history, "medical_last_edited": last_sync + 1}
        )
        patient2.update(
            {
                "sex": "F",
                "medical_history": history,
                "medical_last_edited": last_sync + 1,
            },
        )

        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}",
            json={"patients": [patient1, patient2]},
        )
        database.session.commit()

        response_body = decamelize(response.json())

        assert response.status_code == 207
        assert len(response_body["patients"]) == 1
        assert response_body["patients"][0]["id"] == patient1_id
        assert response_body["errors"][0]["patient_id"] == patient2_id
        assert (
            crud.read(MedicalRecordOrm, patient_id=patient1_id, information=history)
            is not None
        )
        assert crud.read(PatientOrm, id=patient2_id) is None
        assert (
            crud.read(MedicalRecordOrm, patient_id=patient2_id, information=history)
            is None
        )

        last_sync = int(time.time())
        time.sleep(1)

        # Sync corrected patient2
        patient2["sex"] = SexEnum.FEMALE.value

        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}",
            json=[patient2],
        )
        database.session.commit()

        response_body = decamelize(response.json())

        assert response.status_code == 200
        assert len(response_body["patients"]) == 1
        assert response_body["patients"][0]["id"] == patient2_id
        assert crud.read(PatientOrm, id=patient2_id) is not None
        assert (
            crud.read(MedicalRecordOrm, patient_id=patient2_id, information=history)
            is not None
        )

        patient2 = response_body["patients"][0]
        last_sync = int(time.time())
        time.sleep(1)

        # Case 3: Arbitrary editing - Database is not modified
        create_patient()
        pregnancy_another_patient = pregnancy_factory.create(**pregnancy_later)

        pregnancy_id = pregnancy_another_patient.id
        end_date = last_sync + 1
        patient2.update(
            {
                "pregnancy_id": pregnancy_id,
                "pregnancy_end_date": end_date,
            },
        )

        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}",
            json={"patients": [patient2]},
        )
        database.session.commit()

        response_body = decamelize(response.json())

        assert response.status_code == 207
        assert response_body["errors"][0]["patient_id"] == patient2_id
        assert crud.read(PregnancyOrm, id=pregnancy_id, end_date=end_date) is None

        last_sync = int(time.time())
        time.sleep(1)
        del patient2["pregnancy_id"]
        del patient2["pregnancy_end_date"]

        # Case 4: Conflicting pregnancies - Database is not modified
        pregnancy_earlier["patient_id"] = patient2_id
        pregnancy_earlier = crud.create_model(pregnancy_earlier, PregnancySchema)
        start_date = patient2["pregnancy_start_date"] = pregnancy_earlier.end_date - 2e6

        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}",
            json=[patient2],
        )
        database.session.commit()

        response_body = decamelize(response.json())

        assert response.status_code == 207
        assert response_body["errors"][0]["patient_id"] == patient2_id
        assert (
            crud.read(PregnancyOrm, patient_id=patient2_id, start_date=start_date)
            is None
        )

        # Sync patient2 with corrected pregnancy start date
        start_date = patient2["pregnancy_start_date"] = pregnancy_earlier.end_date + 2e6

        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}",
            json={"patients": [patient2]},
        )
        database.session.commit()

        response_body = decamelize(response.json())

        assert response.status_code == 200
        assert len(response_body["patients"]) == 1
        assert response_body["patients"][0]["id"] == patient2_id
        assert (
            crud.read(PregnancyOrm, patient_id=patient2_id, start_date=start_date)
            is not None
        )

    finally:
        crud.delete_all(MedicalRecordOrm, patient_id=patient1_id)
        crud.delete_all(PatientAssociationsOrm, patient_id=patient1_id)
        crud.delete_by(PatientOrm, id=patient1_id)
        crud.delete_all(PregnancyOrm, patient_id=patient2_id)
        crud.delete_all(MedicalRecordOrm, patient_id=patient2_id)
        crud.delete_all(PatientAssociationsOrm, patient_id=patient2_id)
        crud.delete_by(PatientOrm, id=patient2_id)


@pytest.mark.skip(
    reason="TODO crud.read_referrals_and_assessments must be fixed for this test to run",
)
def test_sync_readings(
    create_patient,
    create_reading_with_referral,
    patient_id,
    reading_id,
    followup_factory,
    database,
    api_post,
):
    last_sync = int(time.time()) - 1

    create_patient()
    create_reading_with_referral()
    followup_factory.create(patient_id=patient_id)

    mobile_reading_id = "w2d0aklrs4wenm6hk5z1"
    mobile_reading = {
        "id": mobile_reading_id,
        "patient_id": patient_id,
        "systolic_blood_pressure": 113,
        "diastolic_blood_pressure": 97,
        "heart_rate": 61,
        "symptoms": [],
    }

    try:
        response = api_post(
            endpoint=f"/api/sync/readings?since={last_sync}",
            json={"readings": [mobile_reading]},
        )
        database.session.commit()

        response_body = decamelize(response.json())

        assert response.status_code == 200
        assert len(response_body["readings"]) == 2
        assert any(
            r["patient_id"] == patient_id
            and r["id"] == reading_id
            and r["traffic_light_status"] == TrafficLightEnum.YELLOW_UP.value
            for r in response_body["readings"]
        )
        assert any(
            r["patient_id"] == patient_id
            and r["id"] == mobile_reading["id"]
            and r["systolic_blood_pressure"]
            == mobile_reading["systolic_blood_pressure"]
            and r["diastolic_blood_pressure"]
            == mobile_reading["diastolic_blood_pressure"]
            and r["heart_rate"] == mobile_reading["heart_rate"]
            for r in response_body["readings"]
        )

    finally:
        crud.delete_by(ReadingOrm, id=mobile_reading_id)


def test_get_patient_form(
    create_patient,
    api_get,
):
    create_patient()

    """
    Patient with id 49300028162 and a form associated with them should have been
    created when the test data was seeded.
    """

    response = api_get(endpoint="/api/mobile/forms/87356709247/dc9")
    assert response.status_code == 404
    response = api_get(endpoint="/api/mobile/forms/49300028162/dc9")
    assert response.status_code == 404
    response = api_get(endpoint="/api/mobile/forms/87356709247/dt9")
    assert response.status_code == 404
    response = api_get(endpoint="/api/mobile/forms/49300028162/dt9")
    assert response.status_code == 200
