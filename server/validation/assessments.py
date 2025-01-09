from typing import Optional

from pydantic import Field, ValidationInfo, field_validator

from utils import get_current_time
from validation import CradleBaseModel


class AssessmentPostBody(CradleBaseModel):
    model_config = dict(
        openapi_extra={
            "description": "Assessment Post Body",
            "examples": {
                "01_valid_example": {
                    "summary": "Valid Assessment Post Body",
                    "value": {
                        "patient_id": "123456",
                        "date_assessed": 1551447833,
                        "diagnosis": "Patient is fine.",
                        "medication_prescribed": "Tylenol",
                        "special_investigations": "This is some text.",
                        "treatment": "Take Tylenol twice a day.",
                        "follow_up_needed": True,
                        "follow_up_instructions": "Give lots of tylenol.",
                    },
                },
                "02_invalid_example": {
                    "summary": "Invalid Assessment Post Body",
                    "description": "Missing required `patient_id` field.",
                    "value": {
                        "date_assessed": 1551447833,
                        "diagnosis": "Patient is fine.",
                        "medication_prescribed": "Tylenol",
                        "special_investigations": "This is some text.",
                        "treatment": "Take Tylenol twice a day.",
                        "follow_up_needed": True,
                        "follow_up_instructions": "Give lots of tylenol.",
                    },
                },
                "03_invalid_example": {
                    "summary": "Invalid Assessment Post Body",
                    "description": "Field `follow_up_needed` is `true`, but `follow_up_instructions` field is missing.",
                    "value": {
                        "patient_id": "123456",
                        "date_assessed": 1551447833,
                        "diagnosis": "Patient is fine.",
                        "medication_prescribed": "Tylenol",
                        "special_investigations": "This is some text.",
                        "treatment": "Take Tylenol twice a day.",
                        "follow_up_needed": True,
                    },
                },
            },
        }
    )

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
    def __check_follow_up_instructions(
        cls,
        follow_up_instructions,
        values: ValidationInfo,
    ):
        follow_up_needed = values.data.get("follow_up_needed", False)
        if follow_up_needed and (
            follow_up_instructions is None or follow_up_instructions == ""
        ):
            raise ValueError(
                "follow_up_instructions must be provided if follow_up_needed is True.",
            )
        return follow_up_instructions
