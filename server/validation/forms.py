from typing import Optional, Type
from data.crud import M
from validation.validate import required_keys_present, values_correct_type
from validation.questions import validate_question_post, validate_question_put


def validate_post_request(request_body: dict, model: Type[M]) -> Optional[str]:
    """
    Returns an error message if the /api/forms/responses POST request is not valid.
    Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    required_fields = ["patientId", "dateCreated", "lastEditedBy", "questions"]

    all_fields = [
        "formTemplateId",
        "lastEdited",
    ] + required_fields

    error_message = None

    error_message = required_keys_present(request_body, required_fields)
    if error_message is not None:
        return error_message

    for key in request_body:
        if key not in all_fields:
            return "The key '" + key + "' is not a valid field or is set server-side"

    error = values_correct_type(request_body, ["patientId"], str)
    if error:
        return error

    error = values_correct_type(
        request_body,
        ["formTemplateId", "dateCreated", "lastEdited", "lastEditedBy"],
        int,
    )
    if error:
        return error

    error = values_correct_type(request_body, ["questions"], list)
    if error:
        return error

    # validate questions content
    for q in request_body["questions"]:
        error = validate_question_post(q, model)
        if error:
            return "question error: " + error
        


def validate_put_request(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/forms/responses PUT request is not valid.
    Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    required_fields = ["questions"]

    error_message = None

    error_message = required_keys_present(request_body, required_fields)
    if error_message is not None:
        return error_message
    
    # validate question put content
    for q in request_body["questions"]:
        error = validate_question_put(q)
        if error:
            return "question error: " + error
