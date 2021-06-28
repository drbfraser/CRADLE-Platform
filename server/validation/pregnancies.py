from typing import Optional
from validation.validate import required_keys_present, values_correct_type


def validate_post_request(request_body: dict, patient_id: str) -> Optional[str]:
    """
    Returns an error message if the /api/patients/<string:patient_id>/pregnancies
    post request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "patientId": "120000",
                            "pregnancyStartDate": 1620000002, - required
                            "gestationalAgeUnit": "WEEKS", - required
                            "pregnancyEndDate": 1620000002,
                            "pregnancyOutcome": "Mode of delivery assisted birth",
                        }
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error = required_keys_present(
        request_body,
        [
            "pregnancyStartDate",
            "gestationalAgeUnit",
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

    if "patientId" in request_body and request_body.get("patientId") != patient_id:
        return "Patient ID does not match."


def validate_put_request(request_body: dict, pregnancy_id: str) -> Optional[str]:
    """
    Returns an error message if the /api/pregnancies/<string:pregnancy_id> PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
    :param pregnancy_id: The pregnancy ID the PUT request is being made for

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error = __validate(request_body)
    if error:
        return error

    error = values_correct_type(request_body, ["patientId", "id"], int)
    if error:
        return error

    if "id" in request_body and request_body.get("id") != pregnancy_id:
        return "Pregnancy ID cannot be changed."


def __validate(request_body):
    pregnancy_keys = [
        "id",
        "patientId",
        "pregnancyStartDate",
        "gestationalAgeUnit",
        "pregnancyEndDate",
        "pregnancyOutcome",
        "lastEdited",
        "isPregnant",
    ]

    for key in request_body:
        if key not in pregnancy_keys:
            return f"{key} is not a valid key in pregnancy."
