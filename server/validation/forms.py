from typing import List, Optional

from pydantic import StrictBool, ValidationError

from validation import CradleBaseModel
from validation.questions import FormQuestionPutValidator, FormQuestionValidator
from validation.validation_exception import ValidationExceptionError


class FormValidator(CradleBaseModel, extra="forbid"):
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
            "date_created" in request_body
            and request_body.get("date_created") is not None
            and isinstance(request_body.get("date_created"), int)
            and "last_edited" in request_body
            and request_body.get("last_edited") is not None
            and isinstance(request_body.get("last_edited"), int)
        ):
            start_date = request_body["date_created"]
            end_date = request_body["last_edited"]
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


class FormPutValidator(CradleBaseModel, extra="forbid"):
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
