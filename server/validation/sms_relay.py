from typing import Optional
from validation.validate import required_keys_present, values_correct_type


def validate_request(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/sms_relay POST
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    sms_relay_keys = [
        "phoneNumber",
        "encryptedData",
    ]

    for key in request_body:
        if key not in sms_relay_keys:
            return f"{key} is not a valid key in sms relay."
