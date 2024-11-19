from typing import Optional

from pydantic import BaseModel, ValidationError, field_validator, model_validator

from enums import MethodEnum
from validation.validation_exception import ValidationExceptionError


class SmsRelayValidator(BaseModel):
    phoneNumber: str
    encryptedData: str

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
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)


class SmsRelayDecryptedBodyValidator(BaseModel):
    requestNumber: int
    method: MethodEnum
    endpoint: str
    headers: Optional[str] = None
    body: Optional[str] = None

    # forbid extra attributes
    class Config:
        extra = "forbid"
        use_enum_values = True

    @model_validator(mode="before")
    @classmethod
    def request_number_is_required(cls, values):
        missing_fields = [
            field
            for field in ["requestNumber", "method", "endpoint"]
            if field not in values or values[field] is None
        ]

        if missing_fields:
            raise ValidationExceptionError(
                f"The request body key {{{(missing_fields[0])}}} is required.",
            )
        return values

    @field_validator("method", mode="before")
    @classmethod
    def __method_must_be_method_enum(cls, method):
        if method not in MethodEnum._member_names_:
            raise ValidationExceptionError(
                "Invalid Method; Must be either GET, POST, HEAD, PUT, DELETE, or PATCH",
            )
        return method

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
