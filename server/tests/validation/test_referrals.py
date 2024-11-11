import pytest

from validation.referrals import (
    CancelStatusValidator,
    NotAttendValidator,
    ReferralEntityValidator,
)
from validation.validation_exception import ValidationExceptionError

valid_json = {
    "patientId": "49300028161",
    "comment": "here is a comment",
    "referralHealthFacilityName": "H0000",
}

invalid_missing_health_facility = {
    "patientId": "49300028161",
    "comment": "here is a comment",
}

invalid_missing_patient_id = {
    "comment": "here is a comment",
    "referralHealthFacilityName": "H0000",
}

invalid_extra_field = {
    "patientId": "49300028161",
    "comment": "here is a comment",
    "referralHealthFacilityName": "H0000",
    "some_extra_field": "some value",
}

valid_cancel_put_request = {
    "isCancelled": True,
    "cancelReason": "valid reason",
}

invalid_extra_field_for_cancel_put_request = {
    "isCancelled": True,
    "cancelReason": "valid reason",
    "some_extra_field": "some value",
}

invalid_field_type_for_cancel_put_request = {
    "isCancelled": 11111,
    "cancelReason": "valid reason",
}

missing_field_for_cancel_put_request = {
    "isCancelled": True,
}

valid_not_attend_put_request = {
    "notAttendReason": "valid reason",
}

invalid_extra_field_for_not_attend_put_request = {
    "notAttendReason": "valid reason",
    "some_extra_field": "some value",
}

invalid_field_type_for_not_attend_put_request = {
    "notAttendReason": 11111,
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
