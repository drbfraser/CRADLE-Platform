from typing import Annotated

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
    _username = "jane-vht"
    _name = "Jane Smith"
    _email = "jane@email.com"
    _health_facility_name = "H1000"
    _role = "VHT"
    _phone_numbers = ["+1-604-321-1234"]
    _sms_key = SmsKeyExamples.valid_example

    valid_example = {
        "username": _username,
        "name": _name,
        "email": _email,
        "health_facility_name": _health_facility_name,
        "role": _role,
        "phone_numbers": _phone_numbers,
    }

    with_sms_key = {
        "username": _username,
        "name": _name,
        "email": _email,
        "health_facility_name": _health_facility_name,
        "role": _role,
        "phone_numbers": _phone_numbers,
        "sms_key": _sms_key,
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


class UserModelWithSmsKey(UserModel):
    sms_key: SmsKeyModel
