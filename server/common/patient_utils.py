from common.commonUtil import get_uuid


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
