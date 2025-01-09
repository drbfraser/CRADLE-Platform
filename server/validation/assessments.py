from typing import Optional

from pydantic import Field, model_validator
from typing_extensions import Self

from utils import get_current_time
from validation import CradleBaseModel


class _AssessmentExamples:
    without_id = {
        "patient_id": "123456",
        "date_assessed": 1551447833,
        "diagnosis": "Patient is fine.",
        "medication_prescribed": "Tylenol",
        "special_investigations": "This is some text.",
        "treatment": "Take Tylenol twice a day.",
        "follow_up_needed": True,
        "follow_up_instructions": "Give lots of Tylenol.",
    }
    with_id_01 = {
        "id": "abcd1234",
        "patient_id": "123456",
        "date_assessed": 1551447833,
        "diagnosis": "Patient is fine.",
        "medication_prescribed": "Tylenol",
        "special_investigations": "This is some text.",
        "treatment": "Take Tylenol twice a day.",
        "follow_up_needed": True,
        "follow_up_instructions": "Give lots of Tylenol.",
    }
    with_id_02 = {
        "id": "efgh4567",
        "patient_id": "123456",
        "date_assessed": 1551447834,
        "diagnosis": "Patient is fine.",
        "medication_prescribed": "Aspirin",
        "special_investigations": "This is some text.",
        "treatment": "Take Aspirin twice a day.",
        "follow_up_needed": True,
        "follow_up_instructions": "Give lots of Aspirin.",
    }
    missing_patient_id = {
        "id": "abcd1234",
        "date_assessed": 1551447833,
        "diagnosis": "Patient is fine.",
        "medication_prescribed": "Tylenol",
        "special_investigations": "This is some text.",
        "treatment": "Take Tylenol twice a day.",
        "follow_up_needed": True,
        "follow_up_instructions": "Give lots of Tylenol.",
    }
    invalid_follow_up = {
        "id": "abcd1234",
        "date_assessed": 1551447833,
        "diagnosis": "Patient is fine.",
        "medication_prescribed": "Tylenol",
        "special_investigations": "This is some text.",
        "treatment": "Take Tylenol twice a day.",
        "follow_up_needed": True,
    }


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
                "example_01": {
                    "summary": "Valid example without `id`",
                    "description": "If `id` field is not provided, it will be assigned by the server.",
                    "value": _AssessmentExamples.without_id,
                },
                "example_02": {
                    "summary": "Valid example with `id`",
                    "description": "If `id` field is provided, it must not conflict with an existing `Assessment` entity's `id`.",
                    "value": _AssessmentExamples.with_id_01,
                },
                "example_03": {
                    "summary": "Invalid example: Missing `patient_id`",
                    "description": "Missing required `patient_id` field.",
                    "value": _AssessmentExamples.missing_patient_id,
                },
                "example_04": {
                    "summary": "Invalid Example: Invalid `follow_up_needed`",
                    "description": "Field `follow_up_needed` is `true`, but `follow_up_instructions` field is missing.",
                    "value": _AssessmentExamples.invalid_follow_up,
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
                "example_01": {
                    "summary": "Valid Example",
                    "value": _AssessmentExamples.with_id_01,
                },
                "example_02": {
                    "summary": "Invalid example: Missing `patient_id`",
                    "description": "Missing required `patient_id` field.",
                    "value": _AssessmentExamples.missing_patient_id,
                },
                "example_03": {
                    "summary": "Invalid Example: Invalid `follow_up_needed`",
                    "description": "Field `follow_up_needed` is `true`, but `follow_up_instructions` field is missing.",
                    "value": _AssessmentExamples.invalid_follow_up,
                },
            },
        }
    )


class AssessmentResponseBody(AssessmentModel):
    model_config = dict(
        openapi_extra={
            "description": "Assessment Response Body",
            "example": _AssessmentExamples.with_id_01,
        }
    )


"""
`flask-openapi3 doesn't really handle raw lists, as it will only accept objects
that are derived from Pydantic's `BaseModel`. So, we must wrap any list that we
want documented inside of a Pydantic model.
"""


class AssessmentListResponseBody(CradleBaseModel):
    assessments: list[AssessmentModel]
    model_config = dict(
        openapi_extra={
            "description": "Assessment List Response Body",
            "example": {
                "assessments": [
                    _AssessmentExamples.with_id_01,
                    _AssessmentExamples.with_id_02,
                ],
            },
        }
    )
