import pytest

from validation.referrals import (
    CancelStatusValidator,
    NotAttendValidator,
    ReferralEntityValidator,
)
from validation.validation_exception import ValidationExceptionError

PATIENT_ID = "49300028161"
FACILITY = "H0000"
COMMENT = "here is a comment"
ID = "0ee509a7-b1aa-4830-9629-3cf7240a2e5b"
# unix epoch code for Monday, January 1, 2024 12:00:00 AM
DATE_REFERRED = "1704067200"
ACTION = "an action"
REASON = "some reason"
# unix epoch code for Friday, February 2, 2024 12:00:00 AM
DATE_LAST_EDITED = "1729744672"
USER_ID = 10

# tests for ReferralEntityValidator model
referral_with_valid_fields_should_return_none = {
    "patientId": PATIENT_ID,
    "referralHealthFacilityName": FACILITY,
    "comment": COMMENT,
    "id": ID,
    "dateReferred": DATE_REFERRED,
    "actionTaken": ACTION,
    "isAssessed": True,
    "isCancelled": False,
    "cancelReason": REASON,
    "notAttended": True,
    "notAttendReason": REASON,
    "lastEdited": DATE_LAST_EDITED,
    "userId": USER_ID,
}

referral_missing_optional_field_comment_should_return_none = {
    "patientId": PATIENT_ID,
    "referralHealthFacilityName": FACILITY,
    "id": ID,
    "dateReferred": DATE_REFERRED,
    "actionTaken": ACTION,
    "isAssessed": True,
    "isCancelled": False,
    "cancelReason": REASON,
    "notAttended": True,
    "notAttendReason": REASON,
    "lastEdited": DATE_LAST_EDITED,
    "userId": USER_ID,
}

referral_missing_optional_field_dateReferred_should_return_none = {
    "patientId": PATIENT_ID,
    "referralHealthFacilityName": FACILITY,
    "comment": COMMENT,
    "id": ID,
    "actionTaken": ACTION,
    "isAssessed": True,
    "isCancelled": False,
    "cancelReason": REASON,
    "notAttended": True,
    "notAttendReason": REASON,
    "lastEdited": DATE_LAST_EDITED,
    "userId": USER_ID,
}

referral_missing_required_field_patientId_should_throw_exception = {
    "referralHealthFacilityName": FACILITY,
    "comment": COMMENT,
    "id": ID,
    "dateReferred": DATE_REFERRED,
    "actionTaken": ACTION,
    "isAssessed": True,
    "isCancelled": False,
    "cancelReason": REASON,
    "notAttended": True,
    "notAttendReason": REASON,
    "lastEdited": DATE_LAST_EDITED,
    "userId": USER_ID,
}


referral_missing_required_field_referralHealthFacilityName_should_throw_exception = {
    "patientId": PATIENT_ID,
    "comment": COMMENT,
    "id": ID,
    "dateReferred": DATE_REFERRED,
    "actionTaken": ACTION,
    "isAssessed": True,
    "isCancelled": False,
    "cancelReason": REASON,
    "notAttended": True,
    "notAttendReason": REASON,
    "lastEdited": DATE_LAST_EDITED,
    "userId": USER_ID,
}

referral_field_patientId_has_wrong_type_should_throw_exception = {
    "patientId": 111,
    "referralHealthFacilityName": FACILITY,
    "comment": COMMENT,
    "id": ID,
    "dateReferred": DATE_REFERRED,
    "actionTaken": ACTION,
    "isAssessed": True,
    "isCancelled": False,
    "cancelReason": REASON,
    "notAttended": True,
    "notAttendReason": REASON,
    "lastEdited": DATE_LAST_EDITED,
    "userId": USER_ID,
}

referral_field_referralHealthFacilityName_has_wrong_type_should_throw_exception = {
    "patientId": PATIENT_ID,
    "referralHealthFacilityName": 111,
    "comment": COMMENT,
    "id": ID,
    "dateReferred": DATE_REFERRED,
    "actionTaken": ACTION,
    "isAssessed": True,
    "isCancelled": False,
    "cancelReason": REASON,
    "notAttended": True,
    "notAttendReason": REASON,
    "lastEdited": DATE_LAST_EDITED,
    "userId": USER_ID,
}

referral_has_invalid_extra_field_should_throw_exception = {
    "patientId": PATIENT_ID,
    "referralHealthFacilityName": FACILITY,
    "comment": COMMENT,
    "id": ID,
    "dateReferred": DATE_REFERRED,
    "actionTaken": ACTION,
    "isAssessed": True,
    "isCancelled": False,
    "cancelReason": REASON,
    "notAttended": True,
    "notAttendReason": REASON,
    "lastEdited": DATE_LAST_EDITED,
    "userId": USER_ID,
    "extra": "invalid extra field",
}

# tests for CancelStatusValidator model
cancel_put_with_valid_fields_should_return_none = {
    "isCancelled": True,
    "cancelReason": REASON,
}

cancel_put_missing_required_field_isCancelled_should_throw_exception = {
    "cancelReason": REASON,
}

cancel_put_missing_required_field_cancelReason_should_throw_exception = {
    "isCancelled": True,
}

cancel_put_field_isCancelled_has_wrong_type_should_throw_exception = {
    "isCancelled": 11111,
    "cancelReason": "valid reason",
}

cancel_put_field_cancelReason_has_wrong_type_should_throw_exception = {
    "isCancelled": True,
    "cancelReason": 11111,
}

cancel_put_has_invalid_extra_field_should_throw_exception = {
    "isCancelled": True,
    "cancelReason": REASON,
    "some_extra_field": "some value",
}

# cancel_put_field_cancelReason_is_not_empty_while_isCancelled_is_false_should_throw_exception = {
#     "isCancelled": False,
#     "cancelReason": REASON,
# }


# tests for NotAttendValidator model
not_attend_with_valid_fields_should_return_none = {
    "notAttendReason": REASON,
}

not_attend_field_notAttendReason_has_wrong_type_should_throw_exception = {
    "notAttendReason": 11111,
}

not_attend_has_invalid_extra_field_should_throw_exception = {
    "notAttendReason": REASON,
    "some_extra_field": "some value",
}


@pytest.mark.parametrize(
    "json, output_type, entity",
    [
        (referral_with_valid_fields_should_return_none, None, ReferralEntityValidator),
        (
            referral_missing_optional_field_comment_should_return_none,
            None,
            ReferralEntityValidator,
        ),
        (
            referral_missing_optional_field_dateReferred_should_return_none,
            None,
            ReferralEntityValidator,
        ),
        (
            referral_missing_required_field_patientId_should_throw_exception,
            ValidationExceptionError,
            ReferralEntityValidator,
        ),
        (
            referral_missing_required_field_referralHealthFacilityName_should_throw_exception,
            ValidationExceptionError,
            ReferralEntityValidator,
        ),
        (
            referral_field_patientId_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
            ReferralEntityValidator,
        ),
        (
            referral_field_referralHealthFacilityName_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
            ReferralEntityValidator,
        ),
        (
            referral_has_invalid_extra_field_should_throw_exception,
            ValidationExceptionError,
            ReferralEntityValidator,
        ),
        (cancel_put_with_valid_fields_should_return_none, None, CancelStatusValidator),
        (
            cancel_put_missing_required_field_isCancelled_should_throw_exception,
            ValidationExceptionError,
            CancelStatusValidator,
        ),
        (
            cancel_put_missing_required_field_cancelReason_should_throw_exception,
            ValidationExceptionError,
            CancelStatusValidator,
        ),
        (
            cancel_put_field_isCancelled_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
            CancelStatusValidator,
        ),
        (
            cancel_put_field_cancelReason_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
            CancelStatusValidator,
        ),
        (
            cancel_put_has_invalid_extra_field_should_throw_exception,
            ValidationExceptionError,
            CancelStatusValidator,
        ),
        (not_attend_with_valid_fields_should_return_none, None, NotAttendValidator),
        (
            not_attend_field_notAttendReason_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
            NotAttendValidator,
        ),
        (
            not_attend_has_invalid_extra_field_should_throw_exception,
            ValidationExceptionError,
            NotAttendValidator,
        ),
    ],
)
def test_validation(json, output_type, entity):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            entity.validate(json)
    else:
        try:
            entity.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
