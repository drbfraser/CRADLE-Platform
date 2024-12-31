from typing import Optional

from pydantic import Field, ValidationError, model_validator

from server.utils import get_current_time
from validation import CradleBaseModel
from validation.validation_exception import ValidationExceptionError


class MedicalRecordValidator(CradleBaseModel, extra="forbid"):
    id: Optional[int] = None
    patient_id: Optional[str] = None
    medical_history: Optional[str] = None
    drug_history: Optional[str] = None
    date_created: Optional[int] = Field(default_factory=get_current_time)
    last_edited: Optional[int] = None

    @model_validator(mode="before")
    @classmethod
    def validate_histories(cls, values):
        if not values.get("drug_history") and not values.get("medical_history"):
            raise ValidationExceptionError(
                "Either 'medical_history' or 'drug_history' must be present.",
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
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

        if record.patient_id and record.patient_id != patient_id:
            raise ValidationExceptionError("Patient ID does not match.")

        return record

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

        except ValidationError as e:
            print(e)
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))

        if record.id and record.id != record_id:
            raise ValidationExceptionError("Medical record ID cannot be changed.")

        return record
