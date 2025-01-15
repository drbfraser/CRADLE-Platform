from typing import Optional

from pydantic import Field, RootModel

from utils import get_current_time
from validation import CradleBaseModel


class MedicalRecordExamples:
    date_created = 1622541428
    last_edited = 1736892283

    medical_record = {
        "information": "Pregnancy induced hypertension; Started on Labetalol 200mg three times daily two weeks ago."
    }


# TODO: Separate DrugRecord and MedicalRecord into two different models.
class MedicalRecordModel(CradleBaseModel, extra="forbid"):
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

    date_created: Optional[int] = Field(default_factory=get_current_time)
    last_edited: Optional[int] = None

    model_config = dict(openapi_extras={"examples": {}})


class DrugHistory(CradleBaseModel):
    drug_history: str


class MedicalRecordList(RootModel):
    root: list[MedicalRecordModel]
