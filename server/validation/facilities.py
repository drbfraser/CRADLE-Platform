from typing import Annotated, Optional

from pydantic import AfterValidator

from enums import FacilityTypeEnum
from server.common.commonUtil import to_uppercase
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
    location: Annotated[
        str, AfterValidator(to_uppercase)
    ]  # Store in uppercase for case-insensitivity
    about: str
    type: FacilityTypeEnum
