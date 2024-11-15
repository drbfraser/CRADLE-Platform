from typing import Optional

from pydantic import BaseModel, ValidationError, field_validator, model_validator

from common import phone_number_utils
from validation.validation_exception import ValidationExceptionError


class SmsRelayValidator(BaseModel):
    phone_number: str
    encrypted_data: str

    @field_validator("phone_number")
    @classmethod
    def format_phone_numbers(cls, phone_number: str) -> str:
        formatted_phone_numbers = phone_number_utils.format(phone_number)
        return formatted_phone_numbers

    # forbid extra attributes
    class Config:
        extra = "forbid"

    @staticmethod
    def validate_request(request_body: dict):
        """
        Validates the POST request for /api/sms_relay. This method raises an exception
        with a detailed error message if the request does not conform to expected parameters.

        :param request_body: Dictionary representing the request body.
        """
        try:
            # Uses Pydantic for validation of field presence and type
            return SmsRelayValidator(**request_body)
        except ValidationError as e:
            # Raises an exception with the first error message from the validation errors
            error_message = e.errors()[0]["msg"]
            raise ValidationExceptionError(error_message)


class SmsRelayDecryptedBodyValidator(BaseModel):
    request_number: int
    method: str
    endpoint: str
    headers: Optional[str] = None
    body: Optional[str] = None

    # forbid extra attributes
    class Config:
        extra = "forbid"

    @model_validator(mode="before")
    @classmethod
    def request_number_is_required(cls, values):
        missing_fields = [
            field
            for field in ["request_number", "method", "endpoint"]
            if field not in values or values[field] is None
        ]

        if missing_fields:
            raise ValidationExceptionError(
                f"The request body key {{{(missing_fields[0])}}} is required.",
            )
        return values

    @staticmethod
    def validate(request_body: dict):
        """
        Validates the integrity and format of the decrypted body for sms relay. This method raises
        an exception with a detailed error message if the body is invalid.

        :param request_body: Dictionary representing the decrypted body.
        :throw: An error if the request body is invalid. None otherwise
        :return pydantic model representation of the request body param
        """
        try:
            # Uses Pydantic for validation of field presence and type
            return SmsRelayDecryptedBodyValidator(**request_body)
        except ValidationError as e:
            # Raises an exception with the first error message from the validation errors
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)
