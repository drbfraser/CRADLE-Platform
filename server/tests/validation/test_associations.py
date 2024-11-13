import pytest

from validation.associations import AssociationValidator
from validation.validation_exception import ValidationExceptionError

valid_json = {"patient_id": 47, "health_facility_name": "H0000", "user_id": 1}

# patient_id field is missing
missing_field = {"health_facility_name": "H0000", "user_id": 1}


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
