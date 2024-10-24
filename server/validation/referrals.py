from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, ValidationError

from validation.validation_exception import ValidationExceptionError


# Represents a referral entity with validations to prevent unrecognized fields.
class ReferralEntity(BaseModel):
    patientId: int
    referralHealthFacilityName: str
    comment: Optional[str] = None
    id: Optional[str] = None
    dateReferred: Optional[datetime] = None
    actionTaken: Optional[str] = None
    isAssessed: Optional[bool] = None
    isCancelled: Optional[bool] = None
    cancelReason: Optional[str] = None
    notAttended: Optional[bool] = None
    notAttendReason: Optional[str] = None
    lastEdited: Optional[datetime] = None
    userId: Optional[int] = None

    # forbid extra attributes
    class Config:
        extra = "forbid"

    @staticmethod
    def validate(request_body: dict):
        """
        Validates a POST request for /api/referrals. Raises an exception with an error message if the request is invalid.

        :param request_body: The request body as a dict object
                            {
                                "comment": "here is a comment",
                                "patientId": "123",
                                "referralHealthFacilityName": "H0000",
                            }
        """
        try:
            # Pydantic will validate field presence and type
            ReferralEntity(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)


# Manages cancellation status with strict attribute enforcement to prevent unrecognized fields.
class CancelStatus(BaseModel):
    # forbid extra attributes
    model_config = ConfigDict(extra="forbid")

    isCancelled: bool
    cancelReason: str

    @staticmethod
    def validate_cancel_put_request(request_body: dict):
        """
        Validates the /api/referrals/cancel-status-switch/<string:referral_id> PUT request for changing the cancellation status of a referral. Raises an exception with an error message if the request is invalid.

        :param request_body: The request body as a dict object
        """
        try:
            CancelStatus(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))


# Manages non-attendance reasons with strict attribute enforcement to prevent unrecognized fields.


class NotAttend(BaseModel):
    # forbid extra attributes
    model_config = ConfigDict(extra="forbid")

    notAttendReason: str

    @staticmethod
    def validate_not_attend_put_request(request_body: dict):
        """
        Validate the /api/referrals/not-attend/<string:referral_id> PUT
        request for recording a non-attendance reason. Raises an exception with an error message if the request is invalid.

        :param request_body: The request body as a dict object
        """
        try:
            NotAttend(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
