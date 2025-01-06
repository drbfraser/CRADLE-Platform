from typing import Optional

from pydantic import Field, model_validator
from typing_extensions import Self

from utils import get_current_time
from validation import CradleBaseModel


# TODO: Separate DrugRecord and MedicalRecord into two different models.
class MedicalRecordValidator(CradleBaseModel, extra="forbid"):
    """
    {
        "patient_id": "120000",
        "medical_history": "Sprained ankle",
    }
    {
        "patient_id": "120000",
        "drug_history": "Aspirin 75mg"
    }
    """

    id: Optional[int] = None
    patient_id: str
    medical_history: Optional[str] = None
    drug_history: Optional[str] = None
    date_created: Optional[int] = Field(default_factory=get_current_time)
    last_edited: Optional[int] = None

    @model_validator(mode="after")
    def validate_histories(self) -> Self:
        if self.drug_history is None and self.medical_history is None:
            raise ValueError(
                "Either 'medical_history' or 'drug_history' must be present.",
            )
        return self
