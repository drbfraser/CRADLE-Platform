from typing import Annotated

from pydantic_extra_types.phone_numbers import PhoneNumberValidator

# Automatically validates phone number and formats it to be in E164 format.
PhoneNumberE164 = Annotated[
    str,
    PhoneNumberValidator(default_region="US", number_format="E164"),
]
