import pytest

from validation.associations import AssociationValidator
from validation.validation_exception import ValidationExceptionError

PATIENT_ID = 20
USER_ID = 1

association_with_valid_fields_should_return_none = {
    "patientId": PATIENT_ID,
    "healthFacilityName": "H0000",
    "userId": USER_ID,
}

association_missing_optional_field_userID_should_return_none = {
    "patientId": PATIENT_ID,
    "healthFacilityName": "H0000",
}

association_missing_optional_field_healthFacilityName_should_return_none = {
    "patientId": PATIENT_ID,
    "userId": USER_ID,
}

association_missing_required_field_patientId_should_throw_exception = {
    "healthFacilityName": "H0000",
    "userId": USER_ID,
}

association_field_patiendID_has_wrong_type_should_throw_exception = {
    "patientId": "not integer",
    "healthFacilityName": "H0000",
    "userId": USER_ID,
}

association_field_healthFacilityName_has_wrong_type_should_throw_exception = {
    "patientId": PATIENT_ID,
    "healthFacilityName": 1,
    "userId": USER_ID,
}

association_field_userId_has_wrong_type_should_throw_exception = {
    "patientId": PATIENT_ID,
    "healthFacilityName": "H0000",
    "userId": "not integer",
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (association_with_valid_fields_should_return_none, None),
        (association_missing_optional_field_userID_should_return_none, None),
        (
            association_missing_optional_field_healthFacilityName_should_return_none,
            None,
        ),
        (
            association_missing_required_field_patientId_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            association_field_patiendID_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            association_field_healthFacilityName_has_wrong_type_should_throw_exception,
            ValidationExceptionError,
        ),
        (
            association_field_userId_has_wrong_type_should_throw_exception,
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
