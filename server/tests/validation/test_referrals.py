import pytest
from pydantic import ValidationError

from validation.referrals import (
    CancelStatus,
    NotAttend,
    ReferralModel,
)

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
    "patient_id": PATIENT_ID,
    "health_facility_name": FACILITY,
    "comment": COMMENT,
    "id": ID,
    "date_referred": DATE_REFERRED,
    "action_taken": ACTION,
    "is_assessed": True,
    "is_cancelled": False,
    "cancel_reason": REASON,
    "not_attended": True,
    "not_attend_reason": REASON,
    "last_edited": DATE_LAST_EDITED,
    "user_id": USER_ID,
}

referral_missing_optional_field_comment_should_return_none = {
    "patient_id": PATIENT_ID,
    "health_facility_name": FACILITY,
    "id": ID,
    "date_referred": DATE_REFERRED,
    "action_taken": ACTION,
    "is_assessed": True,
    "is_cancelled": False,
    "cancel_reason": REASON,
    "not_attended": True,
    "not_attend_reason": REASON,
    "last_edited": DATE_LAST_EDITED,
    "user_id": USER_ID,
}

referral_missing_optional_field_date_referred_should_return_none = {
    "patient_id": PATIENT_ID,
    "health_facility_name": FACILITY,
    "comment": COMMENT,
    "id": ID,
    "action_taken": ACTION,
    "is_assessed": True,
    "is_cancelled": False,
    "cancel_reason": REASON,
    "not_attended": True,
    "not_attend_reason": REASON,
    "last_edited": DATE_LAST_EDITED,
    "user_id": USER_ID,
}

referral_missing_required_field_patient_id_should_throw_exception = {
    "health_facility_name": FACILITY,
    "comment": COMMENT,
    "id": ID,
    "date_referred": DATE_REFERRED,
    "action_taken": ACTION,
    "is_assessed": True,
    "is_cancelled": False,
    "cancel_reason": REASON,
    "not_attended": True,
    "not_attend_reason": REASON,
    "last_edited": DATE_LAST_EDITED,
    "user_id": USER_ID,
}


referral_missing_required_field_health_facility_name_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "comment": COMMENT,
    "id": ID,
    "date_referred": DATE_REFERRED,
    "action_taken": ACTION,
    "is_assessed": True,
    "is_cancelled": False,
    "cancel_reason": REASON,
    "not_attended": True,
    "not_attend_reason": REASON,
    "last_edited": DATE_LAST_EDITED,
    "user_id": USER_ID,
}

referral_field_patient_id_has_wrong_type_should_throw_exception = {
    "patient_id": 111,
    "health_facility_name": FACILITY,
    "comment": COMMENT,
    "id": ID,
    "date_referred": DATE_REFERRED,
    "action_taken": ACTION,
    "is_assessed": True,
    "is_cancelled": False,
    "cancel_reason": REASON,
    "not_attended": True,
    "not_attend_reason": REASON,
    "last_edited": DATE_LAST_EDITED,
    "user_id": USER_ID,
}

referral_field_health_facility_name_has_wrong_type_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "health_facility_name": 111,
    "comment": COMMENT,
    "id": ID,
    "date_referred": DATE_REFERRED,
    "action_taken": ACTION,
    "is_assessed": True,
    "is_cancelled": False,
    "cancel_reason": REASON,
    "not_attended": True,
    "not_attend_reason": REASON,
    "last_edited": DATE_LAST_EDITED,
    "user_id": USER_ID,
}

referral_has_invalid_extra_field_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "health_facility_name": FACILITY,
    "comment": COMMENT,
    "id": ID,
    "date_referred": DATE_REFERRED,
    "action_taken": ACTION,
    "is_assessed": True,
    "is_cancelled": False,
    "cancel_reason": REASON,
    "not_attended": True,
    "not_attend_reason": REASON,
    "last_edited": DATE_LAST_EDITED,
    "user_id": USER_ID,
    "extra": "invalid extra field",
}

# tests for CancelStatusValidator model
cancel_put_with_valid_fields_should_return_none = {
    "is_cancelled": True,
    "cancel_reason": REASON,
}

cancel_put_missing_required_field_is_cancelled_should_throw_exception = {
    "cancel_reason": REASON,
}

cancel_put_missing_required_field_cancel_reason_should_throw_exception = {
    "is_cancelled": True,
}

cancel_put_field_is_cancelled_has_wrong_type_should_throw_exception = {
    "is_cancelled": 11111,
    "cancel_reason": "valid reason",
}

cancel_put_field_cancel_reason_has_wrong_type_should_throw_exception = {
    "is_cancelled": True,
    "cancel_reason": 11111,
}

cancel_put_has_invalid_extra_field_should_throw_exception = {
    "is_cancelled": True,
    "cancel_reason": REASON,
    "some_extra_field": "some value",
}

# cancel_put_field_cancel_reason_is_not_empty_while_is_cancelled_is_false_should_throw_exception = {
#     "is_cancelled": False,
#     "cancel_reason": REASON,
# }


# tests for NotAttendValidator model
not_attend_with_valid_fields_should_return_none = {
    "not_attend_reason": REASON,
}

not_attend_field_not_attend_reason_has_wrong_type_should_throw_exception = {
    "not_attend_reason": 11111,
}

not_attend_has_invalid_extra_field_should_throw_exception = {
    "not_attend_reason": REASON,
    "some_extra_field": "some value",
}


@pytest.mark.parametrize(
    "json, output_type, entity",
    [
        (referral_with_valid_fields_should_return_none, None, ReferralModel),
        (
            referral_missing_optional_field_comment_should_return_none,
            None,
            ReferralModel,
        ),
        (
            referral_missing_optional_field_date_referred_should_return_none,
            None,
            ReferralModel,
        ),
        (
            referral_missing_required_field_patient_id_should_throw_exception,
            ValidationError,
            ReferralModel,
        ),
        (
            referral_missing_required_field_health_facility_name_should_throw_exception,
            ValidationError,
            ReferralModel,
        ),
        (
            referral_field_patient_id_has_wrong_type_should_throw_exception,
            ValidationError,
            ReferralModel,
        ),
        (
            referral_field_health_facility_name_has_wrong_type_should_throw_exception,
            ValidationError,
            ReferralModel,
        ),
        (
            referral_has_invalid_extra_field_should_throw_exception,
            ValidationError,
            ReferralModel,
        ),
        (cancel_put_with_valid_fields_should_return_none, None, CancelStatus),
        (
            cancel_put_missing_required_field_is_cancelled_should_throw_exception,
            ValidationError,
            CancelStatus,
        ),
        (
            cancel_put_missing_required_field_cancel_reason_should_throw_exception,
            ValidationError,
            CancelStatus,
        ),
        (
            cancel_put_field_is_cancelled_has_wrong_type_should_throw_exception,
            ValidationError,
            CancelStatus,
        ),
        (
            cancel_put_field_cancel_reason_has_wrong_type_should_throw_exception,
            ValidationError,
            CancelStatus,
        ),
        (
            cancel_put_has_invalid_extra_field_should_throw_exception,
            ValidationError,
            CancelStatus,
        ),
        (not_attend_with_valid_fields_should_return_none, None, NotAttend),
        (
            not_attend_field_not_attend_reason_has_wrong_type_should_throw_exception,
            ValidationError,
            NotAttend,
        ),
        (
            not_attend_has_invalid_extra_field_should_throw_exception,
            ValidationError,
            NotAttend,
        ),
    ],
)
def test_validation(json, output_type, entity):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            entity(**json)
    else:
        try:
            entity(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
