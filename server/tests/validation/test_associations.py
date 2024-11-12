import pytest

from validation.associations import AssociationValidator
from validation.validation_exception import ValidationExceptionError

valid_json = {"patientId": 47, "healthFacilityName": "H0000", "userId": 1}

# patientId field is missing
missing_field = {"healthFacilityName": "H0000", "userId": 1}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_json, None),
        (missing_field, ValidationExceptionError),
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
