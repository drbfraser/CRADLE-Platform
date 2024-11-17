import time
from pprint import pformat
from typing import List

import pytest

from data import crud
from enums import TrafficLightEnum
from models import MedicalRecordOrm, PatientOrm, PregnancyOrm, ReadingOrm
from utils import get_current_time


def test_get_patient_list(create_patient, patient_info, reading_factory, api_get):
    create_patient()
    patient_id = patient_info["id"]

    reading_id1 = "w3d0aklrs4wenm6hk5z1"
    date1 = 1604514300
    reading_factory.create(
        id=reading_id1,
        patient_id=patient_id,
        date_taken=date1,
    )

    reading_id2 = "w3d0aklrs4wenm6hk5z2"
    date2 = date1 + 2e7
    reading_factory.create(
        id=reading_id2,
        patient_id=patient_id,
        date_taken=date2,
    )

    response = api_get(endpoint="/api/patients")

    assert response.status_code == 200

    patient = None
    for p in response.json():
        if p["id"] == patient_id:
            patient = p
            break

    assert patient["name"] == patient_info["name"]
    assert patient["village_number"] == patient_info["village_number"]
    assert patient["traffic_light_status"] == TrafficLightEnum.GREEN.value
    assert patient["date_taken"] == date2


def test_get_patients_admin(create_patient, patient_info, api_get):
    create_patient()
    patient_id = patient_info["id"]

    response = api_get(endpoint="/api/patients/admin")

    assert response.status_code == 200

    patient = None
    for p in response.json():
        if p["id"] == patient_id:
            patient = p
            break

    assert patient["name"] == patient_info["name"]
    assert patient["is_archived"] == patient_info["is_archived"]


def test_get_patient(
    create_patient,
    patient_info,
    reading_factory,
    pregnancy_factory,
    pregnancy_earlier,
    pregnancy_later,
    medical_record_factory,
    medical_record,
    drug_record,
    api_get,
):
    create_patient()
    patient_id = patient_info["id"]

    pregnancy_factory.create(**pregnancy_earlier)
    pregnancy_factory.create(**pregnancy_later)
    medical_record_factory.create(**medical_record)
    medical_record_factory.create(**drug_record)

    reading_id1 = "w3d0aklrs4wenm6hk5z3"
    reading_factory.create(id=reading_id1, patient_id=patient_id)

    reading_id2 = "w3d0aklrs4wenm6hk5z4"
    reading_factory.create(id=reading_id2, patient_id=patient_id)

    response = api_get(endpoint=f"/api/patients/{patient_id}")

    assert response.status_code == 200

    patient = response.json()

    assert patient["id"] == patient_id
    assert patient["name"] == patient_info["name"]
    assert patient["date_of_birth"] == patient_info["date_of_birth"]
    assert patient["pregnancy_start_date"] == pregnancy_later["start_date"]
    assert patient["medical_history"] == medical_record["information"]
    assert patient["drug_history"] == drug_record["information"]

    readings = patient["readings"]

    assert any(r["id"] == reading_id1 for r in readings)
    assert any(r["id"] == reading_id2 for r in readings)


def test_get_patient_pregnancy_summary(
    create_patient,
    pregnancy_factory,
    patient_id,
    pregnancy_earlier,
    pregnancy_later,
    api_get,
):
    create_patient()
    response = api_get(
        endpoint=f"/api/patients/{patient_id}/pregnancy_summary",
    )

    assert response.status_code == 200
    assert response.json()["is_pregnant"] is False
    assert len(response.json()["past_pregnancies"]) == 0

    pregnancy_factory.create(**pregnancy_earlier)
    pregnancy_factory.create(**pregnancy_later)

    response = api_get(
        endpoint=f"/api/patients/{patient_id}/pregnancy_summary",
    )

    assert response.status_code == 200
    assert response.json()["is_pregnant"] is True
    assert response.json()["pregnancy_start_date"] == pregnancy_later["start_date"]
    assert len(response.json()["past_pregnancies"]) == 1

    past_pregnancy = response.json()["past_pregnancies"][0]
    assert past_pregnancy["outcome"] == pregnancy_earlier["outcome"]


def test_get_patient_medical_history(
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

    response = api_get(
        endpoint=f"/api/patients/{patient_id}/medical_history",
    )

    assert response.status_code == 200
    assert response.json()["medical_history"] == medical_record["information"]
    assert response.json()["drug_history"] == drug_record["information"]


def test_get_patient_timeline(
    create_patient,
    pregnancy_factory,
    medical_record_factory,
    patient_id,
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
    time.sleep(1)
    medical_record_factory.create(**drug_record)

    response = api_get(
        endpoint=f"/api/patients/{patient_id}/timeline",
    )

    assert response.status_code == 200

    timeline = response.json()
    assert len(timeline) >= 5
    assert timeline[0]["information"] == drug_record["information"]
    assert timeline[2]["date"] == pregnancy_later["start_date"]
    assert timeline[3]["date"] == pregnancy_earlier["end_date"]


@pytest.mark.skip(reason="API deprecated")
def test_get_mobile_patient(database, api_post, api_get):
    patient_ids = []
    reading_ids = []
    try:
        p = __make_patient("222266667", ["893ddaad-1ebd-46fb-928b-ad0640115aa1"])
        patient_ids.append("222266667")
        reading_ids.append("893ddaad-1ebd-46fb-928b-ad0640115aa1")
        response = api_post(endpoint="/api/patients", json=p)
        database.session.commit()
        assert response.status_code == 201

        # Make the patient IDs so that they're on both sides of the patient IDs.
        p = __make_full_patient("9999", ["7f60bbb3-c49d-425f-825c-681c8330b61d"])
        patient_ids.append("9999")
        reading_ids.append("7f60bbb3-c49d-425f-825c-681c8330b61d")
        response = api_post(endpoint="/api/patients", json=p)
        database.session.commit()
        assert response.status_code == 201

        # Make the patient IDs so that they're on both sides of the patient IDs
        p = __make_full_patient("999955551", ["978e870e-c542-428a-a8bf-dabb0e52bff3"])
        patient_ids.append("999955551")
        reading_ids.append("978e870e-c542-428a-a8bf-dabb0e52bff3")
        response = api_post(endpoint="/api/patients", json=p)
        database.session.commit()
        assert response.status_code == 201

        for p in patient_ids:
            patient = crud.read(PatientOrm, id=p)
            assert patient is not None

        # Add a more fleshed-out reading to the first patient.
        reading = __make_reading(
            reading_id="123dabdd-5des-7ufh-23fd-qd4308143651",
            patient_id=patient_ids[0],
        )
        reading_ids.append("123dabdd-5des-7ufh-23fd-qd4308143651")
        reading_response = api_post(endpoint="/api/readings", json=reading)
        database.session.commit()
        assert reading_response.status_code == 201

        # Add a more minimal reading to the first patient.
        reading = __make_reading_no_extra_vitals(
            reading_id="526292b7-53d0-4e7e-8a96-f66f061477ff",
            patient_id=patient_ids[0],
        )
        reading_ids.append("526292b7-53d0-4e7e-8a96-f66f061477ff")
        reading_response = api_post(endpoint="/api/readings", json=reading)
        database.session.commit()
        assert reading_response.status_code == 201

        # Add another fleshed-out reading to the first patient.
        reading = __make_reading(
            reading_id="2ab4f830-3cc0-4e98-bff3-174a9dcc630a",
            patient_id=patient_ids[0],
        )
        reading_ids.append("2ab4f830-3cc0-4e98-bff3-174a9dcc630a")
        reading_response = api_post(endpoint="/api/readings", json=reading)
        database.session.commit()
        assert reading_response.status_code == 201

        for r in reading_ids:
            reading = crud.read(ReadingOrm, readingId=r)
            assert reading is not None

        # Get all the patients from /api/mobile/patients.
        response_mobile = api_get(endpoint="/api/mobile/patients")
        assert response_mobile.status_code == 200

        # Setup an error message to return when an assert fails.
        # Note: Since this is usually tested with the test seed data, there will
        # be more than just 1 patient here.
        patient_number_info = (
            f"There were {len(response_mobile.json())} patients "
            + "returned by api/mobile/patients. Dumping them all now:\n"
            + pformat(response_mobile.json(), width=48)
            + "\n"
            + "========================================================"
        )

        # Loop through every single patient in the database.
        # For every patient in the database (as admin user, /api/mobile/patients returns
        # all the patients), get the patient info from the /api/patients/:id endpont
        # and then determine if they match.
        for patient_from_mobile_patients in response_mobile.json():
            patient_id = patient_from_mobile_patients["id"]
            # Validate that the GET requests for /api/patients/{patient_id} and
            # /api/mobile/patients give back the same information.
            # We first validate that the patient info returned is consistent.

            # Get the patient from the /api/patients/:id endpoint.
            response_patients_get = api_get(endpoint=f"/api/patients/{patient_id}")
            assert response_patients_get.status_code == 200
            patient_from_patients_api = response_patients_get.json()

            # Check that both results are basically equal.
            __assert_dicts_are_equal(
                patient_from_mobile_patients,
                patient_from_patients_api,
                f"patient {patient_id} from api/mobile/patients",
                f"patient {patient_id} from api/patients/:id",
                other_error_messages=patient_number_info,
                # Validate the readings later.
                ignored_keys=["readings"],
            )

            # Validate the readings now. We check that they both have the same readings.
            # Loop through both of them in case one readings list is different from the other.
            for readingFromMobile in patient_from_mobile_patients["readings"]:
                # From the reading from the api/mobile/patients, find the corresponding reading
                # from the api/patients/:id endpoint
                current_reading_id = readingFromMobile["id"]
                reading_from_normal_api = [
                    r
                    for r in patient_from_patients_api["readings"]
                    if r["id"] == current_reading_id
                ][0]
                # Check that they give the exact same information.
                __assert_dicts_are_equal(
                    readingFromMobile,
                    reading_from_normal_api,
                    f"reading {current_reading_id} from api/mobile/patients",
                    f"reading {current_reading_id} from api/patients/:id",
                    other_error_messages=patient_number_info,
                    ignored_keys=["user_id"],
                )
            for reading_from_normal_api in patient_from_patients_api["readings"]:
                # From the reading from the api/patients/:id, find the corresponding reading
                # from the api/mobile/patients endpoint
                current_reading_id = reading_from_normal_api["id"]
                readingFromMobile = [
                    r
                    for r in patient_from_mobile_patients["readings"]
                    if r["id"] == current_reading_id
                ][0]
                # Check that they give the exact same information.
                __assert_dicts_are_equal(
                    readingFromMobile,
                    reading_from_normal_api,
                    f"reading {current_reading_id} from api/mobile/patients",
                    f"reading {current_reading_id} from api/patients/:id",
                    other_error_messages=patient_number_info,
                    ignored_keys=["user_id"],
                )

    finally:
        for r in reading_ids:
            crud.delete_by(ReadingOrm, id=r)
        for p in patient_ids:
            crud.delete_by(PatientOrm, id=p)


def test_create_patient_with_nested_readings(database, api_post):
    patient_id = "5390160146141"
    reading_ids = [
        "65acfe28-b0d6-4a63-a484-eceb3277fb4e",
        "90293637-d763-494a-8cc7-85a88d023f3e",
    ]
    patient = __make_patient(patient_id, reading_ids)
    response = api_post(endpoint="/api/patients", json=patient)
    database.session.commit()

    try:
        assert response.status_code == 201
        assert crud.read(PatientOrm, id=patient_id) is not None

        for reading_id in reading_ids:
            reading = crud.read(ReadingOrm, id=reading_id)
            assert reading is not None
            assert reading.traffic_light_status == TrafficLightEnum.GREEN
    finally:
        for reading_id in reading_ids:
            crud.delete_by(ReadingOrm, id=reading_id)
        crud.delete_by(PatientOrm, id=patient_id)


def test_create_patient_with_pregnancy_and_medical_records(database, api_post):
    patient_id = "8790160146141"
    date = get_current_time()
    p = __make_full_patient_no_readings(patient_id, date)

    response = api_post(endpoint="/api/patients", json=p)
    database.session.commit()

    try:
        assert response.status_code == 201
        assert crud.read(PatientOrm, id=patient_id) is not None
        assert (
            crud.read(PregnancyOrm, patient_id=patient_id, start_date=date) is not None
        )
        assert crud.read(MedicalRecordOrm, patient_id=patient_id, is_drug_record=False)
        assert crud.read(MedicalRecordOrm, patient_id=patient_id, is_drug_record=True)

    finally:
        crud.delete_by(PregnancyOrm, patient_id=patient_id, start_date=date)
        crud.delete_by(MedicalRecordOrm, patient_id=patient_id, is_drug_record=False)
        crud.delete_by(MedicalRecordOrm, patient_id=patient_id, is_drug_record=True)
        crud.delete_by(PatientOrm, id=patient_id)


def __make_full_patient_no_readings(patient_id: str, date: int) -> dict:
    return {
        "id": patient_id,
        "name": "TEST_FULL",
        "sex": "FEMALE",
        "is_pregnant": True,
        "pregnancy_start_date": date,
        "medical_history": "TEST_FULL: This is fully fleshed out medical history for testing.",
        "drug_history": "TEST_FULL: This is fully fleshed out drug history for testing.",
        "zone": "9999",
        "date_of_birth": "1995-08-23",
        "is_exact_date_of_birth": True,
        "village_number": "9999",
        "household_number": "4544",
    }


def test_update_patient_name(patient_factory, api_put):
    patient_id = "64164134514"
    patient_factory.create(id=patient_id, name="AB")

    response = api_put(
        endpoint=f"/api/patients/{patient_id}/info",
        json={"name": "CD"},
    )

    assert response.status_code == 200
    assert crud.read(PatientOrm, id=patient_id).name == "CD"


def test_update_patient_with_base(patient_factory, api_put):
    patient_id = "45642677524614"
    patient_factory.create(id=patient_id, name="AB", last_edited=5)

    json = {
        "name": "CD",
        "last_edited": 6,
        "base": 5,  # base == last_edited -> request is accepted
    }
    response = api_put(endpoint=f"/api/patients/{patient_id}/info", json=json)

    assert response.status_code == 200
    patient = crud.read(PatientOrm, id=patient_id)
    assert patient.name == "CD"
    assert patient.last_edited == 6


def test_update_patient_abort_due_to_conflict(patient_factory, api_put):
    patient_id = "45642677524614"
    patient_factory.create(id=patient_id, name="AB", last_edited=7)

    json = {
        "name": "CD",
        "last_edited": 6,
        "base": 5,  # base != last_edited -> request is rejected
    }
    response = api_put(endpoint=f"/api/patients/{patient_id}/info", json=json)

    assert response.status_code == 409
    patient = crud.read(PatientOrm, id=patient_id)
    assert patient.name == "AB"
    assert patient.last_edited == 7


def test_invalid_patient_not_created(patient_factory, api_post):
    patient_id = "48375354"
    # invalid as name is missing
    patient = {
        "id": patient_id,
        "sex": "FEMALE",
        "is_pregnant": False,
        "zone": "37",
        "village_number": "37",
        "created": 1,
        "last_edited": 5,
        "base": 5,
        "readings": [],
    }
    response = api_post(endpoint="/api/patients", json=patient)
    assert response.status_code == 400
    assert crud.read(PatientOrm, id=patient_id) is None


def __make_patient(patient_id: str, reading_ids: List[str]) -> dict:
    return {
        "id": patient_id,
        "name": "TEST",
        "sex": "FEMALE",
        "is_pregnant": False,
        "date_of_birth": "2004-01-01",
        "is_exact_date_of_birth": False,
        "village_number": "1",
        "zone": "1",
        "readings": [
            __make_reading_no_extra_vitals(r, patient_id) for r in reading_ids
        ],
    }


def __make_full_patient(patient_id: str, reading_ids: List[str]) -> dict:
    return {
        "id": patient_id,
        "name": "TEST_FULL",
        "sex": "FEMALE",
        "is_pregnant": True,
        "pregnancy_start_date": 1595211991,
        "medical_history": "TEST_FULL: This is fully fleshed out medical history for testing.",
        "drug_history": "TEST_FULL: This is fully fleshed out drug history for testing.",
        "zone": "9999",
        "date_of_birth": "1995-08-23",
        "is_exact_date_of_birth": True,
        "village_number": "9999",
        "household_number": "4544",
        "readings": [__make_full_reading(r, patient_id) for r in reading_ids],
    }


def __make_reading(reading_id: str, patient_id: str) -> dict:
    return {
        "readingId": reading_id,
        "systolic_blood_pressure": 110,
        "diastolic_blood_pressure": 80,
        "heart_rate": 70,
        "symptoms": ["a", "b", "c"],
        "date_taken": 100,
        "user_id": 1,
        "patient_id": patient_id,
    }


def __make_full_reading(reading_id: str, patient_id: str) -> dict:
    return {
        "id": reading_id,
        "systolic_blood_pressure": 155,
        "diastolic_blood_pressure": 155,
        "heart_rate": 155,
        "symptoms": ["These are", "symptoms", "for full reading"],
        "date_taken": 5435345,
        "date_recheck_vitals_needed": 11111111,
        "user_id": 1,
        "patient_id": patient_id,
        "retest_of_previous_reading_ids": "aed6818f-fd9f-4d4c-8137-fbfe3e1c91e9",
        "is_flagged_for_follow_up": True,
    }


def __make_reading_no_extra_vitals(reading_id: str, patient_id: str) -> dict:
    return {
        "id": reading_id,
        "systolic_blood_pressure": 99,
        "diastolic_blood_pressure": 80,
        "heart_rate": 70,
        "symptoms": ["a", "b", "c"],
        "date_taken": 100,
        "user_id": 1,
        "patient_id": patient_id,
    }


def __assert_dicts_are_equal(
    first: dict,
    second: dict,
    name_for_first: str,
    name_for_second: str,
    other_error_messages: str = "",
    ignored_keys: list = [],
):
    """
    Checks the equality of two dicts with support for ignoring certain keys and handling
    the case where a value is None.

    :param first: A dict to compare
    :param second: Another dict to compare
    :param name_for_first: A name to use in failed assert messages for the first dict
    :param name_for_second: A name to use in failed assert messages for the second dict
    :param other_error_messages: Other messages to print when a failure occurs
    :param ignored_keys: Keys to ignore
    """
    __assert_dict_keys_of_first_equal_to_second(
        first,
        second,
        name_for_first,
        name_for_second,
        other_error_messages=other_error_messages,
        ignored_keys=ignored_keys,
    )
    __assert_dict_keys_of_first_equal_to_second(
        second,
        first,
        name_for_second,
        name_for_first,
        other_error_messages=other_error_messages,
        ignored_keys=ignored_keys,
    )


def __assert_dict_keys_of_first_equal_to_second(
    first: dict,
    second: dict,
    name_for_first: str,
    name_for_second: str,
    other_error_messages: str = "",
    ignored_keys: list = [],
):
    """
    Checks that all the keys in the first dict are in the second dict and that the respecitve values
    of the all keys for both dicts are equal.

    :param first: A dict to compare
    :param second: Another dict to compare
    :param name_for_first: A name to use in failed assert messages for the first dict
    :param name_for_second: A name to use in failed assert messages for the second dict
    :param other_error_messages: Other messages to print when a failure occurs
    :param ignored_keys: Keys to ignore
    """
    dict_dump = (
        other_error_messages + "\n"
        f"{name_for_first}: {pformat(first, width=48)}\n"
        + f"{name_for_second}: {pformat(second, width=48)}"
    )

    for key in first:
        if key in ignored_keys:
            continue

        # Catch the case where one of the dicts has None to mean "not present"
        # This occurs in api/mobile/patients
        if first[key] is None:
            if key not in second or second[key] is None:
                continue
            # Guaranteed to fail because one key is missing. This will generate a diff in the
            # error output.
            assert first == second, (
                f"{key} is key for {name_for_first} with value None, "
                + f"but {name_for_second}'s key's value is not None\n"
                + dict_dump
            )

        if key not in second:
            # Guaranteed to fail because one key is missing. This will generate a diff in the
            # error output.
            assert first == second, (
                f"{key} is a key for {name_for_first}, \n"
                f"but {key} is missing from {name_for_second}\n" + dict_dump
            )

        assert first[key] == second[key], (
            f"key {key} has value {first[key]} for {name_for_first}, "
            + "but {name_for_second} has value {second[key]}\n"
            + dict_dump
        )
