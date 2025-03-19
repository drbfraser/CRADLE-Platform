from typing import Optional

from pydantic import Field, RootModel, StrictBool, model_validator, conint
from typing_extensions import Self

from utils import get_current_time
from validation import CradleBaseModel
from validation.questions import FormQuestion, UpdateFormQuestion


class FormQuestion(CradleBaseModel):
    """Model representing a single question in the form"""

    id: Optional[str] = None
    question_text: str
    question_type: str  # Could be "integer", "string", etc.
    required: Optional[bool] = False  # New field: is this field required?
    min_value: Optional[int] = None  # New: Minimum allowed value
    max_value: Optional[int] = None  # New: Maximum allowed value
    units: Optional[str] = None  # New: Measurement units (e.g., kg, cm)
    answer: Optional[dict] = None

    @model_validator(mode="after")
    def validate_number_constraints(self) -> Self:
        """Ensure number constraints are properly enforced."""
        if self.question_type == "integer" and self.answer is not None:
            if "number" in self.answer:
                value = self.answer["number"]
                if self.min_value is not None and value < self.min_value:
                    raise ValueError(f"Value must be at least {self.min_value}.")
                if self.max_value is not None and value > self.max_value:
                    raise ValueError(f"Value must not exceed {self.max_value}.")
        return self


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
    """Request body for updating a submitted Form"""

    questions: list[UpdateFormQuestion]


class FormList(RootModel):
    root: list[FormModel]
