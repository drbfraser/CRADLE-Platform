from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ValidationError

from validation.validation_exception import ValidationExceptionError


# Represents a referral entity with validations to prevent unrecognized fields.
class ReferralEntityValidator(BaseModel, extra="forbid"):
    id: Optional[str] = None
    patient_id: str
    health_facility_name: str
    comment: Optional[str] = None
    date_referred: Optional[datetime] = None
    action_taken: Optional[str] = None
    is_assessed: Optional[bool] = None
    is_cancelled: Optional[bool] = None
    cancel_reason: Optional[str] = None
    not_attended: Optional[bool] = None
    not_attend_reason: Optional[str] = None
    last_edited: Optional[datetime] = None
    user_id: Optional[int] = None

    @staticmethod
    def validate(request_body: dict):
        """
        Validates a POST request for /api/referrals. Raises an exception with an error message if the request is invalid.

        :param request_body: The request body as a dict object
                            {
                                "comment": "here is a comment",
                                "patient_id": "123",
                                "health_facility_name": "H0000",
                            }
        :throw: An error if the request body is invalid. None otherwise
        :return pydantic model representation of the request body param
        """
        try:
            # Pydantic will validate field presence and type
            return ReferralEntityValidator(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)


# Manages cancellation status with strict attribute enforcement to prevent unrecognized fields.
class CancelStatusValidator(BaseModel, extra="forbid"):
    isCancelled: bool
    cancelReason: str

    @staticmethod
    def validate(request_body: dict):
        """
        Validates the /api/referrals/cancel-status-switch/<string:referral_id> PUT request for changing the cancellation status of a referral. Raises an exception with an error message if the request is invalid.

        :param request_body: The request body as a dict object
        :throw: An error if the request body is invalid. None otherwise
        :return pydantic model representation of the request body param
        """
        try:
            return CancelStatusValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


# Manages non-attendance reasons with strict attribute enforcement to prevent unrecognized fields.


class NotAttendValidator(BaseModel, extra="forbid"):
    notAttendReason: str

    @staticmethod
    def validate(request_body: dict):
        """
        Validate the /api/referrals/not-attend/<string:referral_id> PUT
        request for recording a non-attendance reason. Raises an exception with an error message if the request is invalid.

        :param request_body: The request body as a dict object
        :throw: An error if the request body is invalid. None otherwise
        :return pydantic model representation of the request body param
        """
        try:
            return NotAttendValidator(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
