from typing import Optional

from pydantic import BaseModel, Field, ValidationError, ValidationInfo, field_validator

from validation.validation_exception import ValidationExceptionError


class AssessmentValidator(BaseModel):
    date_assessed: int
    diagnosis: Optional[str] = None
    medication_prescribed: Optional[str] = None
    healthcare_worker_id: Optional[int] = None
    special_investigations: Optional[str] = None
    treatment: Optional[str] = None
    patient_id: Optional[str] = None
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

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the /api/assessments post request
        is not valid.

        :param request_body: The request body as a dict object
                            {
                                "date_assessed": 1551447833, - required
                                "diagnosis": "patient is fine",
                                "medication_prescribed": "tylenol",
                                "special_investigations": "bcccccccccddeeeff",
                                "treatment": "b",
                                "follow_up_needed": True, - required
                                "follow_up_instructions": "pls help, give lots of tylenol" - required if follow_up_needed = True
                            }
        """
        try:
            return AssessmentValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
