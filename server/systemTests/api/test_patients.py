import pytest
from typing import List

import data.crud as crud
from models import Patient, Reading, TrafficLightEnum
from pprint import pformat


def test_get_patient(patient_factory, api_get):
    patient_id = "341541641613"
    patient_factory.create(patientId=patient_id, lastEdited=5, created=1)

    expected = {
        "patientId": patient_id,
        "patientName": "Test",
        "patientSex": "FEMALE",
        "isPregnant": False,
        "zone": "37",
        "villageNumber": "37",
        "created": 1,
        "lastEdited": 5,
        "base": 5,
        "readings": [],
    }

    response = api_get(endpoint=f"/api/patients/{patient_id}")

    assert response.status_code == 200
    assert expected == response.json()


def test_get_patient_medical_info(
    pregnancy_factory,
    medical_record_factory,
    patient_id,
    pregnancy_earlier,
    pregnancy_later,
    medical_record,
    drug_record,
    api_get,
):
    def test_pregnancy_info(pregnancy):
        pregnancy_factory.create(**pregnancy)

        response = api_get(
            endpoint=f"/api/patients/{patient_id}/medical_info",
        )

        assert response.status_code == 200

        isPregnant = "endDate" not in pregnancy
        response_body = response.json()
        assert response_body["isPregnant"] == isPregnant
        if isPregnant:
            assert response_body["pregnancyStartDate"] == pregnancy["startDate"]
            assert response_body["gestationalAgeUnit"] == pregnancy["defaultTimeUnit"]

    test_pregnancy_info(pregnancy_earlier)
    test_pregnancy_info(pregnancy_later)

    medical_record_factory.create(**medical_record)
    medical_record_factory.create(**drug_record)

    response = api_get(
        endpoint=f"/api/patients/{patient_id}/medical_info",
    )

    assert response.status_code == 200
    assert response.json()["medicalHistory"] == medical_record["information"]
    assert response.json()["drugHistory"] == drug_record["information"]


@pytest.mark.skip(reason="changes are to be made on mobile patient api")
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
            patient = crud.read(Patient, patientId=p)
            assert patient is not None

        # Add a more fleshed-out reading to the first patient.
        reading = __make_reading(
            reading_id="123dabdd-5des-7ufh-23fd-qd4308143651", patient_id=patient_ids[0]
        )
        reading_ids.append("123dabdd-5des-7ufh-23fd-qd4308143651")
        reading_response = api_post(endpoint="/api/readings", json=reading)
        database.session.commit()
        assert reading_response.status_code == 201

        # Add a more minimal reading to the first patient.
        reading = __make_reading_no_extra_vitals(
            reading_id="526292b7-53d0-4e7e-8a96-f66f061477ff", patient_id=patient_ids[0]
        )
        reading_ids.append("526292b7-53d0-4e7e-8a96-f66f061477ff")
        reading_response = api_post(endpoint="/api/readings", json=reading)
        database.session.commit()
        assert reading_response.status_code == 201

        # Add another fleshed-out reading to the first patient.
        reading = __make_reading(
            reading_id="2ab4f830-3cc0-4e98-bff3-174a9dcc630a", patient_id=patient_ids[0]
        )
        reading_ids.append("2ab4f830-3cc0-4e98-bff3-174a9dcc630a")
        reading_response = api_post(endpoint="/api/readings", json=reading)
        database.session.commit()
        assert reading_response.status_code == 201

        for r in reading_ids:
            reading = crud.read(Reading, readingId=r)
            assert reading is not None

        # Get all the patients from /api/mobile/patients.
        responseMobile = api_get(endpoint="/api/mobile/patients")
        assert responseMobile.status_code == 200

        # Setup an error message to return when an assert fails.
        # Note: Since this is usually tested with the test seed data, there will
        # be more than just 1 patient here.
        patient_number_info = (
            f"There were {len(responseMobile.json())} patients "
            + "returned by api/mobile/patients. Dumping them all now:\n"
            + pformat(responseMobile.json(), width=48)
            + "\n"
            + "========================================================"
        )

        # Loop through every single patient in the database.
        # For every patient in the database (as admin user, /api/mobile/patients returns
        # all the patients), get the patient info from the /api/patients/:id endpont
        # and then determine if they match.
        for patient_from_mobile_patients in responseMobile.json():
            patient_id = patient_from_mobile_patients["patientId"]
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
                current_reading_id = readingFromMobile["readingId"]
                readingFromNormalApi = [
                    r
                    for r in patient_from_patients_api["readings"]
                    if r["readingId"] == current_reading_id
                ][0]
                # Check that they give the exact same information.
                __assert_dicts_are_equal(
                    readingFromMobile,
                    readingFromNormalApi,
                    f"reading {current_reading_id} from api/mobile/patients",
                    f"reading {current_reading_id} from api/patients/:id",
                    other_error_messages=patient_number_info,
                    ignored_keys=["userId"],
                )
            for readingFromNormalApi in patient_from_patients_api["readings"]:
                # From the reading from the api/patients/:id, find the corresponding reading
                # from the api/mobile/patients endpoint
                current_reading_id = readingFromNormalApi["readingId"]
                readingFromMobile = [
                    r
                    for r in patient_from_mobile_patients["readings"]
                    if r["readingId"] == current_reading_id
                ][0]
                # Check that they give the exact same information.
                __assert_dicts_are_equal(
                    readingFromMobile,
                    readingFromNormalApi,
                    f"reading {current_reading_id} from api/mobile/patients",
                    f"reading {current_reading_id} from api/patients/:id",
                    other_error_messages=patient_number_info,
                    ignored_keys=["userId"],
                )

    finally:
        for r in reading_ids:
            crud.delete_by(Reading, readingId=r)
        for p in patient_ids:
            crud.delete_by(Patient, patientId=p)


def test_create_patient_with_nested_readings(database, api_post):
    patient_id = "5390160146141"
    reading_ids = [
        "65acfe28-b0d6-4a63-a484-eceb3277fb4e",
        "90293637-d763-494a-8cc7-85a88d023f3e",
    ]
    p = __make_patient(patient_id, reading_ids)
    response = api_post(endpoint="/api/patients", json=p)
    database.session.commit()

    try:
        assert response.status_code == 201
        assert crud.read(Patient, patientId=patient_id) is not None

        for r in reading_ids:
            reading = crud.read(Reading, readingId=r)
            assert reading is not None
            assert reading.trafficLightStatus == TrafficLightEnum.GREEN
    finally:
        for r in reading_ids:
            crud.delete_by(Reading, readingId=r)
        crud.delete_by(Patient, patientId=patient_id)


def test_update_patient_name(patient_factory, api_put):
    patient_id = "64164134514"
    patient_factory.create(patientId=patient_id, patientName="AB")

    response = api_put(
        endpoint=f"/api/patients/{patient_id}/info", json={"patientName": "CD"}
    )

    assert response.status_code == 200
    assert crud.read(Patient, patientId=patient_id).patientName == "CD"


def test_update_patient_with_base(patient_factory, api_put):
    patient_id = "45642677524614"
    patient_factory.create(patientId=patient_id, patientName="AB", lastEdited=5)

    json = {
        "patientName": "CD",
        "lastEdited": 6,
        "base": 5,  # base == lastEdited -> request is accepted
    }
    response = api_put(endpoint=f"/api/patients/{patient_id}/info", json=json)

    assert response.status_code == 200
    patient = crud.read(Patient, patientId=patient_id)
    assert patient.patientName == "CD"
    assert patient.lastEdited == 6


def test_update_patient_abort_due_to_conflict(patient_factory, api_put):
    patient_id = "45642677524614"
    patient_factory.create(patientId=patient_id, patientName="AB", lastEdited=7)

    json = {
        "patientName": "CD",
        "lastEdited": 6,
        "base": 5,  # base != lastEdited -> request is rejected
    }
    response = api_put(endpoint=f"/api/patients/{patient_id}/info", json=json)

    assert response.status_code == 409
    patient = crud.read(Patient, patientId=patient_id)
    assert patient.patientName == "AB"
    assert patient.lastEdited == 7


def test_invalid_patient_not_created(patient_factory, api_post):
    patient_id = "48375354"
    # invalid as patientName is missing
    patient = {
        "patientId": patient_id,
        "patientSex": "FEMALE",
        "isPregnant": False,
        "zone": "37",
        "villageNumber": "37",
        "created": 1,
        "lastEdited": 5,
        "base": 5,
        "readings": [],
    }
    response = api_post(endpoint="/api/patients", json=patient)
    assert response.status_code == 400
    assert crud.read(Patient, patientId=patient_id) is None


def __make_patient(patient_id: str, reading_ids: List[str]) -> dict:
    return {
        "patientId": patient_id,
        "patientName": "TEST",
        "patientSex": "FEMALE",
        "isPregnant": False,
        "dob": "2004-01-01",
        "isExactDob": False,
        "villageNumber": "1",
        "zone": "1",
        "readings": [
            __make_reading_no_extra_vitals(r, patient_id) for r in reading_ids
        ],
    }


def __make_full_patient(patient_id: str, reading_ids: List[str]) -> dict:
    return {
        "patientId": patient_id,
        "patientName": "TEST_FULL",
        "patientSex": "FEMALE",
        "isPregnant": True,
        "gestationalAgeUnit": "MONTHS",
        "gestationalTimestamp": 1595211991,
        "medicalHistory": "TEST_FULL: This is fully fleshed out medical history for testing.",
        "drugHistory": "TEST_FULL: This is fully fleshed out drug history for testing.",
        "zone": "9999",
        "dob": "1995-08-23",
        "isExactDob": True,
        "villageNumber": "9999",
        "householdNumber": "4544",
        "readings": [__make_full_reading(r, patient_id) for r in reading_ids],
    }


def __make_reading(reading_id: str, patient_id: str) -> dict:
    return {
        "readingId": reading_id,
        "bpSystolic": 110,
        "bpDiastolic": 80,
        "heartRateBPM": 70,
        "symptoms": ["a", "b", "c"],
        "dateTimeTaken": 100,
        "userId": 1,
        "patientId": patient_id,
    }


def __make_full_reading(reading_id: str, patient_id: str) -> dict:
    return {
        "readingId": reading_id,
        "bpSystolic": 155,
        "bpDiastolic": 155,
        "heartRateBPM": 155,
        "symptoms": ["These are", "symptoms", "for full reading"],
        "dateTimeTaken": 5435345,
        "dateRecheckVitalsNeeded": 11111111,
        "userId": 1,
        "patientId": patient_id,
        "retestOfPreviousReadingIds": "aed6818f-fd9f-4d4c-8137-fbfe3e1c91e9",
        "isFlaggedForFollowup": True,
    }


def __make_reading_no_extra_vitals(reading_id: str, patient_id: str) -> dict:
    return {
        "readingId": reading_id,
        "bpSystolic": 99,
        "bpDiastolic": 80,
        "heartRateBPM": 70,
        "symptoms": ["a", "b", "c"],
        "dateTimeTaken": 100,
        "userId": 1,
        "patientId": patient_id,
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
            if not key in second:
                continue
            elif second[key] is None:
                continue
            else:
                # Guaranteed to fail because one key is missing. This will generate a diff in the
                # error output.
                assert first == second, (
                    f"{key} is key for {name_for_first} with value None, "
                    + f"but {name_for_second}'s key's value is not None\n"
                    + dict_dump
                )

        if not key in second:
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
