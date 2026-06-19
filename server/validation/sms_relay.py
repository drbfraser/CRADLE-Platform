from typing import Optional

from pydantic import field_validator

from common.commonUtil import format_phone_number
from enums import HTTPMethodEnum
from validation import CradleBaseModel


class SmsRelayRequestBody(CradleBaseModel, extra="forbid"):
    phone_number: str
    encrypted_data: str

    @field_validator("phone_number")
    @classmethod
    def format_phone_numbers(cls, phone_number: str) -> str:
        formatted_phone_numbers = format_phone_number(phone_number)
        return formatted_phone_numbers


class SmsRelayDecryptedBody(CradleBaseModel, extra="forbid"):
    request_number: int
    method: HTTPMethodEnum
    endpoint: str
    headers: dict[str, str] = dict()
    body: Optional[str] = None

    @field_validator("method", mode="before")
    @classmethod
    def __validate_method_enum(cls, method):
        if method not in HTTPMethodEnum._member_names_:
            raise ValueError(
                "Invalid Method; Must be either GET, POST, HEAD, PUT, DELETE, or PATCH",
            )
        return method


class SmsRelayResponse(CradleBaseModel):
    code: int
    body: str
    iv: str
    user_sms_key: str
