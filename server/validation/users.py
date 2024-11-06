from typing import List, Optional

from pydantic import BaseModel, ValidationError, field_validator

from common.regexUtil import phoneNumber_regex_check
from enums import RoleEnum
from validation.validation_exception import ValidationExceptionError

supported_roles = [role.value for role in RoleEnum]

# Error messages
invalid_phone_number = (
    "Phone number {phoneNumber} has wrong format. The format for phone number should be +x-xxx-xxx-xxxx, "
    "+x-xxx-xxx-xxxxx, xxx-xxx-xxxx or xxx-xxx-xxxxx"
)


class UserValidator(BaseModel):
    firstName: str
    email: str
    healthFacilityName: str
    role: str
    supervises: Optional[List[int]] = None
    phoneNumbers: Optional[List[str]] = None

    @field_validator("role", mode="before")
    @classmethod
    def validate_role(cls, value: str):
        if value not in supported_roles:
            error = {"message": "Not a supported role"}
            raise ValueError(error)

        return value

    @field_validator("phoneNumbers", mode="before")
    @classmethod
    def validate_phone_number(cls, phone_numbers: List[str]):
        error = {"message": invalid_phone_number}

        if not isinstance(phone_numbers, List):
            raise ValueError(error)

        for phone_number in phone_numbers:
            if phone_number is not None and not phoneNumber_regex_check(phone_number):
                raise ValueError(error)

        return phone_numbers

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
