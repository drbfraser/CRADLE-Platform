from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, ValidationError, field_validator, model_validator

from validation.validation_exception import ValidationExceptionError


class PatientPostValidator(BaseModel):
    patientId: str
    patientName: str
    patientSex: str
    dob: str
    isExactDob: bool
    isPregnant: bool
    householdNumber: Optional[str] = None
    zone: Optional[str] = None
    villageNumber: Optional[str] = None
    pregnancyStartDate: Optional[int] = None
    gestationalAgeUnit: Optional[str] = None
    drugHistory: Optional[str] = None
    medicalHistory: Optional[str] = None
    allergy: Optional[str] = None
    isArchived: Optional[bool] = False

    @field_validator("patientId", mode="before")
    @classmethod
    def check_patient_id_length(cls, patient_id):
        if len(patient_id) > 14:
            raise ValueError("patientId is too long. Max is 14 digits.")
        return patient_id

    @model_validator(mode="before")
    @classmethod
    def validate_is_pregnant_field(cls, values):
        is_pregnant = values.get("isPregnant")
        if is_pregnant:
            if not values.get("pregnancyStartDate") or not values.get("gestationalAgeUnit"):
                raise ValueError(
                    "If isPregnant is True, pregnancyStartDate and gestationalAgeUnit are required.",
                )
        return values

    @field_validator("pregnancyStartDate", mode="before")
    @classmethod
    def validate_pregnancy_start_date_field(cls, pregnancy_start_date):
        if pregnancy_start_date:
            error = check_gestational_age_under_limit(pregnancy_start_date)
            if error:
                raise ValueError(error)
        return pregnancy_start_date

    @field_validator("dob", mode="before")
    @classmethod
    def validate_date_format(cls, dob):
        if dob and not is_correct_date_format(dob):
            raise ValueError("dob is not in the required YYYY-MM-DD format.")
        return dob

    @staticmethod
    def validate(request_body: dict):
        """
        Returns an error message if the /api/patients post request
        is not valid. Else, returns None.

        :param request_body: The request body as a dict object
                            {
                                "patientId": "123456", - required
                                "patientName": "testName", - required
                                "isPregnant": True, - required
                                "patientSex": "FEMALE", - required
                                "dob": "1990-05-30", - required
                                "isExactDob: false - required
                                "householdNumber": "20",
                                "zone": "15",
                                "villageNumber": "50",
                                "pregnancyStartDate": 1587068710, - required if isPregnant = True
                                "gestationalAgeUnit": "WEEKS", - required isPregnant = True
                                "drugHistory": "too much tylenol",
                                "medicalHistory": "not enough advil",
                                "allergy": "seafood",
                                "isArchived": false
                            }
        :return: An error message if request body in invalid in some way. None otherwise.
        """
        try:
            PatientPostValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


class PatientPutValidator(BaseModel):
    patientId: Optional[str] = None
    patientName: Optional[str] = None
    patientSex: Optional[str] = "FEMALE"
    dob: Optional[str] = None
    isExactDob: Optional[bool] = False
    isPregnant: Optional[bool] = False
    householdNumber: Optional[str] = None
    zone: Optional[str] = None
    villageNumber: Optional[str] = None
    pregnancyStartDate: Optional[int] = None
    gestationalAgeUnit: Optional[str] = None
    drugHistory: Optional[str] = None
    medicalHistory: Optional[str] = None
    allergy: Optional[str] = None
    isArchived: Optional[bool] = False
    gestationalTimestamp: Optional[int] = None
    lastEdited: Optional[int] = None
    base: Optional[int] = None

    class Config:
        extra = "forbid"

    @field_validator("patientId", mode="before")
    @classmethod
    def check_patient_id_length(cls, patient_id):
        if len(patient_id) > 14:
            raise ValueError("patientId is too long. Max is 14 digits.")
        return patient_id

    @model_validator(mode="before")
    @classmethod
    def validate_is_pregnant_field(cls, values):
        is_pregnant = values.get("isPregnant")
        if is_pregnant:
            if not values.get("pregnancyStartDate") or not values.get("gestationalAgeUnit"):
                raise ValueError(
                    "If isPregnant is True, pregnancyStartDate and gestationalAgeUnit are required.",
                )
        return values

    @field_validator("pregnancyStartDate", mode="before")
    @classmethod
    def validate_pregnancy_start_date_field(cls, pregnancy_start_date):
        if pregnancy_start_date:
            error = check_gestational_age_under_limit(pregnancy_start_date)
            if error:
                raise ValueError(error)
        return pregnancy_start_date

    @field_validator("gestationalTimestamp", mode="before")
    @classmethod
    def validate_gestational_timestamp_field(cls, gestational_timestamp):
        if gestational_timestamp:
            error = check_gestational_age_under_limit(gestational_timestamp)
            if error:
                raise ValueError(error)
        return gestational_timestamp

    @field_validator("dob", mode="before")
    @classmethod
    def validate_date_format(cls, dob):
        if dob and not is_correct_date_format(dob):
            raise ValueError("dob is not in the required YYYY-MM-DD format.")
        return dob

    @staticmethod
    def validate_put_request(request_body: dict, patient_id):
        """
        Returns an error message if the /api/patients/<string:patient_id>/info PUT
        request is not valid. Else, returns None.

        :param request_body: The request body as a dict object
        :param patient_id: The patient ID the PUT request is being made for

        :return: An error message if request body in invalid in some way. None otherwise.
        """
        try:
            patient = PatientPutValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

        if patient.patientId and patient.patientId != patient_id:
            raise ValidationExceptionError("Patient ID cannot be changed.")


def check_gestational_age_under_limit(gestation_timestamp: int) -> Optional[str]:
    """
    Checks if a Unix timestamp is a valid gestational age.
    Is a valid gestational age if is from no more than 43 weeks/10 months ago

    :param gestation_timestamp: The Unix timestamp to validate
    :return: Returns None if the timestamp is valid, a string message otherwise
    """
    if gestation_timestamp == 0:
        return None

    gestation_date = datetime.fromtimestamp(gestation_timestamp)
    today = date.today()
    num_of_weeks = (today - gestation_date.date()).days // 7
    if num_of_weeks > 43:
        return "Gestation is greater than 43 weeks/10 months."
    return None


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
