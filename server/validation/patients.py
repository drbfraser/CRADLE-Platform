from datetime import datetime
from typing import Any, List, Optional

from pydantic import Field, field_validator

from utils import get_current_time
from validation import CradleBaseModel
from validation.readings import ReadingValidator


class PatientValidator(CradleBaseModel):
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
        "pregnancy_start_date": 1587068710, - required if is_pregnant = True
        "drug_history": "too much tylenol",
        "medical_history": "not enough advil",
        "allergy": "seafood",
        "is_archived": false
    }
    """

    id: str
    name: str
    sex: str
    date_of_birth: str
    is_exact_date_of_birth: bool
    is_pregnant: Optional[bool] = False
    household_number: Optional[str] = None
    zone: Optional[str] = None
    village_number: Optional[str] = None
    drug_history: Optional[str] = None
    medical_history: Optional[str] = None
    allergy: Optional[str] = None
    is_archived: bool = False
    last_edited: Optional[int] = None

    @field_validator("id", mode="after")
    @classmethod
    def check_patient_id_length(cls, patient_id):
        if patient_id is None:
            return None
        if len(patient_id) > 14:
            raise ValueError("id is too long. Max is 14 digits.")
        return patient_id

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def validate_date_format(cls, date_of_birth):
        if date_of_birth and not is_correct_date_format(date_of_birth):
            raise ValueError("date_of_birth is not in the required YYYY-MM-DD format.")
        return date_of_birth


class PatientPostValidator(PatientValidator):
    readings: Optional[List[ReadingValidator]] = None


class PatientPutValidator(PatientValidator, extra="forbid"):
    last_edited: int = Field(default_factory=get_current_time)
    base: Optional[int] = None


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


class PatientSyncValidator(PatientValidator):
    """
    The mobile app stores pregnancy information inside of the Patient model.
    We should really refactor that at some point. For now, the body of the sync
    request will contain both patient and pregnancy data.
    """

    base: Optional[int] = None
    pregnancy_start_date: Optional[int] = None
    pregnancy_end_date: Optional[int] = None
    pregnancy_outcome: Optional[str] = None
    pregnancy_id: Optional[int] = None
    medical_last_edited: Optional[int] = None
    drug_last_edited: Optional[int] = None
