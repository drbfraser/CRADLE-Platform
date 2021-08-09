import time

import data.crud as crud
from models import (
    Patient,
    PatientAssociations,
    Reading,
    Pregnancy,
    MedicalRecord,
    SexEnum,
    GestationalAgeUnitEnum,
    TrafficLightEnum,
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

    patient = None
    for p in response.json():
        if p["patientId"] == patient_info["patientId"]:
            patient = p
            break

    assert patient["dob"] == patient_info["dob"]
    assert patient["pregnancyId"] == pregnancy_later["id"]
    assert patient["pregnancyStartDate"] == pregnancy_later["startDate"]
    assert patient["medicalHistoryId"] == medical_record["id"]
    assert patient["medicalHistory"] == medical_record["information"]
    assert patient["drugHistoryId"] == drug_record["id"]
    assert patient["drugHistory"] == drug_record["information"]


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
    followup_factory.create(readingId=reading_id)

    response = api_get(endpoint="/api/mobile/readings")

    assert response.status_code == 200
    assert any(
        r["patientId"] == patient_info["patientId"]
        and r["readingId"] == reading_id
        and r["referral"]["readingId"] == reading_id
        and r["followup"]["readingId"] == reading_id
        for r in response.json()
    )


def test_sync_patients(
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
    # Case 1: new patients created on server and on Android
    last_sync = int(time.time()) - 1

    server_patient_id = patient_info["patientId"]
    create_patient()

    mobile_patient_id = "80259047727"
    mobile_patient = {
        "patientId": mobile_patient_id,
        "patientName": "Ava Jones",
        "patientSex": SexEnum.FEMALE.value,
        "dob": "2000-01-01",
        "isExactDob": False,
        "pregnancyStartDate": last_sync - 2e7,
        "gestationalAgeUnit": GestationalAgeUnitEnum.WEEKS.value,
        "medicalHistory": "Gestational diabetes",
        "drugHistory": "Aspirin 162mg daily",
        "lastEdited": last_sync + 1,
    }

    try:
        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}", json=[mobile_patient]
        )
        database.session.commit()

        assert response.status_code == 200
        assert response.json()["total"] >= 2

        new_server_patient = None
        for p in response.json()["patients"]:
            if p["patientId"] == server_patient_id:
                new_server_patient = p
                break

        assert new_server_patient["patientName"] == patient_info["patientName"]
        assert new_server_patient["dob"] == patient_info["dob"]

        new_mobile_patient = None
        for p in response.json()["patients"]:
            if p["patientId"] == mobile_patient_id:
                new_mobile_patient = p
                break

        assert new_mobile_patient["patientName"] == mobile_patient["patientName"]
        assert new_mobile_patient["dob"] == mobile_patient["dob"]
        assert (
            new_mobile_patient["pregnancyStartDate"]
            == mobile_patient["pregnancyStartDate"]
        )
        assert new_mobile_patient["medicalHistory"] == mobile_patient["medicalHistory"]
        assert new_mobile_patient["drugHistory"] == mobile_patient["drugHistory"]

        association = crud.read(PatientAssociations, patientId=mobile_patient_id)
        assert association is not None

        # Case 2: patient edited offline on Android
        mobile_patient = new_mobile_patient
        last_sync = int(time.time())
        time.sleep(1)

        mobile_patient.update(
            {
                "patientName": "Eva Jones",
                "pregnancyStartDate": last_sync + 2,
                "pregnancyEndDate": last_sync + 1,
                "pregnancyOutcome": "SVD - baby weighed 2.53kg",
                "medicalHistory": "Pregnancy induced hypertension",
                "medicalLastEdited": last_sync + 2,
                "drugHistory": "Labetalol 212mg three times daily",
                "drugLastEdited": last_sync + 2,
                "lastEdited": last_sync + 2,
            }
        )

        response = api_post(
            endpoint=f"/api/sync/patients?since={last_sync}", json=[mobile_patient]
        )
        database.session.commit()

        assert response.status_code == 200
        assert response.json()["total"] >= 1

        new_mobile_patient = None
        for p in response.json()["patients"]:
            if p["patientId"] == mobile_patient_id:
                new_mobile_patient = p
                break

        assert new_mobile_patient["patientName"] == mobile_patient["patientName"]
        assert new_mobile_patient["dob"] == mobile_patient["dob"]
        assert (
            new_mobile_patient["pregnancyStartDate"]
            == mobile_patient["pregnancyStartDate"]
        )
        assert new_mobile_patient["medicalHistory"] == mobile_patient["medicalHistory"]
        assert new_mobile_patient["drugHistory"] == mobile_patient["drugHistory"]

        updated_pregnancy = crud.read(Pregnancy, id=mobile_patient["pregnancyId"])
        assert updated_pregnancy.endDate == mobile_patient["pregnancyEndDate"]
        assert updated_pregnancy.outcome == mobile_patient["pregnancyOutcome"]

        # Case 3: patient edited on server
        last_sync = int(time.time())
        time.sleep(1)

        info = {"villageNumber": "2722"}
        crud.update(Patient, info, patientId=server_patient_id)
        pregnancy_factory.create(**pregnancy_later)
        medical_record_factory.create(**medical_record)
        medical_record_factory.create(**drug_record)

        response = api_post(endpoint=f"/api/sync/patients?since={last_sync}")
        database.session.commit()

        assert response.status_code == 200
        assert response.json()["total"] >= 1

        new_server_patient = None
        for p in response.json()["patients"]:
            if p["patientId"] == server_patient_id:
                new_server_patient = p
                break

        assert new_server_patient["villageNumber"] == info["villageNumber"]
        assert new_server_patient["pregnancyStartDate"] == pregnancy_later["startDate"]
        assert new_server_patient["medicalHistory"] == medical_record["information"]
        assert new_server_patient["drugHistory"] == drug_record["information"]

    finally:
        crud.delete_all(Pregnancy, patientId=mobile_patient_id)
        crud.delete_all(MedicalRecord, patientId=mobile_patient_id)
        crud.delete_all(PatientAssociations, patientId=mobile_patient_id)
        crud.delete_by(Patient, patientId=mobile_patient_id)


def test_sync_readings(
    create_patient,
    create_reading_with_referral,
    patient_id,
    reading_id,
    followup_factory,
    database,
    api_post,
):
    create_patient()
    create_reading_with_referral()
    followup_factory.create(readingId=reading_id)

    since = 1624504714
    mobile_reading_id = "w2d0aklrs4wenm6hk5z1"
    mobile_reading = {
        "readingId": mobile_reading_id,
        "patientId": patient_id,
        "bpSystolic": 113,
        "bpDiastolic": 97,
        "heartRateBPM": 61,
        "symptoms": [],
    }

    try:
        response = api_post(
            endpoint=f"/api/sync/readings?since={since}", json=[mobile_reading]
        )

        assert response.status_code == 200
        assert response.json()["total"] >= 2

        assert any(
            r["patientId"] == patient_id
            and r["readingId"] == reading_id
            and r["trafficLightStatus"] == TrafficLightEnum.YELLOW_UP.value
            and r["referral"]["readingId"] == reading_id
            and r["followup"]["readingId"] == reading_id
            for r in response.json()["readings"]
        )

        assert any(
            r["patientId"] == patient_id
            and r["readingId"] == mobile_reading["readingId"]
            and r["bpSystolic"] == mobile_reading["bpSystolic"]
            and r["bpDiastolic"] == mobile_reading["bpDiastolic"]
            and r["heartRateBPM"] == mobile_reading["heartRateBPM"]
            for r in response.json()["readings"]
        )

    finally:
        database.session.commit()
        crud.delete_by(Reading, readingId=mobile_reading_id)
