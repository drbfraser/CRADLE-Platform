from typing import Optional

from pydantic import Field, StrictBool, model_validator
from typing_extensions import Self

from utils import get_current_time
from validation import CradleBaseModel
from validation.questions import FormQuestion, UpdateFormQuestionModel


class FormModel(CradleBaseModel, extra="forbid"):
    """Model representing a submitted Form"""

    lang: str
    patient_id: str
    questions: list[FormQuestion]
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


class UpdateFormRequestBody(CradleBaseModel, extra="forbid"):
    """
    example valid case:
    {
        "questions": [
            {
                "id":"1234-5678",
                "answers": {
                    "number": 4
                }
            }
        ]
    }
    """

    questions: list[UpdateFormQuestionModel]
