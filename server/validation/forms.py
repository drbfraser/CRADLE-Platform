from typing import List, Optional

from pydantic import BaseModel, ValidationError, StrictBool

from validation.questions import FormQuestion, FormQuestionPut
from validation.questions import validate_form_question_post, validate_form_question_put
from validation.validate import (
    force_consistent_keys,
)


class Form(BaseModel):
    id: Optional[str] = None
    lang: str
    patientId: str
    formTemplateId: Optional[str] = None
    formClassificationId: Optional[str] = None
    dateCreated: Optional[int] = None
    lastEdited: Optional[int] = None
    lastEditedBy: Optional[int] = None
    archived: Optional[StrictBool]
    questions: List[FormQuestion]

    class Config:
        extra = "forbid"


def validate_form(request_body: dict) -> Optional[str]:
    """
    Returns an error message if both the form and question parts in /api/forms/responses
    POST request is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    try:
        Form(**request_body)
    except ValidationError as e:
        return str(e)
    return None


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
        validate_form_question_put(q)
