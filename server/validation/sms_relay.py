from typing import Optional

from validation.validate import (
    check_invalid_keys_present,
    required_keys_present,
    values_correct_type,
)


def validate_request(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/sms_relay POST
    request is not valid. Else, returns None.
    :param request_body: The request body as a dict object
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    required_keys = ["phoneNumber", "encryptedData"]

    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    error_message = check_invalid_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    error_message = values_correct_type(
        request_body, ["phoneNumber", "encryptedData"], str
    )
    if error_message is not None:
        return error_message

    return error_message


def validate_decrypted_body(body: dict) -> Optional[str]:
    """
    Returns an error message if the sms relay body
    is not valid. Else, returns None.
    :param body: The sms relay body as a dict object
    :return: An error message if body in invalid in some way. None otherwise.
    """
    required_keys = ["requestNumber", "method", "endpoint"]

    error_message = required_keys_present(body, required_keys)
    if error_message is not None:
        return error_message

    all_keys = ["requestNumber", "method", "endpoint", "headers", "body"]

    error_message = check_invalid_keys_present(body, all_keys)
    if error_message is not None:
        return error_message

    error_message = values_correct_type(body, ["method", "endpoint"], str)
    if error_message is not None:
        return error_message

    error_message = values_correct_type(body, ["requestNumber"], int)
    if error_message is not None:
        return error_message

    return error_message
