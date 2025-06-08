from typing import Optional

from pydantic import Field, RootModel, model_validator
from typing_extensions import Self

from common.commonUtil import get_current_time
from validation import CradleBaseModel


class AssessmentExamples:
    id_01 = "abcd1234"
    id_02 = "efgh4567"
    patient_id = "0123456"
    date_assessed = 1551447833
    diagnosis = "Patient is fine."
    medication_prescribed_01 = "Tylenol"
    medication_prescribed_02 = "Aspirin"
    special_investigations = "This is some text."
    treatment_01 = f"Take {medication_prescribed_01} twice a day."
    treatment_02 = f"Take {medication_prescribed_02} twice a day."
    follow_up_needed = True
    follow_up_instructions_01 = f"Give lots of {medication_prescribed_01}."
    follow_up_instructions_02 = f"Give lots of {medication_prescribed_02}."

    without_id = {
        "patient_id": patient_id,
        "date_assessed": date_assessed,
        "diagnosis": diagnosis,
        "medication_prescribed": medication_prescribed_01,
        "special_investigations": special_investigations,
        "treatment": treatment_01,
        "follow_up_needed": True,
        "follow_up_instructions": follow_up_instructions_01,
    }
    with_id_01 = {
        "id": id_01,
        "patient_id": patient_id,
        "date_assessed": date_assessed,
        "diagnosis": diagnosis,
        "medication_prescribed": medication_prescribed_01,
        "special_investigations": special_investigations,
        "treatment": treatment_01,
        "follow_up_needed": True,
        "follow_up_instructions": follow_up_instructions_01,
    }
    with_id_02 = {
        "id": id_02,
        "patient_id": patient_id,
        "date_assessed": date_assessed,
        "diagnosis": diagnosis,
        "medication_prescribed": medication_prescribed_02,
        "special_investigations": special_investigations,
        "treatment": treatment_02,
        "follow_up_needed": True,
        "follow_up_instructions": follow_up_instructions_02,
    }
    missing_patient_id = {
        "id": id_01,
        "date_assessed": date_assessed,
        "diagnosis": diagnosis,
        "medication_prescribed": medication_prescribed_01,
        "special_investigations": special_investigations,
        "treatment": treatment_01,
        "follow_up_needed": True,
        "follow_up_instructions": follow_up_instructions_01,
    }
    invalid_follow_up = {
        "id": id_01,
        "patient_id": patient_id,
        "date_assessed": date_assessed,
        "diagnosis": diagnosis,
        "medication_prescribed": medication_prescribed_01,
        "special_investigations": special_investigations,
        "treatment": treatment_01,
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
    id: Optional[str] = None

    model_config = dict(
        openapi_extra={
            "description": "Assessment Post Request Body",
            "examples": {
                "example_01": {
                    "summary": "Valid example without `id`",
                    "description": "If `id` field is not provided, it will be assigned by the server.",
                    "value": AssessmentExamples.without_id,
                },
                "example_02": {
                    "summary": "Valid example with `id`",
                    "description": "If `id` field is provided, it must not conflict with an existing `Assessment` entity's `id`.",
                    "value": AssessmentExamples.with_id_01,
                },
                "example_03": {
                    "summary": "Invalid example: Missing `patient_id`",
                    "description": "Missing required `patient_id` field.",
                    "value": AssessmentExamples.missing_patient_id,
                },
                "example_04": {
                    "summary": "Invalid Example: Invalid `follow_up_needed`",
                    "description": "Field `follow_up_needed` is `true`, but `follow_up_instructions` field is missing.",
                    "value": AssessmentExamples.invalid_follow_up,
                },
            },
        }
    )


class AssessmentPutBody(AssessmentModel):
    model_config = dict(
        openapi_extra={
            "description": "Assessment Put Request Body",
            "examples": {
                "example_01": {
                    "summary": "Valid Example",
                    "value": AssessmentExamples.with_id_01,
                },
                "example_02": {
                    "summary": "Invalid example: Missing `patient_id`",
                    "description": "Missing required `patient_id` field.",
                    "value": AssessmentExamples.missing_patient_id,
                },
                "example_03": {
                    "summary": "Invalid Example: Invalid `follow_up_needed`",
                    "description": "Field `follow_up_needed` is `true`, but `follow_up_instructions` field is missing.",
                    "value": AssessmentExamples.invalid_follow_up,
                },
            },
        }
    )


class AssessmentResponse(AssessmentModel):
    model_config = dict(
        openapi_extra={
            "description": "An Assessment object.",
            "example": AssessmentExamples.with_id_01,
        }
    )


class AssessmentList(RootModel[list[AssessmentModel]]):
    model_config = dict(
        openapi_extra={
            "description": "An array of Assessment objects.",
            "example": [
                AssessmentExamples.with_id_01,
                AssessmentExamples.with_id_02,
            ],
        }
    )  # type: ignore[reportAssignmentType]
