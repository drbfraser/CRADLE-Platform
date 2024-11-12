from typing import List, Optional

from pydantic import BaseModel, StrictBool, ValidationError

from validation.questions import FormQuestionPutValidator, FormQuestionValidator
from validation.validate import (
    force_consistent_keys,
)
from validation.validation_exception import ValidationExceptionError


class FormValidator(BaseModel):
    lang: str
    patient_id: str
    questions: List[FormQuestionValidator]
    id: Optional[str] = None
    form_template_id: Optional[str] = None
    form_classification_id: Optional[str] = None
    date_created: Optional[int] = None
    last_edited: Optional[int] = None
    last_edited_by: Optional[int] = None
    archived: Optional[StrictBool] = None

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the form in /api/forms/responses
        POST request is not valid.

        :param request_body: The request body as a dict object
        """
        try:
            FormValidator(**request_body)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

    @staticmethod
    def validate_questions(request_body: list):
        """
        Raises an error if the questions part in /api/forms/responses POST request
        is not valid.

        :param request_body: The request body as a dict object
        """
        # validate each question
        for q in request_body:
            FormQuestionValidator.validate(q)

    @staticmethod
    def validate_put_request(request_body: dict):
        """
        Raises an error if the /api/forms/responses PUT request is not valid.

        :param request_body: The request body as a dict object

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
            FormQuestionPutValidator.validate(q)
