from typing import Annotated, Union

import phonenumbers
from pydantic_extra_types.phone_numbers import PhoneNumberValidator

PhoneNumberE164 = Annotated[
    Union[str, phonenumbers.PhoneNumber],
    PhoneNumberValidator(default_region="US", number_format="E164"),
]
