import pytest

from validation.associations import validate

valid_json = {"patientId": 47, "healthFacilityName": "H0000", "userId": 1}

# patientId field is missing
missing_field = {"healthFacilityName": "H0000", "userId": 1}


@pytest.mark.parametrize(
    "json, output_type", [(valid_json, type(None)), (missing_field, str)],
)
def test_validation(json, output_type):
    message = validate(json)
    assert type(message) is output_type
