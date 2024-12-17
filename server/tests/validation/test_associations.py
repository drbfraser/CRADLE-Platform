import pytest

from validation.associations import AssociationValidator
from validation.validation_exception import ValidationExceptionError

PATIENT_ID = 20
USER_ID = 1

association_with_valid_fields_should_return_none = {
    "patient_id": PATIENT_ID,
    "health_facility_name": "H0000",
    "user_id": USER_ID,
}

association_missing_optional_field_userID_should_return_none = {
    "patient_id": PATIENT_ID,
    "health_facility_name": "H0000",
}

association_missing_optional_field_health_facility_name_should_return_none = {
    "patient_id": PATIENT_ID,
    "user_id": USER_ID,
}

association_missing_required_field_patient_id_should_throw_exception = {
    "health_facility_name": "H0000",
    "user_id": USER_ID,
}

association_field_patiendID_has_wrong_type_should_throw_exception = {
    "patient_id": "not integer",
    "health_facility_name": "H0000",
    "user_id": USER_ID,
}

association_field_health_facility_name_has_wrong_type_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "health_facility_name": 1,
    "user_id": USER_ID,
}

association_field_user_id_has_wrong_type_should_throw_exception = {
    "patient_id": PATIENT_ID,
    "health_facility_name": "H0000",
    "user_id": "not integer",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (association_with_valid_fields_should_return_none, None),
        (association_missing_optional_field_userID_should_return_none, None),
        (
            association_missing_optional_field_health_facility_name_should_return_none,
            None,
        ),
        (
            association_missing_required_field_patient_id_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            association_field_patiendID_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            association_field_health_facility_name_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            association_field_user_id_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
    ],
)
def test_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            AssociationValidator.validate(json)
    else:
        try:
            AssociationValidator.validate(json)
        except ValidationExceptionError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
