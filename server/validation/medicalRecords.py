from typing import Optional

from pydantic import BaseModel, ValidationError, model_validator
from validation.validation_exception import ValidationExceptionError


class MedicalRecord(BaseModel):
    id: Optional[int] = None
    patientId: Optional[int] = None
    medicalHistory: Optional[str] = None
    drugHistory: Optional[str] = None
    dateCreated: Optional[int] = None
    lastEdited: Optional[int] = None

    class Config:
        extra = "forbid"

    @model_validator(mode="before")
    def validate_histories(cls, values):
        if not values.get("drugHistory") and not values.get("medicalHistory"):
            raise ValidationExceptionError(
                "Either 'medicalHistory' or 'drugHistory' must be present."
            )
        return values


def validate_post_request(request_body: dict, patient_id: str):
    """
    Returns an error message if the /api/patients/<string:patient_id>/medical_records
    post request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "patientId": "120000",
                            "medicalHistory" or "drugHistory": "Aspirin 75mg", - required
                        }
    :param patient_id: The id of the patient, used to validate request_body input
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    try:
        record = MedicalRecord(**request_body)

        if record.patientId and record.patientId != patient_id:
            raise ValidationExceptionError("Patient ID does not match.")

    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))


def validate_put_request(request_body: dict, record_id: str):
    """
    Returns an error message if the /api/medical_records/<string:record_id> PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
    :param record_id: The medical record ID the PUT request is being made for

    :return: An error message if request body is invalid in some way. None otherwise.
    """
    try:
        record = MedicalRecord(**request_body)

        if record.id and record.id != record_id:
            raise ValidationExceptionError("Medical record ID cannot be changed.")

    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))


def validate_key(request_body):
    try:
        MedicalRecord(**request_body)
    except ValidationError as e:
        raise ValidationExceptionError(str(e.errors()[0]["msg"]))
