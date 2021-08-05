import data.crud as crud
from models import (
    Patient,
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


def test_sync_patients(create_patient, patient_info, database, api_post):
    create_patient()

    since = 1624504714
    mobile_patient_id = "80259047727"
    mobile_patient = {
        "patientId": mobile_patient_id,
        "patientName": "Ava Jones",
        "patientSex": SexEnum.FEMALE.value,
        "dob": "2000-01-01",
        "isExactDob": False,
        "pregnancyStartDate": since - 3e6,
        "gestationalAgeUnit": GestationalAgeUnitEnum.WEEKS.value,
        "medicalHistory": "Gestational diabetes",
        "drugHistory": "Aspirin 162mg daily",
        "lastEdited": since + 3e6,
    }

    try:
        response = api_post(
            endpoint=f"/api/sync/patients?since={since}", json=[mobile_patient]
        )

        assert response.status_code == 200
        assert response.json()["total"] >= 2

        new_patient_server = None
        for p in response.json()["patients"]:
            if p["patientId"] == patient_info["patientId"]:
                new_patient_server = p
                break

        assert new_patient_server["patientName"] == patient_info["patientName"]
        assert new_patient_server["dob"] == patient_info["dob"]

        new_patient_mobile = None
        for p in response.json()["patients"]:
            if p["patientId"] == mobile_patient_id:
                new_patient_mobile = p
                break

        assert new_patient_mobile["patientName"] == mobile_patient["patientName"]
        assert new_patient_mobile["dob"] == mobile_patient["dob"]
        assert (
            new_patient_mobile["pregnancyStartDate"]
            == mobile_patient["pregnancyStartDate"]
        )
        assert new_patient_mobile["medicalHistory"] == mobile_patient["medicalHistory"]
        assert new_patient_mobile["drugHistory"] == mobile_patient["drugHistory"]

    finally:
        database.session.commit()
        crud.delete_by(Pregnancy, patientId=mobile_patient_id)
        crud.delete_by(MedicalRecord, patientId=mobile_patient_id, isDrugRecord=False)
        crud.delete_by(MedicalRecord, patientId=mobile_patient_id, isDrugRecord=True)
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
