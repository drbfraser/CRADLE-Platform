from typing import Optional

from pydantic import BaseModel, ValidationError, model_validator

from validation.validation_exception import ValidationExceptionError


class SmsRelay(BaseModel):
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
            SmsRelay(**request_body)
        except ValidationError as e:
            # Raises an exception with the first error message from the validation errors
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)


class SmsRelayDecryptedBody(BaseModel):
    requestNumber: int
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
            for field in ["requestNumber", "method", "endpoint"]
            if field not in values or values[field] is None
        ]

        if missing_fields:
            raise ValidationExceptionError(
                f"The request body key {{{(missing_fields[0])}}} is required.",
            )
        return values

    @staticmethod
    def validate_decrypted_body(request_body: dict):
        """
        Validates the integrity and format of the decrypted body for sms relay. This method raises
        an exception with a detailed error message if the body is invalid.

        :param request_body: Dictionary representing the decrypted body.
        """
        try:
            # Uses Pydantic for validation of field presence and type
            SmsRelayDecryptedBody(**request_body)
        except ValidationError as e:
            # Raises an exception with the first error message from the validation errors
            error_message = str(e.errors()[0]["msg"])
            print("what error is expected?")
            print(e.errors())
            raise ValidationExceptionError(error_message)
