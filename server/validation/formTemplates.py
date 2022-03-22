from typing import Optional

from models import FormTemplate
from validation.validate import required_keys_present, values_correct_type
from validation.questions import validate_question_post


def validate(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/forms/templates POST or PUT request is not
    valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    required_fields = ["questions"]

    all_fields = [
        "id",
        "name",
        "category",
        "version",
    ] + required_fields

    error_message = None

    error_message = required_keys_present(request_body, required_fields)
    if error_message is not None:
        return error_message

    for key in request_body:
        if key not in all_fields:
            return "The key '" + key + "' is not a valid field or is set server-side"

    error = values_correct_type(
        request_body, ["id", "name", "category", "version"], str
    )
    if error:
        return error

    error = values_correct_type(request_body, ["questions"], list)
    if error:
        return error

    # validate questions content
    for q in request_body["questions"]:
        error = validate_question_post(q, FormTemplate)
        if error:
            return "question error: " + error
