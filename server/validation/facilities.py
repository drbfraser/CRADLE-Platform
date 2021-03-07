from typing import Optional
from validation.validate import required_keys_present, values_correct_type
#from ..models import HealthFacility


def validate(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/facilities post request
    is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "healthFacilityName": "H12", - required
                            "healthFacilityPhoneNumber": "444-444-4444",
                            "about": "Biggest hospital",
                            "facilityType": "HOSPITAL"
                        }
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    # EXPECTED_KEYS = [
    #     'healthFacilityName',
    #     'healthFacilityPhoneNumber',
    #     'about',
    #     'facilityType',
    #     'location' 
    #     ]

    #EXPECTED_KEYS = dir(HealthFacility)

    error_message = None

    # Check if required keys are present
    required_keys = ["healthFacilityName"]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # Check that certain fields are of type string
    error_message = values_correct_type(request_body, ["healthFacilityName"], str)
    if error_message is not None:
        return error_message

    #Check that no extra keys are in the payload

    return error_message
