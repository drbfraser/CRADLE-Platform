from typing import Optional
from validation.validate import required_keys_present, values_correct_type


def validate_post_request(request_body: dict, patient_id: str) -> Optional[str]:
    """
    Returns an error message if the /api/patients/<string:patient_id>/pregnancies
    post request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "patientId": "120000", - required
                            "information": "Aspirin 75mg", - required
                            "isDrugRecord": True, - required
                        }
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error = required_keys_present(
        request_body,
        [
            "patientId",
            "information",
            "isDrugRecord",
        ],
    )
    if error:
        return error

    error = __validate(request_body)
    if error:
        return error

    error = values_correct_type(request_body, ["patientId"], int)
    if error:
        return error

    if request_body.get("patientId") != patient_id:
        return "Patient ID does not match."


def validate_put_request(request_body: dict, record_id: str) -> Optional[str]:
    """
    Returns an error message if the /api/medical_records/<string:record_id> PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
    :param record_id: The medical record ID the PUT request is being made for

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error = __validate(request_body)
    if error:
        return error

    error = values_correct_type(request_body, ["patientId", "id"], int)
    if error:
        return error

    if "id" in request_body and request_body.get("id") != record_id:
        return "Medical record ID cannot be changed."


def __validate(request_body):
    record_keys = [
        "id",
        "patientId",
        "information",
        "isDrugRecord",
        "dateCreated",
        "lastEdited",
    ]

    for key in request_body:
        if key not in record_keys:
            return f"{key} is not a valid key in medical record."
