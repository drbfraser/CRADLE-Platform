from datetime import datetime
from typing import Any, List, Optional

from pydantic import Field, ValidationError, field_validator

from utils import get_current_time
from validation import CradleBaseModel
from validation.readings import ReadingValidator
from validation.validation_exception import ValidationExceptionError


class PatientValidator(CradleBaseModel):
    id: str
    name: str
    sex: str
    date_of_birth: str
    is_exact_date_of_birth: bool
    is_pregnant: bool = False
    household_number: Optional[str] = None
    zone: Optional[str] = None
    village_number: Optional[str] = None
    drug_history: Optional[str] = None
    medical_history: Optional[str] = None
    allergy: Optional[str] = None
    is_archived: bool = False

    @field_validator("id", mode="after")
    @classmethod
    def check_patient_id_length(cls, patient_id):
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

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the /api/patients post request
        is not valid.

        :param request_body: The request body as a dict object
                            {
                                "id": "123456", - required
                                "name": "testName", - required
                                "is_pregnant": True, - required
                                "sex": "FEMALE", - required
                                "date_of_birth": "1990-05-30", - required
                                "is_exact_date_of_birth: false - required
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
        try:
            return PatientPostValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class PatientPutValidator(PatientValidator, extra="forbid"):
    last_edited: int = Field(default_factory=get_current_time)
    base: Optional[int] = None

    @staticmethod
    def validate(request_body: dict, patient_id):
        """
        Raises an error if the /api/patients/<string:patient_id>/info PUT
        request is not valid. Else, returns None.

        :param request_body: The request body as a dict object
        :param patient_id: The patient ID the PUT request is being made for
        """
        try:
            patient = PatientPutValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

        if patient.id and patient.id != patient_id:
            raise ValidationExceptionError("Patient ID cannot be changed.")

        return patient


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
