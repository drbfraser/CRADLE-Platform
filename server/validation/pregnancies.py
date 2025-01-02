from typing import Optional

from pydantic import Field, ValidationError, model_validator
from typing_extensions import Self

from utils import get_current_time
from validation import CradleBaseModel
from validation.validation_exception import ValidationExceptionError


class PregnancyModel(CradleBaseModel, extra="forbid"):
    patient_id: str
    start_date: int
    end_date: Optional[int] = None
    outcome: Optional[str] = None
    id: Optional[int] = None
    last_edited: int = Field(default_factory=get_current_time)
    is_pregnant: Optional[bool] = None

    @model_validator(mode="after")
    def validate_date_sequence(self) -> Self:
        if (self.end_date is not None) and (self.start_date > self.end_date):
            raise ValueError("Pregnancy end date cannot be before the start date.")
        return self


class PregnancyPostRequestValidator(PregnancyModel):
    patient_id: Optional[str] = None

    @staticmethod
    def validate(request_body: dict, patient_id: str):
        """
        Validates the request body for the POST /api/patients/<string:patient_id>/pregnancies.
        Raises ValidationExceptionError on invalid input, else returns None.

        :param request_body: Request body as a dictionary, e.g.:
                        {
                            "patient_id": 120000, - required
                            "start_date": 1620000002, - required
                            "end_date": 1620000002,
                            "outcome": "Mode of delivery assisted birth",
                        }
        :param id: The pregnancy ID associated with the PUT request.

        :return: Raises ValidationExceptionError on validation failure.
        """
        try:
            # Pydantic will validate field presence and type
            model = PregnancyPostRequestValidator(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)

        if (
            "patient_id" in request_body
            and request_body.get("patient_id") != patient_id
        ):
            raise ValidationExceptionError("Patient ID does not match.")

        return model


class PregnancyPutRequestValidator(PregnancyModel):
    @staticmethod
    def validate(request_body: dict, pregnancy_id: int):
        """
        Validates the PUT request for /api/pregnancies/<string:pregnancy_id>.
        Returns None if valid, otherwise raises ValidationExceptionError.

        :param request_body: Request body as a dictionary.
        :param pregnancy_id: The pregnancy ID associated with the PUT request.

        :return: Raises ValidationExceptionError on validation failure.
        """
        try:
            # Pydantic will validate field presence and type
            model = PregnancyPutRequestValidator(**request_body)
        except ValidationError as e:
            print(e)
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)

        if "id" in request_body and request_body.get("id") != pregnancy_id:
            raise ValidationExceptionError("Pregnancy ID cannot be changed.")

        return model
