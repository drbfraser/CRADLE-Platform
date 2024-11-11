from typing import Optional

from pydantic import BaseModel, ValidationError

from validation.validation_exception import ValidationExceptionError

# Define a Pydantic model for incoming requests


class Facility(BaseModel):
    health_facility_name: str
    phone_number: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    about: Optional[str] = None

    @staticmethod
    def validate(request_body: dict):
        """
        Raise an error if the /api/facilities post request
        is not valid.

        :param request_body: The request body as a dict object
                            {
                                "health_facility_name": "H12", - required
                                "phone_number": "444-444-4444",
                                "about": "Biggest hospital",
                                "type": "HOSPITAL"
                            }
        """
        try:
            Facility(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)
