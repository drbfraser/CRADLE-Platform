from typing import Optional

from pydantic import BaseModel, ValidationError


# Define a Pydantic model for incoming requests
class Facility(BaseModel):
    healthFacilityName: str
    healthFacilityPhoneNumber: Optional[str] = None
    location: Optional[str] = None
    facilityType: Optional[str] = None
    about: Optional[str] = None


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
    try:
        Facility(**request_body)
    except ValidationError as e:
        return e.errors()[0]["msg"]
    return None
