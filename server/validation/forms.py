from typing import Optional

from models import Form
from validation.validate import required_keys_present, values_correct_type, check_invalid_keys_present, force_consistent_keys
from validation.questions import validate_form_question_post, validate_form_question_put

def validate_form(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the form part in /api/forms/responses POST request is 
    not valid. Else, returns None.

    :param request_body: The request body as a dict object 

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    required_fields = [
        "lang",
        "name",
        "category",
        "patientId",
        "questions",
    ]

    all_fields = [
        "id",
        "formTemplateId",
        "dateCreated",
        "lastEdited",
        "lastEditedBy"
    ] + required_fields

    error_message = None 

    error_message = required_keys_present(request_body, required_fields)
    if error_message is not None:
        return error_message

    error_message = check_invalid_keys_present(request_body, all_fields)
    if error_message is not None:
        return error_message
    
    error = values_correct_type(
        request_body, ["id", "lang", "name", "category", "patientId", "formTemplateId"], str
    )
    if error:
        return error
    
    error = values_correct_type(
        request_body, ["dateCreated", "lastEdited", "lastEditedBy"], int
    )
    if error:
        return error
    
    error = values_correct_type(request_body, ["questions"], list)
    if error:
        return error

def validate_questions(request_body: list) -> Optional[str]:
    """
    Returns an error message if the questions part in /api/forms/responses POST request
    is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    # validate each question
    for q in request_body:
        error = validate_form_question_post(q)
        if error:
            return error

def validate_put_request(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/forms/responses PUT request is not valid.
    Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.

    example valid case:
    {
        "questions": [
            {
                "id":"asdsd-1123123",
                "answers": {
                    "number": 4
                }
            }
        ]
    }
    """
    force_fields = ["questions"]

    error_message = None

    error_message = force_consistent_keys(request_body, force_fields)
    if error_message is not None:
        return error_message

    # validate question put content
    for q in request_body["questions"]:
        error = validate_form_question_put(q)
        if error:
            return "question error: " + error
