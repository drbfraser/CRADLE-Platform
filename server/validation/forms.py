from typing import Optional

from pydantic import Field, RootModel, StrictBool, model_validator
from typing_extensions import Self

from utils import get_current_time
from validation import CradleBaseModel
from validation.questions import FormQuestion, UpdateFormQuestion


class FormModel(CradleBaseModel, extra="forbid"):
    """Model representing a submitted Form"""

    lang: str
    patient_id: str
    questions: list[FormQuestion]
    id: Optional[str] = None
    form_template_id: Optional[str] = None
    form_classification_id: Optional[str] = None
    # I don't see why this date_created field is required. We save the date for when a template was created, but this
    # is a submission, not a template. This is the same as last_edited. Plus, in /resources/forms.py submit_form(), we set
    # date_created = get_current_time(). But because of this date_created being required and not having a default*,
    # I get a failure when I try to submit a form through web app. I'm adding a default for this for now, but 
    # we could possibly just remove this.  
    date_created: int = Field(default_factory=get_current_time)
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
    """Request body for updating a submitted Form"""

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
    questions: list[UpdateFormQuestion]


class FormList(RootModel):
    root: list[FormModel]
