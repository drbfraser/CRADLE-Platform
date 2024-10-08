from typing import Optional

from pydantic import BaseModel, Field, ValidationError, ValidationInfo, field_validator


class Assessment(BaseModel):
    dateAssessed: int
    diagnosis: str
    medicationPrescribed: str
    healthcareWorkerId: int
    specialInvestigations: str
    treatment: str
    patientId: str
    followupNeeded: bool
    followupInstructions: Optional[str] = Field(
        default=None,
        description="Required if followupNeeded is True",
    )

    @field_validator("followupInstructions", mode="before")
    def check_followup_instructions(cls, followup_instructions, values: ValidationInfo):
        followup_needed = values.data.get("followupNeeded", False)
        if followup_needed and (
            followup_instructions is None or followup_instructions == ""
        ):
            raise ValueError(
                "followupInstructions must be provided if followupNeeded is True",
            )
        return followup_instructions


def validate(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/assessments post request
    is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "dateAssessed": 1551447833, - required
                            "diagnosis": "patient is fine",
                            "medicationPrescribed": "tylenol",
                            "specialInvestigations": "bcccccccccddeeeff",
                            "treatment": "b",
                            "followupNeeded": True, - required
                            "followupInstructions": "pls help, give lots of tylenol" - required if followupNeeded = True
                        }

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    try:
        Assessment(**request_body)
    except ValidationError as e:
        return str(e)
    return None
