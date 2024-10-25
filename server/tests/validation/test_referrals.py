import pytest

from validation.referrals import CancelStatus, NotAttend, ReferralEntity
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
        (valid_json, type(None), ReferralEntity),
        (invalid_missing_health_facility, ValidationExceptionError, ReferralEntity),
        (invalid_missing_patient_id, ValidationExceptionError, ReferralEntity),
        (invalid_extra_field, ValidationExceptionError, ReferralEntity),
        (valid_cancel_put_request, type(None), CancelStatus),
        (
            invalid_extra_field_for_cancel_put_request,
            ValidationExceptionError,
            CancelStatus,
        ),
        (missing_field_for_cancel_put_request, ValidationExceptionError, CancelStatus),
        (
            invalid_field_type_for_cancel_put_request,
            ValidationExceptionError,
            CancelStatus,
        ),
        (valid_not_attend_put_request, type(None), NotAttend),
        (
            invalid_extra_field_for_not_attend_put_request,
            ValidationExceptionError,
            NotAttend,
        ),
        (
            invalid_field_type_for_not_attend_put_request,
            ValidationExceptionError,
            NotAttend,
        ),
    ],
)
def test_validation(json, output_type, entity):
    if type(output_type) is type and issubclass(output_type, Exception):
        with pytest.raises(output_type):
            if entity is ReferralEntity:
                entity.validate(json)
            if entity is CancelStatus:
                entity.validate_cancel_put_request(json)
            if entity is NotAttend:
                entity.validate_not_attend_put_request(json)
    else:
        try:
            if entity is ReferralEntity:
                entity.validate(json)
            if entity is CancelStatus:
                entity.validate_cancel_put_request(json)
            if entity is NotAttend:
                entity.validate_not_attend_put_request(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
