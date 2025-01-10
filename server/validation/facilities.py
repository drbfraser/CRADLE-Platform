from typing import Optional

from enums import FacilityTypeEnum
from validation import CradleBaseModel
from validation.phone_numbers import PhoneNumberE164


# Define a Pydantic model for incoming requests
class HealthFacilityModel(CradleBaseModel):
    """
    {
        "name": "H1200",
        "phone_number": "+1-604-715-2845",
        "about": "Biggest hospital",
        "type": "HOSPITAL"
    }
    """

    name: str
    phone_number: Optional[PhoneNumberE164] = None
    location: Optional[str] = None
    about: Optional[str] = None
    type: Optional[FacilityTypeEnum] = None
