"""
phone_utils.py

This module provides utility functions for working with phone numbers
stored in the database, particularly for identifying and retrieving
relay phone numbers associated with system administrators.

Functions:
- is_phone_number_relay(phone_number): Checks if a given phone number is a relay number.
- get_all_relay_phone_numbers(): Retrieves all relay phone numbers associated with system administrators.
"""

import re

from data.db_operations import LOGGER
from enums import RoleEnum
from models import (
    UserPhoneNumberOrm,
)


def is_phone_number_relay(phone_number):
    # iterate through all admin phone numbers and remove dashes before comparision
    try:
        admin_phone_numbers = [
            re.sub(r"[-]", "", admin_phone_number.number)
            for admin_phone_number in UserPhoneNumberOrm.query.join(
                UserPhoneNumberOrm.user
            )
            .filter_by(role=RoleEnum.ADMIN.value)
            .all()
        ]

        if phone_number in admin_phone_numbers:
            return 1
        return 0
    except Exception as e:
        LOGGER.error(e)
        return -1


def get_all_relay_phone_numbers():
    try:
        admin_phone_numbers = [
            re.sub(r"[-]", "", admin_phone_number.number)
            for admin_phone_number in UserPhoneNumberOrm.query.join(
                UserPhoneNumberOrm.user
            )
            .filter_by(role=RoleEnum.ADMIN.value)
            .all()
        ]
        return admin_phone_numbers
    except Exception as e:
        LOGGER.error(e)
        return None
