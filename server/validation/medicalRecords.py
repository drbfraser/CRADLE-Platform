from typing import Optional

from pydantic import Field, RootModel

# from utils import get_current_time

from common.commonUtil import get_current_time

from validation import CradleBaseModel


class MedicalRecordExamples:
    date_created = 1622541428
    last_edited = 1736892283
    patient_id = "49300028162"

    medical_information = "Pregnancy induced hypertension; Started on Labetalol 200mg three times daily two weeks ago."
    drug_information = "Aspirin 75mg; Labetalol 200mg three times daily;"

    medical_record = {
        "id": 1,
        "patient_id": patient_id,
        "information": medical_information,
        "date_created": date_created,
        "last_edited": last_edited,
    }

    drug_record = {
        "id": 2,
        "patient_id": patient_id,
        "information": drug_information,
        "date_created": date_created,
        "last_edited": last_edited,
    }


# TODO: Separate DrugRecord and MedicalRecord into two different models.
class MedicalRecordModel(CradleBaseModel, extra="forbid"):
    id: Optional[int] = None
    patient_id: str
    information: str
    date_created: Optional[int] = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    is_drug_record: bool

    model_config = dict(
        openapi_extras={
            "examples": {
                "Medical Record": MedicalRecordExamples.medical_record,
                "Drug Record": MedicalRecordExamples.drug_record,
            }
        }
    )


class DrugHistory(CradleBaseModel):
    drug_history: str
    model_config = dict(
        openapi_extras={
            "example": {
                "drug_history": MedicalRecordExamples.drug_information,
            },
        }
    )


class MedicalRecordList(RootModel):
    root: list[MedicalRecordModel]
