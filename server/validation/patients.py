from datetime import datetime
from typing import Any, Optional

from pydantic import Field, RootModel, field_validator

from enums import SexEnum
# from utils import get_current_time
from common.commonUtil import get_current_time


from validation import CradleBaseModel
from validation.readings import ReadingWithUrineTest
from validation.referrals import ReferralModel


class PatientModel(CradleBaseModel):
    """
    {
        "id": "123456",
        "name": "Jane Doe",
        "is_pregnant": true,
        "sex": "FEMALE",
        "date_of_birth": "1990-05-30",
        "is_exact_date_of_birth: false
        "household_number": "20",
        "zone": "15",
        "village_number": "50",
        "pregnancy_start_date": 1587068710,
        "drug_history": "too much tylenol",
        "medical_history": "not enough advil",
        "allergy": "seafood",
        "is_archived": false
    }
    """

    id: Optional[str] = None
    name: str
    sex: SexEnum
    date_of_birth: str
    is_exact_date_of_birth: bool
    is_pregnant: Optional[bool] = False
    household_number: Optional[str] = None
    zone: Optional[str] = None
    village_number: Optional[str] = None
    is_archived: Optional[bool] = None
    last_edited: Optional[int] = None
    date_created: Optional[int] = None
    base: Optional[int] = None

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def validate_date_format(cls, date_of_birth):
        if date_of_birth and not is_correct_date_format(date_of_birth):
            raise ValueError("date_of_birth is not in the required YYYY-MM-DD format.")
        return date_of_birth


class PatientWithPregnancy(PatientModel):
    pregnancy_start_date: Optional[int] = None
    pregnancy_end_date: Optional[int] = None
    pregnancy_outcome: Optional[str] = None
    pregnancy_id: Optional[int] = None


class PatientWithHistory(PatientWithPregnancy):
    drug_history: Optional[str] = None
    medical_history: Optional[str] = None
    allergy: Optional[str] = None
    medical_last_edited: Optional[int] = None
    drug_last_edited: Optional[int] = None


class UpdatePatientRequestBody(PatientModel, extra="forbid"):
    """Request Body for Update Patient Endpoint"""

    last_edited: int = Field(default_factory=get_current_time)


def is_correct_date_format(s: Any) -> bool:
    """
    Checks if a value is in the YYYY-mm-dd format.

    :param s: The value to check
    :return: Returns True if the passed in value is an integer, False otherwise
    """
    try:
        datetime.strptime(s, "%Y-%m-%d").strftime("%Y-%m-%d")
        return True
    except ValueError:
        return False


class NestedPatient(PatientWithHistory):
    readings: list[ReadingWithUrineTest] = []
    referrals: list[ReferralModel] = []
    medical_history_id: Optional[str] = None
    drug_history_id: Optional[str] = None


class NestedPatientList(RootModel):
    root: list[NestedPatient]
