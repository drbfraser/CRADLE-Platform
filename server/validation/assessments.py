from typing import Optional

from pydantic import Field, RootModel, model_validator
from typing_extensions import Self

from utils import get_current_time
from validation import CradleBaseModel


class _AssessmentExamples:
    _id_01 = "abcd1234"
    _id_02 = "efgh4567"
    _patient_id = "0123456"
    _date_assessed = 1551447833
    _diagnosis = "Patient is fine."
    _medication_prescribed_01 = "Tylenol"
    _medication_prescribed_02 = "Aspirin"
    _special_investigations = "This is some text."
    _treatment_01 = f"Take {_medication_prescribed_01} twice a day."
    _treatment_02 = f"Take {_medication_prescribed_02} twice a day."
    _follow_up_needed = True
    _follow_up_instructions_01 = f"Give lots of {_medication_prescribed_01}."
    _follow_up_instructions_02 = f"Give lots of {_medication_prescribed_02}."

    without_id = {
        "patient_id": _patient_id,
        "date_assessed": _date_assessed,
        "diagnosis": _diagnosis,
        "medication_prescribed": _medication_prescribed_01,
        "special_investigations": _special_investigations,
        "treatment": _treatment_01,
        "follow_up_needed": True,
        "follow_up_instructions": _follow_up_instructions_01,
    }
    with_id_01 = {
        "id": _id_01,
        "patient_id": _patient_id,
        "date_assessed": _date_assessed,
        "diagnosis": _diagnosis,
        "medication_prescribed": _medication_prescribed_01,
        "special_investigations": _special_investigations,
        "treatment": _treatment_01,
        "follow_up_needed": True,
        "follow_up_instructions": _follow_up_instructions_01,
    }
    with_id_02 = {
        "id": _id_02,
        "patient_id": _patient_id,
        "date_assessed": _date_assessed,
        "diagnosis": _diagnosis,
        "medication_prescribed": _medication_prescribed_02,
        "special_investigations": _special_investigations,
        "treatment": _treatment_02,
        "follow_up_needed": True,
        "follow_up_instructions": _follow_up_instructions_02,
    }
    missing_patient_id = {
        "id": _id_01,
        "date_assessed": _date_assessed,
        "diagnosis": _diagnosis,
        "medication_prescribed": _medication_prescribed_01,
        "special_investigations": _special_investigations,
        "treatment": _treatment_01,
        "follow_up_needed": True,
        "follow_up_instructions": _follow_up_instructions_01,
    }
    invalid_follow_up = {
        "id": _id_01,
        "patient_id": _patient_id,
        "date_assessed": _date_assessed,
        "diagnosis": _diagnosis,
        "medication_prescribed": _medication_prescribed_01,
        "special_investigations": _special_investigations,
        "treatment": _treatment_01,
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


class AssessmentResponse(AssessmentModel):
    model_config = dict(
        openapi_extra={
            "description": "An Assessment object.",
            "example": _AssessmentExamples.with_id_01,
        }
    )


class AssessmentListResponse(RootModel[list[AssessmentModel]]):
    model_config = dict(
        openapi_extra={
            "description": "An array of Assessment objects.",
            "example": [
                _AssessmentExamples.with_id_01,
                _AssessmentExamples.with_id_02,
            ],
        }
    )  # type: ignore[reportAssignmentType]
