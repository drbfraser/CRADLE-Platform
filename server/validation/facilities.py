from typing import Optional

from pydantic import BaseModel, ValidationError

from validation.validation_exception import ValidationExceptionError

# Define a Pydantic model for incoming requests


class Facility(BaseModel):
    healthFacilityName: str
    healthFacilityPhoneNumber: Optional[str] = None
    location: Optional[str] = None
    facilityType: Optional[str] = None
    about: Optional[str] = None

    @staticmethod
    def validate(request_body: dict):
        """
        Raise an error if the /api/facilities post request
        is not valid.

        :param request_body: The request body as a dict object
                            {
                                "healthFacilityName": "H12", - required
                                "healthFacilityPhoneNumber": "444-444-4444",
                                "about": "Biggest hospital",
                                "facilityType": "HOSPITAL"
                            }
        """
        try:
            Facility(**request_body)
        except ValidationError as e:
            raise ValidationExceptionError(str(e.errors()[0]["msg"]))
