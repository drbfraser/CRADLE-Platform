import data.db_operations as crud
from enums import TrafficLightEnum

MYSQL_BIGINT_MAX = (2**63) - 1


# get_unique_patients_with_readings tests


def test_get_unique_patients_with_readings_basic(patient_factory, reading_factory):
    # The need to treat it as a list seems very counter-intuitive
    old_count = crud.get_unique_patients_with_readings()[0][0]

    assert old_count >= 0

    new_patient = patient_factory.create()

    reading_factory.create(
        patient_id=new_patient.id,
        date_taken=1594514397,
    )

    reading_factory.create(
        patient_id=new_patient.id,
        date_taken=1594514397 + 10000,
    )

    new_count = crud.get_unique_patients_with_readings()[0][0]

    assert old_count == new_count - 1


def test_get_unique_patients_with_readings_facility_user(
    patient_factory, reading_factory
):
    old_count_facility = crud.get_unique_patients_with_readings("H1000")[0][0]
    old_count_user = crud.get_unique_patients_with_readings(user=3)[0][0]
    old_count_other_user = crud.get_unique_patients_with_readings(user=2)[0][0]
    old_count_other_facility = crud.get_unique_patients_with_readings("H0000")[0][0]

    new_patient = patient_factory.create()

    reading_factory.create(patient_id=new_patient.id, date_taken=1594514397, user_id=3)

    new_count_facility = crud.get_unique_patients_with_readings("H1000")[0][0]
    new_count_user = crud.get_unique_patients_with_readings(user=3)[0][0]
    new_count_other_user = crud.get_unique_patients_with_readings(user=2)[0][0]
    new_count_other_facility = crud.get_unique_patients_with_readings("H0000")[0][0]

    assert new_count_facility - 1 == old_count_facility
    assert new_count_user - 1 == old_count_user

    assert old_count_other_user == new_count_other_user
    assert old_count_other_facility == new_count_other_facility


def test_get_unique_patients_with_readings_filter():
    assert crud.get_unique_patients_with_readings(filter={"to": 0})[0][0] == 0
    assert (
        crud.get_unique_patients_with_readings(filter={"from": MYSQL_BIGINT_MAX})[0][0]
        == 0
    )


# get_total_readings_completed tests


def test_get_total_readings_completed_basic(patient_factory, reading_factory):
    old_count = crud.get_total_readings_completed()[0][0]

    new_patient = patient_factory.create()

    reading_factory.create(
        patient_id=new_patient.id,
        date_taken=1594514397,
    )
    reading_factory.create(
        patient_id=new_patient.id,
        date_taken=1594514397 + 10000,
    )

    new_count = crud.get_total_readings_completed()[0][0]

    assert old_count == new_count - 2


def test_get_total_readings_completed_facility_user(patient_factory, reading_factory):
    old_count_facility = crud.get_total_readings_completed("H1000")[0][0]
    old_count_user = crud.get_total_readings_completed(user=3)[0][0]
    old_count_other_user = crud.get_total_readings_completed(user=2)[0][0]
    old_count_other_facility = crud.get_total_readings_completed("H0000")[0][0]

    new_patient = patient_factory.create()

    reading_factory.create(patient_id=new_patient.id, date_taken=1594514397, user_id=3)

    new_count_facility = crud.get_total_readings_completed("H1000")[0][0]
    new_count_user = crud.get_total_readings_completed(user=3)[0][0]
    new_count_other_user = crud.get_total_readings_completed(user=2)[0][0]
    new_count_other_facility = crud.get_total_readings_completed("H0000")[0][0]

    assert new_count_facility - 1 == old_count_facility
    assert new_count_user - 1 == old_count_user

    assert old_count_other_user == new_count_other_user
    assert old_count_other_facility == new_count_other_facility


def test_get_total_readings_completed_filter():
    assert crud.get_total_readings_completed(filter={"to": 0})[0][0] == 0
    assert (
        crud.get_total_readings_completed(filter={"from": MYSQL_BIGINT_MAX})[0][0] == 0
    )


# get_total_color_readings tests


def test_get_total_color_readings_basic(patient_factory, reading_factory):
    old_counts = dict(crud.get_total_color_readings())

    new_patient = patient_factory.create()

    reading_factory.create(
        patient_id=new_patient.id,
        date_taken=1594514397,
    )
    reading_factory.create(
        patient_id=new_patient.id,
        date_taken=1594514397 + 10000,
        systolic_blood_pressure=170,
        diastolic_blood_pressure=80,
        heart_rate=70,
    )

    new_counts = dict(crud.get_total_color_readings())

    assert new_counts[TrafficLightEnum.GREEN.value] == (
        old_counts.get(TrafficLightEnum.GREEN.value, 0) + 1
    )
    assert new_counts[TrafficLightEnum.RED_UP.value] == (
        old_counts.get(TrafficLightEnum.RED_UP.value, 0) + 1
    )


def test_get_total_color_readings_facility_user(patient_factory, reading_factory):
    old_counts_facility = dict(crud.get_total_color_readings("H1000"))
    old_counts_user = dict(crud.get_total_color_readings(user=3))
    old_counts_other_user = dict(crud.get_total_color_readings(user=2))
    old_counts_other_facility = dict(crud.get_total_color_readings("H0000"))

    new_patient = patient_factory.create()

    reading_factory.create(patient_id=new_patient.id, date_taken=1594514397, user_id=3)

    new_counts_facility = dict(crud.get_total_color_readings("H1000"))
    new_counts_user = dict(crud.get_total_color_readings(user=3))
    new_counts_other_user = dict(crud.get_total_color_readings(user=2))
    new_counts_other_facility = dict(crud.get_total_color_readings("H0000"))

    assert new_counts_facility[TrafficLightEnum.GREEN.value] == (
        old_counts_facility.get(TrafficLightEnum.GREEN.value, 0) + 1
    )
    assert new_counts_user[TrafficLightEnum.GREEN.value] == (
        old_counts_user.get(TrafficLightEnum.GREEN.value, 0) + 1
    )

    assert old_counts_other_user == new_counts_other_user
    assert old_counts_other_facility == new_counts_other_facility


def test_get_total_color_readings_filter():
    assert crud.get_total_color_readings(filter={"to": 0}) == []
    assert crud.get_total_color_readings(filter={"from": MYSQL_BIGINT_MAX}) == []


# get_sent_referrals tests


def test_get_sent_referrals_basic(patient_factory, referral_factory):
    old_count = crud.get_sent_referrals()[0][0]

    new_patient = patient_factory.create()

    referral_factory.create(
        patient_id=new_patient.id,
        date_referred=1594514397,
    )

    new_count = crud.get_sent_referrals()[0][0]

    assert old_count == new_count - 1


def test_get_sent_referrals_facility_user(patient_factory, referral_factory):
    old_count_facility = crud.get_sent_referrals("H1000")[0][0]
    old_count_user = crud.get_sent_referrals(user=3)[0][0]
    old_count_other_user = crud.get_sent_referrals(user=2)[0][0]
    old_count_other_facility = crud.get_sent_referrals("H0000")[0][0]

    new_patient = patient_factory.create()

    referral_factory.create(
        patient_id=new_patient.id,
        date_referred=1594514397,
        health_facility_name="H1000",
        user_id=3,
    )

    new_count_facility = crud.get_sent_referrals("H1000")[0][0]
    new_count_user = crud.get_sent_referrals(user=3)[0][0]
    new_count_other_user = crud.get_sent_referrals(user=2)[0][0]
    new_count_other_facility = crud.get_sent_referrals("H0000")[0][0]

    assert new_count_facility - 1 == old_count_facility
    assert new_count_user - 1 == old_count_user

    assert old_count_other_user == new_count_other_user
    assert old_count_other_facility == new_count_other_facility


def test_get_sent_referrals_filter():
    assert crud.get_sent_referrals(filter={"to": 0})[0][0] == 0
    assert crud.get_sent_referrals(filter={"from": MYSQL_BIGINT_MAX})[0][0] == 0


# get_referred_patients tests


def test_get_referred_patients_basic(patient_factory, referral_factory):
    old_count = crud.get_referred_patients()[0][0]

    new_patient = patient_factory.create()

    referral_factory.create(
        patient_id=new_patient.id,
        date_referred=1594514397,
    )
    referral_factory.create(
        patient_id=new_patient.id,
        date_referred=1594514397 + 10000,
    )

    new_count = crud.get_referred_patients()[0][0]

    assert old_count == new_count - 1


def test_get_referred_patients_facility(patient_factory, referral_factory):
    old_count_facility = crud.get_referred_patients("H1000")[0][0]
    old_count_other_facility = crud.get_referred_patients("H0000")[0][0]

    new_patient = patient_factory.create()

    referral_factory.create(
        patient_id=new_patient.id,
        date_referred=1594514397,
        health_facility_name="H1000",
    )

    new_count_facility = crud.get_referred_patients("H1000")[0][0]
    new_count_other_facility = crud.get_referred_patients("H0000")[0][0]

    assert new_count_facility - 1 == old_count_facility
    assert old_count_other_facility == new_count_other_facility


def test_get_referred_patients_filter():
    assert crud.get_referred_patients(filter={"to": 0})[0][0] == 0
    assert crud.get_referred_patients(filter={"from": MYSQL_BIGINT_MAX})[0][0] == 0


# get_days_with_readings tests


def test_get_days_with_readings_basic(patient_factory, reading_factory):
    old_count = crud.get_days_with_readings()[0][0]

    new_patient = patient_factory.create()

    reading_factory.create(
        patient_id=new_patient.id,
        date_taken=3000000000,
    )
    reading_factory.create(
        patient_id=new_patient.id,
        date_taken=3000000000 + 86400,
    )

    new_count = crud.get_days_with_readings()[0][0]

    assert old_count == new_count - 2


def test_get_days_with_readings_facility_user(patient_factory, reading_factory):
    old_count_facility = crud.get_days_with_readings("H1000")[0][0]
    old_count_user = crud.get_days_with_readings(user=3)[0][0]
    old_count_other_user = crud.get_days_with_readings(user=2)[0][0]
    old_count_other_facility = crud.get_days_with_readings("H0000")[0][0]

    new_patient = patient_factory.create()

    reading_factory.create(patient_id=new_patient.id, date_taken=3000000000, user_id=3)

    new_count_facility = crud.get_days_with_readings("H1000")[0][0]
    new_count_user = crud.get_days_with_readings(user=3)[0][0]
    new_count_other_user = crud.get_days_with_readings(user=2)[0][0]
    new_count_other_facility = crud.get_days_with_readings("H0000")[0][0]

    assert new_count_facility - 1 == old_count_facility
    assert new_count_user - 1 == old_count_user

    assert old_count_other_user == new_count_other_user
    assert old_count_other_facility == new_count_other_facility


def test_get_days_with_readings_filter():
    assert crud.get_days_with_readings(filter={"to": 0})[0][0] == 0
    assert crud.get_days_with_readings(filter={"from": MYSQL_BIGINT_MAX})[0][0] == 0


# get_export_data tests


def test_get_export_data_basic(patient_factory, reading_factory, referral_factory):
    patient = patient_factory.create(id="stats-export-patient", name="Stats Export")

    reading_factory.create(
        patient_id=patient.id,
        date_taken=1594514397,
        user_id=3,
        systolic_blood_pressure=125,
        diastolic_blood_pressure=85,
        heart_rate=75,
    )
    referral_factory.create(
        patient_id=patient.id,
        date_referred=1594514397,
    )

    rows = crud.get_export_data(3, {"from": 0, "to": MYSQL_BIGINT_MAX})

    assert any(row["patient_id"] == patient.id for row in rows)


def test_get_export_data_filter_to(patient_factory, reading_factory, referral_factory):
    patient = patient_factory.create(id="stats-export-filter-to-patient")

    reading_factory.create(
        patient_id=patient.id,
        date_taken=1594514397,
        user_id=3,
    )
    referral_factory.create(
        patient_id=patient.id,
        date_referred=1594514397,
    )

    assert all(
        row["patient_id"] != patient.id for row in crud.get_export_data(3, {"to": 0})
    )


def test_get_export_data_filter_from(
    patient_factory, reading_factory, referral_factory
):
    patient = patient_factory.create(id="stats-export-filter-from-patient")

    reading_factory.create(
        patient_id=patient.id,
        date_taken=1594514397,
        user_id=3,
    )
    referral_factory.create(
        patient_id=patient.id,
        date_referred=1594514397,
    )

    assert all(
        row["patient_id"] != patient.id
        for row in crud.get_export_data(3, {"from": MYSQL_BIGINT_MAX})
    )
