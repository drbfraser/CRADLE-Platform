from pydantic import BaseModel, ValidationError

from validation.validation_exception import ValidationExceptionError


class SmsRelay(BaseModel):
    phoneNumber: str
    encryptedData: str
    requestNumber: str
    method: str
    endpoint: str

    @staticmethod
    def validate_request(request_body: dict):
        """
        Returns an error message if the /api/sms_relay POST
        request is not valid. Else, returns None.
        :param request_body: The request body as a dict object
        :return: An error message if request body in invalid in some way. None otherwise.
        """
        try:
            # Pydantic will validate field presence and type
            SmsRelay(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)

    @staticmethod
    def validate_decrypted_body(request_body: dict):
        """
        Returns an error message if the sms relay body
        is not valid. Else, returns None.
        :param body: The sms relay body as a dict object
        :return: An error message if body in invalid in some way. None otherwise.
        """
        try:
            # Pydantic will validate field presence and type
            SmsRelay(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)
