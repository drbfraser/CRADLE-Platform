import re

import phonenumbers
from server.common.constants import EMAIL_REGEX_PATTERN


def filterNestedAttributeWithValueNone(payload: dict) -> dict:
    """
    Returns dict with all the nested key-value pairs wherein the value is not None

    :param payload: The dictionary to evaluate
    """
    updated_data = {}
    for k in payload:
        v = payload[k]
        if type(v) is list:
            updated_list = []
            for item in v:
                if isinstance(item, dict):
                    updated_list_item = filterNestedAttributeWithValueNone(item)
                    if len(updated_list_item) != 0:
                        updated_list.append(updated_list_item)
                elif item is not None:
                    updated_list.append(item)

            updated_data[k] = updated_list
        elif v is not None:
            updated_data[k] = v

    return updated_data


def is_valid_email_format(email: str) -> bool:
    return re.fullmatch(EMAIL_REGEX_PATTERN, email) is not None


def format_phone_number(phone_number: str):
    try:
        parsed_phone_number = phonenumbers.parse(phone_number)
        if not phonenumbers.is_possible_number(parsed_phone_number):
            raise ValueError(f"Phone number ({phone_number}) is invalid.")
    except phonenumbers.NumberParseException:
        raise ValueError(f"Phone number ({phone_number}) is invalid.")
    else:
        return phonenumbers.format_number(
            parsed_phone_number, phonenumbers.PhoneNumberFormat.E164
        )
