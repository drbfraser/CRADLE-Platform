from typing import Optional

from validation.validate import required_keys_present, values_correct_type


def validate_post_request(request_body: dict, patient_id: str) -> Optional[str]:
    """
    Returns an error message if the /api/patients/<string:patient_id>/pregnancies
    post request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "patient_id": "120000",
                            "medical_history" or "drug_history": "Aspirin 75mg", - required
                        }
    :param patient_id: The id of the patient, used to validate request_body input
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error = __validate(request_body)
    if error:
        return error

    # if drug_history is not present, then we check if medical_history is not present
    # if both are not present, then return an error
    if required_keys_present(request_body, ["drug_history"]):
        error = required_keys_present(request_body, ["medical_history"])
        if error:
            return error

    error = values_correct_type(request_body, ["medical_history", "drug_history"], str)
    if error:
        return error

    error = values_correct_type(request_body, ["patient_id"], int)
    if error:
        return error

    if "patient_id" in request_body and request_body.get("patient_id") != patient_id:
        return "Patient ID does not match."


def validate_put_request(request_body: dict, record_id: str) -> Optional[str]:
    """
    Returns an error message if the /api/medical_records/<string:record_id> PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
    :param record_id: The medical record ID the PUT request is being made for

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    error = __validate(request_body)
    if error:
        return error

    error = values_correct_type(request_body, ["medical_history", "drug_history"], str)
    if error:
        return error

    if "id" in request_body and request_body.get("id") != record_id:
        return "Medical record ID cannot be changed."


def __validate(request_body):
    record_keys = [
        "id",
        "patient_id",
        "medical_history",
        "drug_history",
        "date_created",
        "last_edited",
    ]

    for key in request_body:
        if key not in record_keys:
            return f"{key} is not a valid key in medical record."
