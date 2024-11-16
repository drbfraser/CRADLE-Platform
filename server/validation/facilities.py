from typing import Optional

from pydantic import BaseModel, ValidationError

from enums import FacilityTypeEnum
from validation.validation_exception import ValidationExceptionError


# Define a Pydantic model for incoming requests
class FacilityValidator(BaseModel):
    healthFacilityName: str
    healthFacilityPhoneNumber: Optional[str] = None
    location: Optional[str] = None
    facilityType: Optional[FacilityTypeEnum] = None
    about: Optional[str] = None

    class Config:
        use_enum_values = True

    @staticmethod
    def validate(request_body: dict):
        """
        Raises an error if the /api/facilities post request
        is not valid.

        :param request_body: The request body as a dict object
                            {
                                "healthFacilityName": "H12", - required
                                "healthFacilityPhoneNumber": "444-444-4444",
                                "about": "Biggest hospital",
                                "facilityType": "HOSPITAL"
                            }
        :throw: An error if the request body is invalid. None otherwise
        :return pydantic model representation of the request body param
        """
        try:
            return FacilityValidator(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)
