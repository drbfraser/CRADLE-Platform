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

class PhoneNumberUtils:
    @staticmethod
    def format_parsed_to_E164(parsed_phone_number: phonenumbers.PhoneNumber):
        """
        Format phone number to be in E. 164 format.

        :param parsed_phone_number: The parsed PhoneNumber object to format.
        """
        return phonenumbers.format_number(parsed_phone_number, phonenumbers.PhoneNumberFormat.E164)
    # End of function.

    @staticmethod
    def format_to_E164(phone_number: str) -> str:
        """
        Format phone number to be in E. 164 format.

        :param phone_number: The phone number to format.
        """
        parsed_phone_number = phonenumbers.parse(phone_number)
        return PhoneNumberUtils.format_parsed_to_E164(parsed_phone_number)
    # End of function.

    @staticmethod
    def is_phone_number_valid(phone_number: str) -> bool:
        """
        Validates the format of a provided phone number.

        :param phone_number: The phone number to validate.
        """
        try:
            parsed_phone_number = phonenumbers.parse(phone_number)
            return phonenumbers.is_possible_number(parsed_phone_number)
        except phonenumbers.NumberParseException:
            return False
    # End of function.

    @staticmethod
    def does_E164_phone_number_exist(formatted_phone_number: str) -> bool:
        """
        Checks if the phone number is in our database.
        Assumes that the phone number is already in E. 164 format.

        :param phone_number: The phone number (in E. 164 format) to check.
        """
        # Query database to determine if it contains the phone number.
        # Phone numbers could belong to users, health facilities, or
        # relay app servers.
        user_phone_number_model = crud.read(UserPhoneNumberOrm, phone_number=formatted_phone_number)
        if user_phone_number_model is not None:
            return True
        health_facility_model = crud.read(HealthFacilityOrm, phone_number=formatted_phone_number)
        if health_facility_model is not None:
            return True
        relay_app_model = crud.read(RelayServerPhoneNumberOrm, phone_number=formatted_phone_number)
        if relay_app_model is not None:
            return True

        # If none were found, phone number is not in the database.
        return False
    # End of function.

    @staticmethod
    def does_phone_number_exist(phone_number: str) -> bool:
        """
        Checks if the phone number is in our database.

        :param phone_number: The phone number to check.
        """
        try:
            # Format the phone number.
            formatted_phone_number = PhoneNumberUtils.format_to_E164(phone_number)
            return PhoneNumberUtils.does_E164_phone_number_exist(formatted_phone_number)
        except phonenumbers.NumberParseException:
            return False
    # End of function.

    @staticmethod
    def does_E164_phone_number_belong_to_user(user_id: int, formatted_phone_number: str):
        """
        Checks if the phone number belongs to the user identified by username.
        Assumes that the phone number's format has already been validated.

        :param user_id: The id of the user.
        :param formatted_phone_number: The phone number to check (in E. 164 format).
        """
        user_phone_number_model = crud.read(UserPhoneNumberOrm, user_id=user_id, phone_number=formatted_phone_number)
        return user_phone_number_model is not None
    # End of function.
    @staticmethod
    def does_phone_number_belong_to_user(user_id: int, phone_number: str):
        """
        Checks if the phone number belongs to the user identified by username.
        Assumes that the phone number's format has already been validated.

        :param user_id: The id of the user.
        :param phone_number: The phone number to check.
        """
        # Convert number to E. 164 format.
        try:
            formatted_phone_number = PhoneNumberUtils.format_to_E164(phone_number)
            return PhoneNumberUtils.does_E164_phone_number_belong_to_user(user_id=user_id,
                                                                   formatted_phone_number=formatted_phone_number)
        except phonenumbers.NumberParseException:
            return False
    # End of function.

    @staticmethod
    def add_user_phone_number(user_id: int, phone_number: str):
        """
        Adds a new phone number to the database, associated with the specified user.

        :param user_id: The id of the user.
        :param phone_number: The phone number to add for the user.
        """
        # Parse the phone number.
        parsed_phone_number = phonenumbers.parse(phone_number)
        # Validate the number.
        is_valid = phonenumbers.is_possible_number(parsed_phone_number)
        if not is_valid:
            print(f"Formatted number: ({PhoneNumberUtils.format_parsed_to_E164(parsed_phone_number)})")
            raise RuntimeError(f"Phone number ({phone_number}) is invalid.")
        # Format the number.
        formatted_phone_number = PhoneNumberUtils.format_parsed_to_E164(parsed_phone_number)

        # Check if the number is already in the database.
        if PhoneNumberUtils.does_E164_phone_number_exist(formatted_phone_number):
            raise RuntimeError(f"Phone number ({phone_number}) is already assigned.")

        # Add row to database.
        user_model = crud.read(UserOrm, id=user_id)
        crud.create(UserPhoneNumberOrm(phone_number=formatted_phone_number, user=user_model))
    # End of function.

    @staticmethod
    def delete_user_E164_phone_number(user_id: int, formatted_phone_number: str):
        """
        Deletes the specified phone number associated with the specified user
        from the database.

        :param user_id: The id of the user.
        :param formatted_phone_number: The phone number (in E. 164 format) to
            delete for the user.
        """
        # Get the user model from the database.
        user_model = crud.read(UserOrm, id=user_id)

        if not user_model:
            raise RuntimeError(f"No user with id ({user_id}) was found.")

        # Check if the number belongs to the user.
        if not PhoneNumberUtils.does_E164_phone_number_belong_to_user(user_id=user_id,
                                                                      formatted_phone_number=formatted_phone_number):
            raise RuntimeError(f"Phone number ({formatted_phone_number}) is not assigned to user ({user_id}).")

        # Delete row from database.
        crud.delete(UserPhoneNumberOrm(phone_number=formatted_phone_number, user=user_model))
    # End of function.

    @staticmethod
    def delete_user_phone_number(user_id: int, phone_number: str):
        """
        Deletes the specified phone number associated with the specified user
        from the database.

        :param user_id: The id of the user.
        :param phone_number: The phone number to delete for the user.
        """
        # Format the number.
        formatted_phone_number = PhoneNumberUtils.format_to_E164(phone_number)

        PhoneNumberUtils.delete_user_E164_phone_number(user_id=user_id,
                                                       formatted_phone_number=formatted_phone_number)
    # End of function.
