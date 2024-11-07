import re
from typing import List

from pydantic import BaseModel, ValidationError, field_validator, model_validator
from typing_extensions import Self

from enums import RoleEnum
from server.shared.health_facility_utils import HealthFacilityUtils
from shared.phone_number_utils import PhoneNumberUtils
from shared.user_utils import UserUtils
from validation.validation_exception import ValidationExceptionError

supported_roles = [role.value for role in RoleEnum]

class UserValidator(BaseModel):
    name: str
    username: str
    email: str
    health_facility_name: str
    role: str
    phone_numbers: List[str] = []

    @field_validator("username", mode="before")
    @classmethod
    def validate_username_format(cls, username: str) -> str:
        username = username.lower()
        length = len(username)
        if length < 3 or length > 30:
            raise ValueError(f"Username ({username}) is invalid. Username must be between 3 and 30 characters.")
        username_regex_pattern = r"^[A-Za-z]\w{2,29}$"
        if re.fullmatch(username_regex_pattern, username) is None:
            raise ValueError(f"Username ({username}) is invalid. Username must start with a letter and must contain only alphanumeric or underscore characters.")
        return username

    @field_validator("role", mode="before")
    @classmethod
    def validate_role(cls, value: str):
        if value not in supported_roles:
            error = {"message": f"({value}) is not a supported role"}
            raise ValueError(error)
        return value

    @field_validator("email", mode="before")
    @classmethod
    def validate_email_format(cls, email: str):
        # Validate email format.
        email_regex_pattern = r"^[\w\-.]+@([\w\-]+\.)+[\w\-]{2,4}$"
        email = email.lower()
        if re.fullmatch(email_regex_pattern, email) is None:
            raise ValueError(f"Email ({email}) is invalid.")
        return email.lower()

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

    @field_validator("health_facility_name")
    @classmethod
    def validate_health_facility_existence(cls, health_facility_name: str) -> str:
        health_facility_name = health_facility_name.title()
        if not HealthFacilityUtils.does_facility_exist(health_facility_name):
            raise ValueError(f"Health facility ({health_facility_name}) not found.")
        return health_facility_name

    @field_validator("name")
    @classmethod
    def format_name(cls, name: str) -> str:
        """
        Convert name to title case.
        """
        name = name.title()
        return name


    @staticmethod
    def validate(request_body: dict):
        """
        Returns an error message if the /api/user post or put request
        is not valid. Else, returns None.

        :param request_body: The request body as a dict object
                            {
                                "name": "Jane",
                                "email": "jane@mail.com",
                                "health_facility_name": "facility7",
                                "role": "admin",
                                "phone_numbers": [ "+604-555-1234" ]
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

    @field_validator("email", mode="after")
    @classmethod
    def validate_email_uniqueness(cls, email: str):
        # Email should already be converted to lowercase.
        # Validate that email isn't already taken.
        if UserUtils.does_email_exist(email):
            raise ValueError(f"Email ({email}) is already in use.")
        return email

    @field_validator("username", mode="after")
    @classmethod
    def validate_username_uniqueness(cls, username: str):
        # Username should already be converted to lowercase.
        # Validate that username isn't already taken.
        if UserUtils.does_username_exist(username):
            raise ValueError(f"Email ({username}) is already in use.")
        return username

    @staticmethod
    def validate(request_body: dict):
        try:
            return UserRegisterValidator(**request_body)
        except ValidationError as e:
            error_message = str(e.errors()[0]["msg"])
            raise ValidationExceptionError(error_message)

class UserPutRequestValidator(UserValidator):
    """
    Pydantic validation model for the `/api/user/<int:userId> [PUT]`
    api endpoint.
    """

    id: int

    @model_validator(mode="after")
    def validate_email_uniqueness(self) -> Self:
        # Validate that email doesn't belong to another user.
        if not UserUtils.is_email_unique_to_user(self.email, self.id):
            raise ValueError(f"Email ({self.email}) is already in use.")
        return self

class UserAuthRequestValidator(BaseModel):
    """
    Pydantic validation model for the `/api/user/auth [POST]` api endpoint.
    Only needs to validate that the username and password fields are present,
    and convert the username to all lowercase.
    """

    username: str # Can be username or email.
    password: str

    @field_validator("username")
    @classmethod
    def format_username(cls, username: str) -> str:
        return username.lower()
