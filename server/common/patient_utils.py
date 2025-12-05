from flask import abort

import data.db_operations as crud
from common.commonUtil import get_uuid
from models import PatientOrm

PATIENT_NOT_FOUND_MSG = "Patient with ID: ({}) not found."


def assign_patient_id(patient: dict) -> None:
    """
    Assigns an ID to a patient if none has been provided, if the patient already has readings,
    referrals, and assessments, those will also be assigned an ID and be updated to contain the new patient ID

    :param patient: A dictionary containing the patient data to be uploaded to the DB
    """
    if patient["id"] is None:
        patient["id"] = get_uuid()

    id = patient["id"]

    # Assign IDs and patient ID to readings if provided
    for reading in patient["readings"]:
        if reading["id"] is None:
            reading["id"] = get_uuid()

        reading["patient_id"] = id

        if reading["assessment"] is not None:
            if reading["assessment"]["id"] is None:
                reading["assessment"]["id"] = get_uuid()

            reading["assessment"]["patient_id"] = id

        if reading["referral"] is not None:
            if reading["referral"]["id"] is None:
                reading["referral"]["id"] = get_uuid()

            reading["referral"]["patient_id"] = id

    # Assign IDs and patient ID to referrals if provided
    for referral in patient["referrals"]:
        if referral["id"] is None:
            referral["id"] = get_uuid()

        referral["patient_id"] = id


def fetch_patient(patient_id: str) -> PatientOrm:
    """
    Fetches a patient.
    Raises a 404 error (via Flask's `abort`) if the patient is not found.

    Intended as a helper function used within Flask API endpoint functions.
    """
    patient = crud.read(PatientOrm, id=patient_id)
    if patient is None:
        return abort(
            code=404,
            description=PATIENT_NOT_FOUND_MSG.format(patient_id),
        )
    return patient


def check_patient_exists(patient_id: str) -> PatientOrm:
    """
    Checks if a patient exists.
    Raises a 404 error (via Flask's `abort`) if the patient is not found.

    Intended as a helper function used within Flask API endpoint functions.
    """
    fetch_patient(patient_id)
