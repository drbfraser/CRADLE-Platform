from typing import Optional

from pydantic import BaseModel, ValidationError, model_validator

from validation.validation_exception import ValidationExceptionError


class MedicalRecordValidator(BaseModel):
    id: Optional[int] = None
    patient_id: Optional[int] = None
    medical_history: Optional[str] = None
    drug_history: Optional[str] = None
    date_created: Optional[int] = None
    last_edited: Optional[int] = None

    class Config:
        extra = "forbid"

    @model_validator(mode="before")
    @classmethod
    def validate_histories(cls, values):
        if not values.get("drug_history") and not values.get("medical_history"):
            raise ValidationExceptionError(
                "Either 'medicalHistory' or 'drugHistory' must be present.",
            )
        return values

    @staticmethod
    def validate_post_request(request_body: dict, patient_id: str):
        """
        Raises an error if the /api/patients/<string:patient_id>/medical_records
        post request is not valid.

        :param request_body: The request body as a dict object
                            {
                                "patient_id": "120000",
                                "medical_history" or "drug_history": "Aspirin 75mg", - required
                            }
        :param patient_id: The id of the patient, used to validate request_body input
        """
        try:
            record = MedicalRecordValidator(**request_body)

            if record.patient_id and record.patient_id != patient_id:
                raise ValidationExceptionError("Patient ID does not match.")

        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

    @staticmethod
    def validate_put_request(request_body: dict, record_id: str):
        """
        Raises an error if the /api/medical_records/<string:record_id> PUT
        request is not valid.

        :param request_body: The request body as a dict object
        :param record_id: The medical record ID the PUT request is being made for
        """
        try:
            record = MedicalRecordValidator(**request_body)

            if record.id and record.id != record_id:
                raise ValidationExceptionError("Medical record ID cannot be changed.")

        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

    @staticmethod
    def validate_key(request_body):
        try:
            MedicalRecordValidator(**request_body)
        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
