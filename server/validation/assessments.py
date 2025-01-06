from typing import Optional

from pydantic import Field, ValidationInfo, field_validator

from utils import get_current_time
from validation import CradleBaseModel


class AssessmentValidator(CradleBaseModel):
    """
    {
        "patient_id": "123456"
        "date_assessed": 1551447833,
        "diagnosis": "Patient is fine.",
        "medication_prescribed": "Tylenol",
        "special_investigations": "This is some text.",
        "treatment": "Take Tylenol twice a day.",
        "follow_up_needed": true,
        "follow_up_instructions": "Give lots of tylenol." - required if follow_up_needed = True
    }
    """

    id: Optional[str] = None
    date_assessed: int = Field(default_factory=lambda: get_current_time())
    diagnosis: Optional[str] = None
    medication_prescribed: Optional[str] = None
    healthcare_worker_id: Optional[int] = None
    special_investigations: Optional[str] = None
    treatment: Optional[str] = None
    patient_id: str
    follow_up_needed: bool
    follow_up_instructions: Optional[str] = Field(
        default=None,
        description="Required if follow_up_needed is True",
    )

    @field_validator("follow_up_instructions", mode="before")
    @classmethod
    def __check_followup_instructions(
        cls,
        follow_up_instructions,
        values: ValidationInfo,
    ):
        follow_up_needed = values.data.get("follow_up_needed", False)
        if follow_up_needed and (
            follow_up_instructions is None or follow_up_instructions == ""
        ):
            raise ValueError(
                "follow_up_instructions must be provided if follow_up_needed is True",
            )
        return follow_up_instructions
