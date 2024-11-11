from typing import List, Optional

from pydantic import BaseModel, StrictBool, ValidationError

from validation.questions import (
    FormQuestion,
    validate_form_question_post,
    validate_form_question_put,
)
from validation.validate import (
    force_consistent_keys,
)
from validation.validation_exception import ValidationExceptionError


class Form(BaseModel):
    lang: str
    patient_id: str
    questions: List[FormQuestion]
    id: Optional[str] = None
    form_template_id: Optional[str] = None
    form_classification_id: Optional[str] = None
    date_created: Optional[int] = None
    last_edited: Optional[int] = None
    last_edited_by: Optional[int] = None
    archived: Optional[StrictBool] = None

    class Config:
        extra = "forbid"


def validate_form(request_body: dict):
    """
    Returns an error message if the form in /api/forms/responses
    POST request is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    try:
        Form(**request_body)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))


def validate_questions(request_body: list):
    """
    Returns an error message if the questions part in /api/forms/responses POST request
    is not valid. Else, returns None.

    :param request_body: The request body as a dict object

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    # validate each question
    for q in request_body:
        validate_form_question_post(q)


def validate_put_request(request_body: dict):
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
        raise ValidationExceptionError(str(error_message))

    # validate question put content
    for q in request_body["questions"]:
        validate_form_question_put(q)
