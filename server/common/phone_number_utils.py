import phonenumbers

from data import crud
from models import (
    HealthFacilityOrm,
    RelayServerPhoneNumberOrm,
    UserOrm,
    UserPhoneNumberOrm,
)

"""
This file contains helper functions regarding phone numbers, such as validating
their format, querying the database to determine if a phone number is already in
the database, determining if a phone number belongs to a particular user.

The `phonenumbers` library is a Python port of Google's libphonenumber library.
It is used for phone number validation, as well as formatting the phone numbers
according to the E. 164 international standard. This is particularly useful
considering we will be working with phone numbers from different countries.
Storing the numbers in a consistent format will make them easier to work with.

https://www.sent.dm/resources/e164-phone-format

"""

invalid_error = "Phone number ({phone_number}) is invalid."


def parse(phone_number: str) -> phonenumbers.PhoneNumber:
    """
    Parses a phone number string into a PhoneNumber object. Throws a
    ValueError exception if parsing fails or if phone number format is
    invalid.

    :param parsed_phone_number: The phone number to parse.
    """
    try:
        parsed_phone_number = phonenumbers.parse(phone_number)
        if not phonenumbers.is_possible_number(parsed_phone_number):
            raise ValueError(invalid_error.format(phone_number=phone_number))
    except phonenumbers.NumberParseException:
        raise ValueError(invalid_error.format(phone_number=phone_number))
    else:
        return parsed_phone_number


def format(phone_number: str) -> str:
    """
    Formats the phone number into E. 164 format. Throws a ValueError exception
    if the provided phone number is not in a valid format already.

    :param parsed_phone_number: The phone number to format.
    """
    parsed_phone_number = parse(phone_number)
    return format_parsed_to_E164(parsed_phone_number)


def format_parsed_to_E164(parsed_phone_number: phonenumbers.PhoneNumber):
    """
    Format phone number to be in E. 164 format.

    :param parsed_phone_number: The parsed PhoneNumber object to format.
    """
    return phonenumbers.format_number(
        parsed_phone_number, phonenumbers.PhoneNumberFormat.E164
    )


def format_to_E164(phone_number: str) -> str:
    """
    Format phone number to be in E. 164 format.

    :param phone_number: The phone number to format.
    """
    parsed_phone_number = phonenumbers.parse(phone_number)
    return format_parsed_to_E164(parsed_phone_number)


def is_parsed_format_valid(parsed_phone_number: phonenumbers.PhoneNumber) -> bool:
    """
    Validates the format of a parsed PhoneNumber object.

    :param parsed_phone_number: The PhoneNumber object to validate.
    """
    return phonenumbers.is_possible_number(parsed_phone_number)


def is_format_valid(phone_number: str) -> bool:
    """
    Validates the format of a provided phone number.

    :param phone_number: The phone number to validate.
    """
    try:
        parsed_phone_number = phonenumbers.parse(phone_number)
        return phonenumbers.is_possible_number(parsed_phone_number)
    except phonenumbers.NumberParseException:
        return False


def does_phone_number_exist(phone_number: str) -> bool:
    """
    Checks if the phone number is in our database.
    Assumes that the phone number is already in E. 164 format.

    :param phone_number: The phone number (in E. 164 format) to check.
    """
    # Query database to determine if it contains the phone number.
    # Phone numbers could belong to users, health facilities, or
    # relay app servers.
    if crud.read(UserPhoneNumberOrm, phone_number=phone_number) is not None:
        return True
    if crud.read(HealthFacilityOrm, phone_number=phone_number) is not None:
        return True
    if crud.read(RelayServerPhoneNumberOrm, phone_number=phone_number) is not None:
        return True
    # If none were found, phone number is not in the database.
    return False


def does_phone_number_belong_to_a_user(phone_number: str):
    """
    Checks if the phone number belongs to any user in the system.

    :param phone_number: The phone number to check (in E. 164 format).
    """
    return crud.read(UserPhoneNumberOrm, phone_number=phone_number) is not None


def does_phone_number_belong_to_user(user_id: int, phone_number: str):
    """
    Checks if the phone number belongs to the user identified by username.
    Assumes that the phone number's format has already been validated.

    :param user_id: The id of the user.
    :param phone_number: The phone number to check (in E. 164 format).
    """
    return (
        crud.read(UserPhoneNumberOrm, user_id=user_id, phone_number=phone_number)
        is not None
    )


def is_phone_number_unique_to_user(user_id: int, phone_number: str):
    """
    Checks if a phone number doesn't exist in the database, or if it does,
    if it belongs to the user.

    :param user_id: The id of the user.
    :param phone_number: The phone number to check (in E. 164 format).

    :return: True if the phone number belongs to the user or if it doesn't
        exist in the database at all. Otherwise, False.
    """
    return not does_phone_number_exist(
        phone_number
    ) or does_phone_number_belong_to_user(user_id, phone_number)


def add_user_phone_number(user_id: int, phone_number: str):
    """
    Adds a new phone number to the database, associated with the specified user.

    :param user_id: The id of the user.
    :param phone_number: The phone number to add for the user. Should already be in E. 164 format.
    """
    # Add row to database.
    user_model = crud.read(UserOrm, id=user_id)
    crud.create(UserPhoneNumberOrm(phone_number=phone_number, user=user_model))


def delete_user_phone_number(user_id: int, phone_number: str):
    """
    Deletes the specified phone number associated with the specified user
    from the database.

    :param user_id: The id of the user.
    :param phone_number: The phone number to delete for the user. Should already be in E. 164 format.
    """
    # Get the user model from the database.
    user_orm_model = crud.read(UserOrm, id=user_id)
    if not user_orm_model:
        raise ValueError(f"No user with id ({user_id}) was found.")
    # Delete row from database.
    crud.delete(UserPhoneNumberOrm(phone_number=phone_number, user=user_orm_model))


def get_users_phone_numbers(user_id: int) -> list[str]:
    """
    Retrieves all of the phone numbers associated with the user and returns
    them as a list.

    :param user_id: The id of the user.
    """
    user_phone_number_orms = crud.read_all(UserPhoneNumberOrm, user_id=user_id)
    phone_numbers = [
        phone_number_orm.phone_number for phone_number_orm in user_phone_number_orms
    ]
    return phone_numbers


def replace_phoneNumber_for_user(current_phone_number, new_phone_number, user_id):
    # Check to see if current_phone_number belongs to user_id and if new_phone_number belongs to anyone
    if (does_phone_number_belong_to_user(user_id, current_phone_number)) and (
        not does_phone_number_exist(new_phone_number)
    ):
        crud.update(
            UserPhoneNumberOrm,
            {"phone_number": new_phone_number},
            phone_number=current_phone_number,
            user_id=user_id,
        )
        return True
    return False
