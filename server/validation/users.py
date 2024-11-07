from typing import List, Optional

from pydantic import BaseModel, ValidationError, field_validator

from enums import RoleEnum
from shared.phone_number_utils import PhoneNumberUtils
from validation.validation_exception import ValidationExceptionError

supported_roles = [role.value for role in RoleEnum]

class UserValidator(BaseModel):
    first_name: str
    email: str
    health_facility_name: str
    role: str
    supervises: Optional[List[int]] = None
    phone_numbers: Optional[List[str]] = None

    @field_validator("role", mode="before")
    @classmethod
    def validate_role(cls, value: str):
        if value not in supported_roles:
            error = {"message": "Not a supported role"}
            raise ValueError(error)

        return value

    @field_validator("phone_numbers", mode="before")
    @classmethod
    def validate_phone_numbers(cls, phone_numbers: List[str]):
        formatted_phone_numbers: list[str] = []
        for phone_number in phone_numbers:
            # Format the phone number.
            formatted_phone_number = PhoneNumberUtils.format(phone_number)
            # Validate the phone numbers uniqueness.
            if PhoneNumberUtils.does_E164_phone_number_exist(phone_number):
                raise ValueError({ "message": f"Phone number ({phone_number}) is already assigned." })
            # Append formatted phone number to list.
            formatted_phone_numbers.append(formatted_phone_number)
        # Return the formatted phone numbers.
        return formatted_phone_numbers

    @staticmethod
    def validate(request_body: dict):
        """
        Returns an error message if the /api/user post or put request
        is not valid. Else, returns None.

        :param request_body: The request body as a dict object
                            {
                                "firstName": "Jane",
                                "email": "jane@mail.com",
                                "healthFacilityName": "facility7",
                                "role": "admin"
                            }
        :throw: An error message if the request body is invalid. None otherwise
        """
        try:
            # Pydantic will validate field presence and type
            return UserValidator(**request_body)
        except ValidationError as e:
            # Extracts the first error message from the validation errors list
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)


class UserRegisterValidator(UserValidator):
    password: str

    @staticmethod
    def validate(request_body: dict):
        try:
            return UserRegisterValidator(**request_body)
        except ValidationError as e:
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)
