from typing import Annotated

from pydantic_extra_types.phone_numbers import PhoneNumberValidator

PhoneNumberE164 = Annotated[
    str,
    PhoneNumberValidator(default_region="US", number_format="E164"),
]
