from typing import Optional

from pydantic import RootModel, model_validator
from typing_extensions import Self

from validation import CradleBaseModel


class PregnancyBase(CradleBaseModel):
    patient_id: str
    start_date: int
    end_date: Optional[int] = None
    outcome: Optional[str] = None

    @model_validator(mode="after")
    def validate_date_sequence(self) -> Self:
        """Raise if pregnancy end_date is before start_date."""
        if (self.end_date is not None) and (self.start_date > self.end_date):
            raise ValueError("Pregnancy end date cannot be before the start date.")
        return self


class PregnancyRequest(PregnancyBase):
    """
    {
        "patient_id": 120000,
        "start_date": 1620000002,
        "end_date": 1620000002,
        "outcome": "Mode of delivery: assisted birth",
    }
    """


class PregnancyResponse(PregnancyBase):
    id: Optional[int] = None
    last_edited: Optional[int] = None


class PregnancyList(RootModel):
    root: list[PregnancyResponse]
