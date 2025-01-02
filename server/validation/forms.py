from typing import List, Optional

from pydantic import Field, StrictBool, ValidationError, model_validator
from typing_extensions import Self

from utils import get_current_time
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
    date_created: int
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    last_edited_by: Optional[int] = None
    archived: Optional[StrictBool] = None

    @model_validator(mode="after")
    def validate_date_sequence(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.date_created:
            raise ValueError(
                "last_edited cannot be before date_created.",
            )
        return self

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the form in /api/forms/responses
        POST request is not valid.

        :param request_body: The request body as a dict object
        """
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
