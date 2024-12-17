from typing import List, Optional

from pydantic import BaseModel, StrictBool, ValidationError

from validation.questions import FormQuestionPutValidator, FormQuestionValidator
from validation.validation_exception import ValidationExceptionError


class FormValidator(BaseModel, extra="forbid"):
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

    @staticmethod
    def validate_date_sequence(request_body: dict):
        if (
            "dateCreated" in request_body
            and request_body.get("dateCreated") is not None
            and isinstance(request_body.get("dateCreated"), int)
            and "lastEdited" in request_body
            and request_body.get("lastEdited") is not None
            and isinstance(request_body.get("lastEdited"), int)
        ):
            start_date = request_body["dateCreated"]
            end_date = request_body["lastEdited"]
            if start_date > end_date:
                raise ValidationExceptionError(
                    "Form created date must occur before its last edited date.",
                )

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the form in /api/forms/responses
        POST request is not valid.

        :param request_body: The request body as a dict object
        """
        FormValidator.validate_date_sequence(request_body)
        try:
            return FormValidator(**request_body)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class FormPutValidator(BaseModel, extra="forbid"):
    questions: List[FormQuestionPutValidator]

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
