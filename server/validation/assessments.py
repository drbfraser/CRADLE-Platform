from typing import Optional

from pydantic import Field, model_validator
from typing_extensions import Self

from utils import get_current_time
from validation import CradleBaseModel


class AssessmentModel(CradleBaseModel):
    id: str
    patient_id: str
    date_assessed: int = Field(default_factory=lambda: get_current_time())
    diagnosis: Optional[str] = None
    medication_prescribed: Optional[str] = None
    healthcare_worker_id: Optional[int] = None
    special_investigations: Optional[str] = None
    treatment: Optional[str] = None
    follow_up_needed: bool
    follow_up_instructions: Optional[str] = Field(
        default=None,
        description="Required if follow_up_needed is True",
    )

    @model_validator(mode="after")
    def __check_follow_up_instructions(self) -> Self:
        if self.follow_up_needed and (
            self.follow_up_instructions is None or self.follow_up_instructions == ""
        ):
            raise ValueError(
                "follow_up_instructions must be provided if follow_up_needed is True.",
            )
        return self


class AssessmentPostBody(AssessmentModel):
    model_config = dict(
        openapi_extra={
            "description": "Assessment Post Request Body",
            "examples": {
                "01_valid_example": {
                    "summary": "Valid Example",
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
                    "summary": "Invalid Example",
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
                    "summary": "Invalid Example",
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


class AssessmentPutBody(AssessmentModel):
    model_config = dict(
        openapi_extra={
            "description": "Assessment Put Request Body",
            "examples": {
                "01_valid_example": {
                    "summary": "Valid Example",
                    "value": {
                        "id": "45678",
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
                    "summary": "Invalid Example",
                    "description": "Missing required `patient_id` field.",
                    "value": {
                        "id": "45678",
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
                    "summary": "Invalid Example",
                    "description": "Field `follow_up_needed` is `true`, but `follow_up_instructions` field is missing.",
                    "value": {
                        "id": "45678",
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
