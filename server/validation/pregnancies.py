from typing import Optional
from validation.validate import required_keys_present, values_correct_type


def validate_post_request(request_body: dict, patient_id: str) -> Optional[str]:
    """
    Returns an error message if the /api/patients/<string:patient_id>/pregnancies
    post request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "patientId": "120000", - required
                            "startDate": 1620000002, - required
                            "defaultTimeUnit": "WEEKS",
                            "endDate": 1620000002,
                            "outcome": "Mode of delivery assisted birth",
                        }
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error = required_keys_present(
        request_body,
        [
            "patientId",
            "startDate",
        ],
    )
    if error:
        return error

    error = values_correct_type(request_body, ["patientId"], int)
    if error:
        return error

    if request_body.get("patientId") != patient_id:
        return "Patient ID does not match."


def validate_put_request(request_body: dict, pregnancy_id: str) -> Optional[str]:
    """
    Returns an error message if the /api/pregnancies/<string:pregnancy_id> PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
    :param pregnancy_id: The pregnancy ID the PUT request is being made for

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error = required_keys_present(
        request_body,
        [
            "pregnancyId",
            "patientId",
            "startDate",
        ],
    )
    if error:
        return error

    error = values_correct_type(request_body, ["patientId", "pregnancyId"], int)
    if error:
        return error

    if request_body.get("pregnancyId") != pregnancy_id:
        return "Pregnancy ID does not match."
