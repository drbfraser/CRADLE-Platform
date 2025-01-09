import re

from pydantic import field_validator

from common.commonUtil import format_phone_number, is_valid_email_format
from common.constants import USERNAME_REGEX_PATTERN
from enums import RoleEnum
from validation import CradleBaseModel

supported_roles = [role.value for role in RoleEnum]


class UserValidator(CradleBaseModel):
    """
    Base class for User models.
    Since the PUT request for updating a user's info should only be able to
    modify certain fields, this base class only defines the fields which are
    allowed to be changed. This way, the model for validating PUT requests does
    not need to include fields which it should not be able to change.

    {
        "name": "Jane",
        "email": "jane@mail.com",
        "health_facility_name": "facility7",
        "role": "admin",
        "phone_numbers": [ "+604-555-1234" ]
    }
    """

    email: str
    name: str
    health_facility_name: str
    role: str
    phone_numbers: list[str]
    supervises: list[int] = []

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, email: str):
        # Validate email format.
        email = email.lower()
        if not is_valid_email_format(email):
            raise ValueError(f"Email ({email}) format is invalid.")
        return email.lower()

    @field_validator("name")
    @classmethod
    def format_name(cls, name: str) -> str:
        """Convert name to title case."""
        name = name.title()
        return name

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str):
        if value not in supported_roles:
            error = {"message": f"({value}) is not a supported role"}
            raise ValueError(error)
        return value

    @field_validator("phone_numbers")
    @classmethod
    def format_phone_numbers(cls, phone_numbers: list[str]) -> list[str]:
        formatted_phone_numbers: set[str] = set()
        for phone_number in phone_numbers:
            formatted_phone_numbers.add(format_phone_number(phone_number))
        return list(formatted_phone_numbers)


class UserRegisterValidator(UserValidator):
    """
    User validation model for the `/api/user/register [POST]` api endpoint.
    """

    username: str
    password: str

    @field_validator("username")
    @classmethod
    def validate_username_format(cls, username: str) -> str:
        username = username.lower()
        length = len(username)
        if length < 3 or length > 30:
            raise ValueError(
                f"Username ({username}) is invalid. Username must be between 3 and 30 characters."
            )
        if re.fullmatch(USERNAME_REGEX_PATTERN, username) is None:
            raise ValueError(
                f"Username ({username}) is invalid. Username must start with a letter and must contain only alphanumeric or underscore characters."
            )
        return username


class UserAuthValidator(CradleBaseModel, extra="forbid"):
    """
    Pydantic validation model for the `/api/user/auth [POST]` api endpoint.
    Only needs to validate that the username and password fields are present,
    and convert the username to all lowercase.
    """

    username: str
    password: str

    @field_validator("username")
    @classmethod
    def format_username(cls, username: str) -> str:
        return username.lower()
