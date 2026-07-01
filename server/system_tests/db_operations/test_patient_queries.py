import pytest

import data.db_operations as crud
import models

PATIENT_ID = "49300028162"
VHT_USER_ID = 3
CHO_USER_ID = 4


# read_patient_list tests


def test_read_patient_list_basic():
    patients = crud.read_patient_list(user_id=VHT_USER_ID)

    assert [p.id for p in patients] == [PATIENT_ID]


def test_read_patient_list_search(patient_factory):
    patient = patient_factory.create(
        id="patient-list-search",
        name="Search Match",
        village_number="999",
    )

    patients = crud.read_patient_list(search="Search Match")

    assert [p.id for p in patients] == [patient.id]


def test_read_patient_list_cho_filter():
    patients = crud.read_patient_list(user_id=CHO_USER_ID, is_cho=True)

    assert [p.id for p in patients] == [PATIENT_ID]


# read_admin_patient tests


def test_read_admin_patient_basic(patient_factory):
    patient_factory.create(id="archived-patient", name="Archived", is_archived=True)

    patients = crud.read_admin_patient()

    assert "archived-patient" not in [p.id for p in patients]


def test_read_admin_patient_include_archived(patient_factory):
    patient_factory.create(id="archived-patient", name="Archived", is_archived=True)

    patients = crud.read_admin_patient(include_archived=True)

    assert "archived-patient" in [p.id for p in patients]


# read_medical_records tests


def test_read_medical_records_basic():
    records = crud.read_medical_records(
        models.MedicalRecordOrm,
        PATIENT_ID,
        is_drug_record=False,
    )

    assert len(records) == 1
    assert records[0].is_drug_record is False


def test_read_medical_records_search_text(patient_factory, medical_record_factory):
    patient = patient_factory.create(id="medical-record-search-patient")
    matching_record = medical_record_factory.create(
        patient_id=patient.id,
        information="Unique medical search text",
        is_drug_record=False,
        date_created=100,
    )
    medical_record_factory.create(
        patient_id=patient.id,
        information="Different medical history",
        is_drug_record=False,
        date_created=200,
    )

    records = crud.read_medical_records(
        models.MedicalRecordOrm,
        patient.id,
        search_text="Unique medical search",
        is_drug_record=False,
    )

    assert [record.id for record in records] == [matching_record.id]


def test_read_medical_records_limit(patient_factory, medical_record_factory):
    patient = patient_factory.create(id="medical-record-limit-patient")
    medical_record_factory.create(
        patient_id=patient.id,
        information="Older medical history",
        is_drug_record=False,
        date_created=100,
    )
    latest_record = medical_record_factory.create(
        patient_id=patient.id,
        information="Latest medical history",
        is_drug_record=False,
        date_created=200,
    )

    records = crud.read_medical_records(
        models.MedicalRecordOrm,
        patient.id,
        direction="DESC",
        limit="1",
        page="1",
    )

    assert [record.id for record in records] == [latest_record.id]


def test_read_medical_records_pregnancy_search(patient_factory, pregnancy_factory):
    patient = patient_factory.create(id="pregnancy-search-patient")
    matching_pregnancy = pregnancy_factory.create(
        patient_id=patient.id,
        start_date=100,
        end_date=200,
        outcome="Unique pregnancy outcome",
    )
    pregnancy_factory.create(
        patient_id=patient.id,
        start_date=300,
        end_date=400,
        outcome="Different pregnancy outcome",
    )

    records = crud.read_medical_records(
        models.PregnancyOrm,
        patient.id,
        search_text="Unique pregnancy",
    )

    assert [record.id for record in records] == [matching_pregnancy.id]


def test_read_medical_records_bad_direction():
    with pytest.raises(ValueError):
        crud.read_medical_records(
            models.MedicalRecordOrm,
            PATIENT_ID,
            direction="SIDEWAYS",
        )


# read_patient_current_medical_record tests


def test_read_current_medical_record(patient_factory, medical_record_factory):
    patient = patient_factory.create(id="current-medical-record-patient")
    medical_record_factory.create(
        patient_id=patient.id,
        information="Older current record",
        is_drug_record=False,
        date_created=100,
    )
    latest_record = medical_record_factory.create(
        patient_id=patient.id,
        information="Latest current record",
        is_drug_record=False,
        date_created=200,
    )

    record = crud.read_patient_current_medical_record(
        patient.id,
        is_drug_record=False,
    )

    assert record.id == latest_record.id


# read_patient_timeline tests


def test_read_patient_timeline():
    timeline = crud.read_patient_timeline(PATIENT_ID)

    titles = [row.title for row in timeline]

    assert "Updated medical history" in titles
    assert "Updated drug history" in titles


def test_read_patient_timeline_limit():
    timeline = crud.read_patient_timeline(
        PATIENT_ID,
        limit="1",
        page="1",
    )

    assert len(timeline) == 1


# read_patient_all_records tests


def test_read_patient_all_records_selected_types(followup_factory):
    followup_factory.create(
        id="test-assessment-selected-record",
        patient_id=PATIENT_ID,
        date_assessed=1700000000,
    )

    records = crud.read_patient_all_records(
        PATIENT_ID,
        readings=True,
        referrals=True,
        assessments=True,
        forms=True,
    )

    assert any(isinstance(record, models.ReadingOrm) for record in records)
    assert any(isinstance(record, models.ReferralOrm) for record in records)
    assert any(isinstance(record, models.AssessmentOrm) for record in records)
    assert any(isinstance(record, models.FormSubmissionOrmV2) for record in records)


def test_read_patient_all_records_order(
    patient_factory,
    reading_factory,
    referral_factory,
    followup_factory,
):
    patient = patient_factory.create(id="all-records-order-patient")
    assessment = followup_factory.create(
        id="all-records-order-assessment",
        patient_id=patient.id,
        date_assessed=100,
    )
    referral = referral_factory.create(
        id="all-records-order-referral",
        patient_id=patient.id,
        date_referred=200,
    )
    reading = reading_factory.create(
        id="all-records-order-reading",
        patient_id=patient.id,
        date_taken=300,
    )

    records = crud.read_patient_all_records(
        patient.id,
        readings=True,
        referrals=True,
        assessments=True,
    )

    assert [record.id for record in records] == [
        reading.id,
        referral.id,
        assessment.id,
    ]


# read_patients tests


def test_read_patients_basic():
    patient = crud.read_patients(patient_id=PATIENT_ID)

    assert patient.patient_id == PATIENT_ID
    assert patient.medical_history is not None
    assert patient.drug_history is not None


def test_read_patients_user_filter():
    patients = crud.read_patients(user_id=VHT_USER_ID)

    assert [p.patient_id for p in patients] == [PATIENT_ID]


def test_read_patients_latest_records(
    patient_factory,
    pregnancy_factory,
    medical_record_factory,
):
    patient = patient_factory.create(id="latest-records-patient")
    older_pregnancy = pregnancy_factory.create(
        patient_id=patient.id,
        start_date=100,
    )

    latest_pregnancy = pregnancy_factory.create(
        patient_id=patient.id,
        start_date=200,
    )

    medical_record_factory.create(
        patient_id=patient.id,
        information="Older medical history",
        is_drug_record=False,
        date_created=100,
    )
    latest_medical_record = medical_record_factory.create(
        patient_id=patient.id,
        information="Latest medical history",
        is_drug_record=False,
        date_created=200,
    )
    medical_record_factory.create(
        patient_id=patient.id,
        information="Older drug history",
        is_drug_record=True,
        date_created=100,
    )
    latest_drug_record = medical_record_factory.create(
        patient_id=patient.id,
        information="Latest drug history",
        is_drug_record=True,
        date_created=200,
    )

    result = crud.read_patients(patient_id=patient.id)

    assert result.pregnancy_id == latest_pregnancy.id
    assert result.pregnancy_id != older_pregnancy.id
    assert result.medical_history_id == latest_medical_record.id
    assert result.drug_history_id == latest_drug_record.id


def test_read_patients_last_edited_closed_pregnancy(
    patient_factory,
    pregnancy_factory,
):
    patient = patient_factory.create(
        id="closed-pregnancy-patient",
        last_edited=100,
    )
    pregnancy_factory.create(
        patient_id=patient.id,
        start_date=100,
        end_date=200,
        outcome="Delivered",
        last_edited=500,
    )

    patients = crud.read_patients(last_edited=400)

    assert patient.id in [p.patient_id for p in patients]


# read_readings tests


def test_read_readings_basic():
    rows = crud.read_readings(patient_id=PATIENT_ID)

    assert len(rows) >= 1
    assert all(reading.patient_id == PATIENT_ID for reading, _ in rows)


def test_read_readings_user_filter():
    rows = crud.read_readings(user_id=VHT_USER_ID)

    assert len(rows) >= 1
    assert all(reading.patient_id == PATIENT_ID for reading, _ in rows)


def test_read_readings_last_edited(patient_factory, reading_factory):
    patient = patient_factory.create(id="readings-last-edited-patient")
    reading_factory.create(
        id="old-reading",
        patient_id=patient.id,
        last_edited=100,
    )
    new_reading = reading_factory.create(
        id="new-reading",
        patient_id=patient.id,
        last_edited=300,
    )

    rows = crud.read_readings(
        patient_id=patient.id,
        last_edited=200,
    )

    assert [reading.id for reading, _ in rows] == [new_reading.id]


def test_read_readings_urine_test(patient_factory, reading_factory):
    patient = patient_factory.create(id="readings-urine-test-patient")
    reading = reading_factory.create(
        id="reading-with-urine-test",
        patient_id=patient.id,
    )
    urine_test = models.UrineTestOrm(
        reading_id=reading.id,
        protein="+",
    )
    crud.create(urine_test)

    rows = crud.read_readings(patient_id=patient.id)

    assert len(rows) == 1
    assert rows[0][0].id == reading.id
    assert rows[0][1].protein == "+"
