from typing import Annotated, Optional

from pydantic import AfterValidator, EmailStr

from common.commonUtil import (
    to_lowercase,
    to_titlecase,
    to_uppercase,
)
from enums import RoleEnum
from validation import CradleBaseModel
from validation.phone_numbers import PhoneNumberE164
from validation.sms_key import SmsKeyExamples, SmsKeyModel

supported_roles = [role.value for role in RoleEnum]

Username = Annotated[str, AfterValidator(to_lowercase)]


class UserExamples:
    id_01 = 7
    id_02 = 8
    username = "jane-vht"
    name = "Jane Smith"
    email = "jane@email.com"
    health_facility_name = "H1000"
    role = "VHT"
    phone_numbers = ["+16043211234"]
    sms_key = SmsKeyExamples.valid_example

    valid_example = {
        "id": id_01,
        "username": username,
        "name": name,
        "email": email,
        "health_facility_name": health_facility_name,
        "role": role,
        "phone_numbers": phone_numbers,
    }

    with_sms_key = {
        "id": id_01,
        "username": username,
        "name": name,
        "email": email,
        "health_facility_name": health_facility_name,
        "role": role,
        "phone_numbers": phone_numbers,
        "sms_key": sms_key,
    }


class UserModel(CradleBaseModel):
    id: int
    username: Username
    email: EmailStr
    name: Annotated[str, AfterValidator(to_titlecase)]
    health_facility_name: Annotated[str, AfterValidator(to_uppercase)]
    role: RoleEnum
    phone_numbers: list[PhoneNumberE164]
    supervises: list[int] = []


class UserWithSmsKey(UserModel):
    sms_key: SmsKeyModel


class RegisterUserRequestBody(UserModel):
    id: Optional[int] = None
    password: str
