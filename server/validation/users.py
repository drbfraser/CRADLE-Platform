from typing import Optional

from validation.validate import required_keys_present, values_correct_type


def validate(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/user post or put request
    is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "firstName": "Jane",
                            "email": "jane@mail.com",
                            "healthFacilityName": "facility7",
                            "role": "admin"
                        }
    :return: An error message if the request body is invalid. None otherwise
    """

    error_message = None

    # Check if required keys are present
    required_keys = [
        "firstName",
        "email",
        "healthFacilityName",
        "role",
    ]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # Check that field types are correct
    error_message = values_correct_type(
        request_body, ["firstName", "email", "healthFacilityName", "role"], str
    )
    if error_message is not None:
        return error_message

    return error_message
