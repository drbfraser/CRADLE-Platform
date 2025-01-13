from typing import Optional

from validation import CradleBaseModel


# Represents a referral entity with validations to prevent unrecognized fields.
class ReferralModel(CradleBaseModel, extra="forbid"):
    """
    {
        "comment": "here is a comment",
        "patient_id": "123",
        "health_facility_name": "H0000",
    }
    """

    id: Optional[str] = None
    patient_id: str
    health_facility_name: str
    comment: Optional[str] = None
    date_referred: Optional[int] = None
    action_taken: Optional[str] = None
    is_assessed: Optional[bool] = None
    is_cancelled: Optional[bool] = None
    cancel_reason: Optional[str] = None
    not_attended: Optional[bool] = None
    not_attend_reason: Optional[str] = None
    last_edited: Optional[int] = None
    user_id: Optional[int] = None


# Manages cancellation status with strict attribute enforcement to prevent unrecognized fields.
class CancelStatus(CradleBaseModel, extra="forbid"):
    is_cancelled: bool
    cancel_reason: str


# Manages non-attendance reasons with strict attribute enforcement to prevent unrecognized fields.


class NotAttend(CradleBaseModel, extra="forbid"):
    not_attend_reason: str
