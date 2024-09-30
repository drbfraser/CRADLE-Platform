from pydantic import (
    BaseModel,
    Field,
    field_validator,
    ValidationError,
    ValidationInfo,
)

from typing import Optional

from validation.validate import required_keys_present, values_correct_type


# Define a Pydantic model for incoming requests
class Facility(BaseModel):
    healthFacilityName: str
    healthFacilityPhoneNumber: Optional[str] = None
    location: Optional[str] = None
    facilityType: Optional[str] = None
    about: Optional[str] = None

    # class Config:
    #     validate_argument = True

    # Check if required keys are present
    # @field_validator("healthFacilityName")
    # def health_facility_name_provided(cls, value: str) -> str:
    #     if value is None:
    #         raise ValueError("This field cannot be left blank!")
    #     return value


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
        facility_data = Facility(**request_body)
    except ValidationError as e:
        return e.errors()[0]["msg"]
    return None


#     error_message = None

#     # Check if required keys are present
#     required_keys = ["healthFacilityName"]
#     error_message = required_keys_present(request_body, required_keys)
#     if error_message is not None:
#         return error_message

#     # Check that certain fields are of type string
#     error_message = values_correct_type(request_body, ["healthFacilityName"], str)
#     if error_message is not None:
#         return error_message

#     return error_message
