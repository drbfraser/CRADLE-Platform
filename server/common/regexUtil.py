import re


# Abstract regex check into a module to avoid duplicate
def phoneNumber_regex_check(phone_number):
    """Return True if the phone number matches a valid format (with or without area code)."""
    # The format of phone number is xxx-xxx-xxxxx
    regex_phone_number_format_with_area_code = (
        r"^([0-9+-]\+?\d{1}?[-]?\(?\d{3}[)-]?\d{3}[-]?\d{4,5})$"
    )
    regex_phone_number_format_normal = r"^(\d{3}-?\d{3}-?\d{4,5})$"
    checked_number_with_area_code = re.match(
        regex_phone_number_format_with_area_code,
        phone_number,
    )
    checked_number = re.match(regex_phone_number_format_normal, phone_number)

    if not checked_number and not checked_number_with_area_code:
        return False
    return True
