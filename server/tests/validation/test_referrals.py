import pytest

from validation.referrals import (
    CancelStatusValidator,
    NotAttendValidator,
    ReferralEntityValidator,
)
from validation.validation_exception import ValidationExceptionError

valid_json = {
    "patient_id": "49300028161",
    "comment": "here is a comment",
    "health_facility_name": "H0000",
}

invalid_missing_health_facility = {
    "patient_id": "49300028161",
    "comment": "here is a comment",
}

invalid_missing_patient_id = {
    "comment": "here is a comment",
    "health_facility_name": "H0000",
}

invalid_extra_field = {
    "patient_id": "49300028161",
    "comment": "here is a comment",
    "health_facility_name": "H0000",
    "some_extra_field": "some value",
}

valid_cancel_put_request = {
    "is_cancelled": True,
    "cancel_reason": "valid reason",
}

invalid_extra_field_for_cancel_put_request = {
    "is_cancelled": True,
    "cancel_reason": "valid reason",
    "some_extra_field": "some value",
}

invalid_field_type_for_cancel_put_request = {
    "is_cancelled": 11111,
    "cancel_reason": "valid reason",
}

missing_field_for_cancel_put_request = {
    "is_cancelled": True,
}

valid_not_attend_put_request = {
    "not_attend_reason": "valid reason",
}

invalid_extra_field_for_not_attend_put_request = {
    "not_attend_reason": "valid reason",
    "some_extra_field": "some value",
}

invalid_field_type_for_not_attend_put_request = {
    "not_attend_reason": 11111,
}


@pytest.mark.parametrize(
    "json, output_type, entity",
    [
        (valid_json, type(None), ReferralEntityValidator),
        (
            invalid_missing_health_facility,
            ValidationExceptionError,
            ReferralEntityValidator,
        ),
        (invalid_missing_patient_id, ValidationExceptionError, ReferralEntityValidator),
        (invalid_extra_field, ValidationExceptionError, ReferralEntityValidator),
        (valid_cancel_put_request, type(None), CancelStatusValidator),
        (
            invalid_extra_field_for_cancel_put_request,
            ValidationExceptionError,
            CancelStatusValidator,
        ),
        (
            missing_field_for_cancel_put_request,
            ValidationExceptionError,
            CancelStatusValidator,
        ),
        (
            invalid_field_type_for_cancel_put_request,
            ValidationExceptionError,
            CancelStatusValidator,
        ),
        (valid_not_attend_put_request, type(None), NotAttendValidator),
        (
            invalid_extra_field_for_not_attend_put_request,
            ValidationExceptionError,
            NotAttendValidator,
        ),
        (
            invalid_field_type_for_not_attend_put_request,
            ValidationExceptionError,
            NotAttendValidator,
        ),
    ],
)
def test_validation(json, output_type, entity):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            if entity is ReferralEntityValidator:
                entity.validate(json)
            if entity is CancelStatusValidator:
                entity.validate(json)
            if entity is NotAttendValidator:
                entity.validate(json)
    else:
        try:
            if entity is ReferralEntityValidator:
                entity.validate(json)
            if entity is CancelStatusValidator:
                entity.validate(json)
            if entity is NotAttendValidator:
                entity.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
