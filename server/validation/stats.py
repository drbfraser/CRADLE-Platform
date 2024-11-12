# Stats post requests validation
from typing import Optional

from pydantic import BaseModel, Field, ValidationError

from validation.validation_exception import ValidationExceptionError

MYSQL_BIGINT_MAX = (2**63) - 1


class TimestampValidator(BaseModel):
    from_: Optional[str] = Field(
        alias="from",
        default="0",
    )  # Use from_ to avoid conflict with Python's reserved keyword 'from'
    to: Optional[str] = Field(
        default=str(MYSQL_BIGINT_MAX),
    )

    @staticmethod
    def validate(request_body: dict):
        """
        Validates the presence and format of required timestamp fields using the Timestamp Pydantic model.
        Raises ValidationExceptionError if the timestamp in the request body is invalid.

        Args:
            request_body (dict): The request body containing timestamps. Example payload:
                {
                    "from": "1546702448",
                    "to": "1547212259"
                }
        :throw: An error if the request body is invalid. None otherwise
        :return pydantic model representation of the request body param

        """
        try:
            # Pydantic will validate field presence and type
            return TimestampValidator(**request_body)
        except ValidationError as e:
            print(e)
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)


class Timeframe(BaseModel):
    timeframe: dict

    @staticmethod
    def validate_time_frame_readings(request_body: dict):
        """
        Validates the 'api/stats-timeframed-readings' POST request format. If the request
        format is invalid, it raises a ValidationExceptionError with an error message.Additionally, it verifies the timestamp values in the request.

        :param request_body: A dictionary representing the POST request, structured as follows:
            {
                "timeframe": {              # This field is required
                    "from": "1546702448",   # Start time as a string
                    "to": "1547212259"      # End time as a string
                }
            }
        """
        try:
            Timeframe(**request_body)
            TimestampValidator.validate(request_body["timeframe"])
        except ValidationError as e:
            print(e)
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)
