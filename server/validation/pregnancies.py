from typing import Optional

from pydantic import Field, RootModel, model_validator
from typing_extensions import Self

# from utils import get_current_time

from common.commonUtil import get_current_time

from validation import CradleBaseModel


class PregnancyModel(CradleBaseModel, extra="forbid"):
    """
    {
        "patient_id": 120000,
        "start_date": 1620000002,
        "end_date": 1620000002,
        "outcome": "Mode of delivery: assisted birth",
    }
    """

    id: Optional[int] = None
    patient_id: str
    start_date: int
    end_date: Optional[int] = None
    outcome: Optional[str] = None
    last_edited: int = Field(default_factory=get_current_time)

    @model_validator(mode="after")
    def validate_date_sequence(self) -> Self:
        if (self.end_date is not None) and (self.start_date > self.end_date):
            raise ValueError("Pregnancy end date cannot be before the start date.")
        return self


class PregnancyList(RootModel):
    root: list[PregnancyModel]
