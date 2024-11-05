import phonenumbers

from data import crud
from models import HealthFacility, RelayServerPhoneNumber, UserPhoneNumber

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

class PhoneNumberUtils:
    @staticmethod
    def is_phone_number_valid_format(phone_number: str) -> bool:
        """
        Validates the format of a provided phone number.

        :param phone_number: The phone number to validate.
        """
        try:
            parsed_phone_number = phonenumbers.parse(phone_number)
            return phonenumbers.is_valid_number(parsed_phone_number)
        except phonenumbers.NumberParseException:
            return False
    # End of function.

    @staticmethod
    def does_phone_number_exist(phone_number: str) -> bool:
        """
        Checks if the phone number is in our database.

        :param phone_number: The phone number to check.
        """
        # Parse the phone number.
        try:
            parsed_phone_number = phonenumbers.parse(phone_number)
        except phonenumbers.NumberParseException:
            return False

        # Convert the number to E.164 format.
        formatted_phone_number = phonenumbers.format_number(parsed_phone_number, phonenumbers.PhoneNumberFormat.E164)

        # Query database to determine if it contains the phone number.
        # Phone numbers could belong to users, health facilities, or
        # relay app servers.
        user_phone_number_model = crud.read(UserPhoneNumber, phone_number=formatted_phone_number)
        if user_phone_number_model is not None:
            return True
        health_facility_model = crud.read(HealthFacility, phone_number=formatted_phone_number)
        if health_facility_model is not None:
            return True
        relay_app_model = crud.read(RelayServerPhoneNumber, phone_number=formatted_phone_number)
        if relay_app_model is not None:
            return True

        # If none were found, phone number is not in the database.
        return False
    # End of function.
