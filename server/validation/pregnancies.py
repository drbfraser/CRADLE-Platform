from typing import Optional

from pydantic import BaseModel, ValidationError

from validation.validation_exception import ValidationExceptionError


class PregnancyModel(BaseModel):
    patient_id: Optional[int] = None
    start_date: int
    end_date: Optional[int] = None
    outcome: Optional[str] = None
    id: Optional[int] = None
    last_edited: Optional[int] = None
    is_pregnant: Optional[bool] = None

    # use this custom method to validate extra field instead of using config extra forbid so that we have a custom error message
    @staticmethod
    def validate_unallowed_fields(request_body: dict):
        field_dict = PregnancyModel.model_fields
        for key in request_body:
            if key not in field_dict:
                raise ValidationExceptionError(
                    f"{{{(key)}}} is not a valid key in pregnancy.",
                )

    @staticmethod
    def validate_date_sequence(request_body: dict):
        if (
            "pregnancy_start_date" in request_body
            and request_body.get("pregnancy_start_date") is not None
            and "pregnancy_end_date" in request_body
            and request_body.get("pregnancy_end_date") is not None
        ):
            start_date = request_body["pregnancy_start_date"]
            end_date = request_body["pregnancy_end_date"]
            if start_date > end_date:
                raise ValidationExceptionError(
                    "Pregnancy end date must occur after the start date.",
                )


class PregnancyPostRequestValidator(PregnancyModel):
    @staticmethod
    def validate(request_body: dict, patient_id: str):
        """
        Validates the request body for the POST /api/patients/<string:patient_id>/pregnancies.
        Raises ValidationExceptionError on invalid input, else returns None.

        :param request_body: Request body as a dictionary, e.g.:
                        {
                            "patient_id": 120000, - required
                            "pregnancy_start_date": 1620000002, - required
                            "pregnancy_end_date": 1620000002,
                            "outcome": "Mode of delivery assisted birth",
                        }
        :param pregnancy_id: The pregnancy ID associated with the PUT request.

        :return: Raises ValidationExceptionError on validation failure.
        """
        try:
            # Pydantic will validate field presence and type
            PregnancyPostRequestValidator(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)

        # check for extra fields
        PregnancyModel.validate_unallowed_fields(request_body)
        PregnancyModel.validate_date_sequence(request_body)

        if (
            "patient_id" in request_body
            and request_body.get("patient_id") != patient_id
        ):
            raise ValidationExceptionError("Patient ID does not match.")


class PregnancyPutRequestValidator(PregnancyModel):
    pregnancy_start_date: Optional[int] = None

    @staticmethod
    def validate(request_body: dict, pregnancy_id: str):
        """
        Validates the PUT request for /api/pregnancies/<string:pregnancy_id>.
        Returns None if valid, otherwise raises ValidationExceptionError.

        :param request_body: Request body as a dictionary.
        :param pregnancy_id: The pregnancy ID associated with the PUT request.

        :return: Raises ValidationExceptionError on validation failure.
        """
        try:
            # Pydantic will validate field presence and type
            PregnancyPutRequestValidator(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)

        PregnancyModel.validate_unallowed_fields(request_body)
        PregnancyModel.validate_date_sequence(request_body)

        if "id" in request_body and request_body.get("id") != pregnancy_id:
            raise ValidationExceptionError("Pregnancy ID cannot be changed.")
