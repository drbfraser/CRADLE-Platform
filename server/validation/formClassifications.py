from typing import Optional

from validation.validate import (
    check_invalid_keys_present,
    required_keys_present,
    values_correct_type,
)
from validation.questions import validate_template_question_post
from service import questionTree


def validate_template(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the classification part in /api/forms/classifications POST or PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    required_fields = ["name"]

    all_fields = ["id"] + required_fields

    error_message = None

    error_message = required_keys_present(request_body, required_fields)
    if error_message is not None:
        return error_message

    error_message = check_invalid_keys_present(request_body, all_fields)
    if error_message is not None:
        return error_message

    error = values_correct_type(request_body, ["id", "name"], str)
    if error:
        return error
