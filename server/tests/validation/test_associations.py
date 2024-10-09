import pytest

from validation.associations import validate

from validation.validation_exception import ValidationExceptionError

valid_json = {"patientId": 47, "healthFacilityName": "H0000", "userId": 1}

# patientId field is missing
missing_field = {"healthFacilityName": "H0000", "userId": 1}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (valid_json, type(None)),
        (missing_field, ValidationExceptionError),
    ],
)
def test_validation(json, expectation):
    if type(expectation) is type and issubclass(expectation, Exception):
        with pytest.raises(expectation):
            validate(json)
    else:
        try:
            validate(json)
        except Exception:
            raise AssertionError
