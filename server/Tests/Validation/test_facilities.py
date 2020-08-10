import pytest
from Validation.facilities import validate

valid_json = {
            "healthFacilityName": "H12",
            "healthFacilityPhoneNumber": "444-444-4444",
            "about": "Biggest hospital",
            "facilityType": "HOSPITAL"
    }

# healthFacilityName field is missing
missing_field = {
        "healthFacilityPhoneNumber": "444-444-4444",
        "about": "Biggest hospital",
        "facilityType": "HOSPITAL"
}

# healthFacilityName must be string
not_type_string = {
        "healthFacilityName": 7,
        "healthFacilityPhoneNumber": "444-444-4444",
        "about": "Biggest hospital",
        "facilityType": "HOSPITAL"
}
    
@pytest.mark.parametrize("json, output",
                         [
                             (valid_json, type(None)),
                             (missing_field, str),
                             (not_type_string, str)
                         ]
                         )
def test_validation(json, output):
    message = validate(json)
    assert type(message) == output


