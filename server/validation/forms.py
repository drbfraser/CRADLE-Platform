from typing import List, Optional

from flask_restful import abort
from pydantic import BaseModel, StrictBool, ValidationError

from data import crud
from models import Form
from validation.questions import FormQuestionPutValidator, FormQuestionValidator
from validation.validation_exception import ValidationExceptionError


class FormValidator(BaseModel):
    lang: str
    patientId: str
    questions: List[FormQuestionValidator]
    id: Optional[str] = None
    formTemplateId: Optional[str] = None
    formClassificationId: Optional[str] = None
    dateCreated: Optional[int] = None
    lastEdited: Optional[int] = None
    lastEditedBy: Optional[int] = None
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
        if request_body.get("id") is not None:
            if crud.read(Form, id=request_body["id"]):
                abort(409, message="Form already exists")

        try:
            return FormValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class FormPutValidator(BaseModel):
    questions: List[FormQuestionPutValidator]

    class Config:
        extra = "forbid"

    @staticmethod
    def validate(request_body: dict):
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
        try:
            return FormPutValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
