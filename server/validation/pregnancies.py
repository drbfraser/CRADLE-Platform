from typing import Optional
from pydantic import BaseModel, ValidationError
from validation.validation_exception import ValidationExceptionError


class PregnancyPostRequestValidator(BaseModel):
    patientId: Optional[int] = None
    pregnancyStartDate: int
    gestationalAgeUnit: str
    pregnancyEndDate: Optional[int] = None
    pregnancyOutcome: Optional[str] = None
    id: Optional[int] = None
    lastEdited: Optional[int] = None
    isPregnant: Optional[bool] = None

    @staticmethod
    def validate_post_request(request_body: dict, patient_id: str):
        """
        Validates the request body for the POST /api/patients/<string:patient_id>/pregnancies.
        Raises ValidationExceptionError on invalid input, else returns None.

        :param request_body: Request body as a dictionary, e.g.:
                        {
                            "patientId": 120000, - required
                            "pregnancyStartDate": 1620000002, - required
                            "gestationalAgeUnit": "WEEKS", - required
                            "pregnancyEndDate": 1620000002,
                            "pregnancyOutcome": "Mode of delivery assisted birth",
                        }
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
        PregnancyPostRequestValidator.validate_unallowed_fields(request_body)
        PregnancyPostRequestValidator.validate_date_sequence(request_body)

    # use this custom method to validate extra field instead of using config extra forbid so that we have a custom error message
    @staticmethod
    def validate_unallowed_fields(request_body: dict):
        field_dict = PregnancyPostRequestValidator.model_fields
        for key in request_body:
            if key not in field_dict.keys():
                raise ValidationExceptionError(
                    f"{{{(key)}}} is not a valid key in pregnancy."
                )

    @staticmethod
    def validate_date_sequence(request_body: dict):
        start_date = request_body["pregnancyStartDate"]
        if (
            "pregnancyEndDate" in request_body
            and request_body.get("pregnancyEndDate") is not None
        ):
            end_date = request_body["pregnancyEndDate"]
            if start_date > end_date:
                raise ValidationExceptionError(
                    f"Pregnancy end date must occur after the start date."
                )


class PrenancyPutRequestValidator(BaseModel):
    id: Optional[int] = None
    patientId: Optional[int] = None

    @staticmethod
    def validate_put_request(request_body: dict, pregnancy_id: str):
        """
        Validates the PUT request for /api/pregnancies/<string:pregnancy_id>.
        Returns None if valid, otherwise raises ValidationExceptionError.

        :param request_body: Request body as a dictionary.
        :param pregnancy_id: The pregnancy ID associated with the PUT request.

        :return: Raises ValidationExceptionError on validation failure.
        """
        PregnancyPostRequestValidator.validate_unallowed_fields(request_body)

        try:
            # Pydantic will validate field presence and type
            PrenancyPutRequestValidator(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)

        if "id" in request_body and request_body.get("id") != pregnancy_id:
            raise ValidationExceptionError(f"Pregnancy ID cannot be changed.")
