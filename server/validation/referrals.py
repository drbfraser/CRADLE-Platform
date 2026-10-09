from typing import Optional

from pydantic import RootModel

from validation import CradleBaseModel


class ReferralBase(CradleBaseModel):
    id: Optional[str] = None
    patient_id: str
    health_facility_name: str
    comment: Optional[str] = None
    date_referred: Optional[int] = None
    last_edited: Optional[int] = None


# Unrecognized fields are ignored, not rejected, because existing clients still send
# the server-owned fields of ReferralResponse.
class CreateReferralRequest(ReferralBase):
    """
    {
        "comment": "here is a comment",
        "patient_id": "123",
        "health_facility_name": "H0000",
    }
    """


class ReferralResponse(ReferralBase):
    user_id: Optional[int] = None
    action_taken: Optional[str] = None
    is_assessed: Optional[bool] = None
    date_assessed: Optional[int] = None
    is_cancelled: Optional[bool] = None
    cancel_reason: Optional[str] = None
    date_cancelled: Optional[int] = None
    not_attended: Optional[bool] = None
    not_attend_reason: Optional[str] = None
    date_not_attended: Optional[int] = None


# Manages cancellation status with strict attribute enforcement to prevent unrecognized fields.
class CancelStatus(CradleBaseModel, extra="forbid"):
    is_cancelled: bool
    cancel_reason: str


# Manages non-attendance reasons with strict attribute enforcement to prevent unrecognized fields.
class NotAttendReason(CradleBaseModel, extra="forbid"):
    not_attend_reason: str


class ReferralList(RootModel):
    root: list[ReferralResponse]
