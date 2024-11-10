import logging
import os
import re
import secrets
from typing import Any, TypedDict, cast

from botocore.exceptions import ClientError

from authentication import cognito
from common.constants import EMAIL_REGEX_PATTERN
from config import db
from data import crud, marshal
from enums import RoleEnum
from models import SmsSecretKeyOrm, UserOrm, UserPhoneNumberOrm
from server.common.date_utils import get_future_date
from shared.phone_number_utils import PhoneNumberUtils

sms_key_duration = os.getenv("SMS_KEY_DURATION")
if sms_key_duration is None:
    SMS_KEY_DURATION = 40
else:
    SMS_KEY_DURATION = int(sms_key_duration)

logger = logging.getLogger(__name__)


supported_roles = [supported_role.value for supported_role in RoleEnum]

"""
This file contains helper functions for managing users and keeping the
AWS Cognito user pool in sync with our database.
"""


# Dictionary representation of marshalled user model.
class UserDict(TypedDict):
    id: int
    name: str
    username: str
    email: str
    health_facility_name: str
    role: str
    sub: str


class UserDictWithPhoneNumbers(UserDict):
    phone_numbers: list[str]


class UserUtils:
    @staticmethod
    def is_valid_email_format(email: str) -> bool:
        return re.fullmatch(EMAIL_REGEX_PATTERN, email) is not None

    # End of function.

    @staticmethod
    def get_user_orm_from_username(username: str):
        """
        :param username: String to identify user in the database. Can be either
            the user's username or their email. Should be in lowercase.
        :return user_orm: The ORM model of the user.
        :raise ValueError: If the user can not be found in the database.
        """
        # Determine if username is an email or not.
        if UserUtils.is_valid_email_format(username):
            user_orm = crud.read(UserOrm, email=username)
        else:
            user_orm = crud.read(UserOrm, username=username)
        if user_orm is None:
            raise ValueError(f"No user with username ({username}) found.")
        return user_orm

    # End of function.

    @staticmethod
    def get_user_dict_from_orm(user_orm: UserOrm) -> UserDict:
        """
        :param user_orm: ORM model of the user.
        :return user_dict: A dict containing the data from the ORM model of the
            user.
        """
        user_dict = marshal.marshal(user_orm)
        return cast(UserDict, user_dict)

    # End of function.

    @staticmethod
    def get_user_dict_from_username(username: str) -> UserDict:
        """
        :param username: String to identify user in the database. Can be either
            the user's username or their email. Should be in lowercase.
        :return user_dict: A dict containing the data from the ORM model of the
            user.
        :raise ValueError: If the user can not be found in the database.
        """
        user_orm = UserUtils.get_user_orm_from_username(username)
        return UserUtils.get_user_dict_from_orm(user_orm)

    # End of function.

    @staticmethod
    def get_user_dict_from_id(user_id: int) -> UserDict:
        user_orm = crud.read(UserOrm, id=user_id)
        return UserUtils.get_user_dict_from_orm(user_orm)

    # End of function.

    @staticmethod
    def get_user_id_from_username(username: str) -> int:
        user_orm = UserUtils.get_user_orm_from_username(username)
        user_dict = UserUtils.get_user_dict_from_orm(user_orm)
        return user_dict["id"]

    @staticmethod
    def get_user_dict_with_phone_numbers(username: str) -> UserDictWithPhoneNumbers:
        user_dict = UserUtils.get_user_dict_from_username(username)
        phone_numbers = PhoneNumberUtils.get_users_phone_numbers(user_dict["id"])
        return UserDictWithPhoneNumbers(phone_numbers=phone_numbers, **user_dict)

    # End of function.

    # End of function.

    @staticmethod
    def does_email_exist(email: str) -> bool:
        """
        :param email: The email to check.
        :return bool: True if the email is already in the database, False if it is not.
        """
        return (crud.read(UserOrm, email=email)) is not None

    # End of function.

    @staticmethod
    def does_email_belong_to_user(email: str, user_id: int) -> bool:
        """
        :param email: The email to check.
        :param user_id: The id of the user to check for ownership.
        :return bool: True if the email belongs to the user.
        """
        return (crud.read(UserOrm, email=email, id=user_id)) is not None

    # End of function.

    @staticmethod
    def is_email_unique_to_user(user_id: int, email: str) -> bool:
        """
        :param user_id: The id of the user to check for ownership.
        :param email: The email to check.
        :return bool: True if the email belongs to the user or is not in the
            database.
        """
        return (
            crud.read(UserOrm, email=email) is None
            or crud.read(UserOrm, email=email, id=user_id) is not None
        )

    # End of function.

    @staticmethod
    def register_user(
        username: str,
        email: str,
        name: str,
        health_facility_name: str,
        role: str,
        phone_numbers: list[str],
    ):
        """
        Creates a user in our database and registers the new user in the Cognito
        user pool. The new user will have a temporary password generated and an
        email containing the temporary password will be sent to their email. When
        the user first logs in, they will be prompted to create a new permanent
        password.

        :param username: The username for the new user.
        :param email: The email address of the new user.
        :param name: The name of the new user.
        :param health_facility_name: The identifier of the healthcare facility that the user is
            assigned to.
        :param role: The role of the new user.
        """
        try:
            # Create the user in the user pool.
            response = cognito.create_user(username=username, email=email, name=name)
            cognito_user = response.get("User")
            cognito_username = cognito_user.get("Username")
            if cognito_username is None:
                raise ValueError("Could not retrieve username from user pool.")
            username = cognito_username
            user_attributes = cognito_user.get("Attributes")
            if user_attributes is None:
                cognito.delete_user(username)
                raise ValueError("Could not retrieve user attributes.")
            # Find the 'sub' unique identifier for the new user.
            for attribute in user_attributes:
                if attribute.get("Name") == "sub":
                    # Get the sub attribute.
                    sub = attribute.get("Value")
            if sub is None:
                cognito.delete_user(username)
                raise ValueError("Could not retrieve user's 'sub' attribute.")
        except ClientError as err:
            error = err.response.get("Error")
            raise ValueError(error)

        # Create the user entry in the database.
        try:
            user_orm = UserOrm(
                username=username,
                email=email,
                name=name,
                health_facility_name=health_facility_name,
                role=role,
                sub=sub,
            )
            # Add phone numbers to database.
            for phone_number in phone_numbers:
                user_orm.phone_numbers.append(
                    UserPhoneNumberOrm(phone_number=phone_number)
                )
            crud.create(user_orm)
        except Exception as err:
            print(err)
            logger.error("Failed to add user (%s) to the database.", username)
            # If adding the user to the database failed, delete the user from the cognito
            # user pool.
            db.session.rollback()
            # Delete user from user pool.
            cognito.delete_user(username)
            raise

    # End of function.

    @staticmethod
    def create_user(
        username: str,
        email: str,
        name: str,
        health_facility_name: str,
        role: str,
        password: str,
        phone_numbers: list[str],
    ):
        """
        Creates a user in both our database and the Cognito user pool.
        Unlike register_user(), this function will create a user with the specified
        password, their email will be set to 'verified' and their status will
        automatically be 'CONFIRMED'.

        :param username: The username for the new user.
        :param email: The email address of the new user.
        :param password: The password of the new user.
        :param name: The name of the new user.
        :param health_facility_name: The identifier of the healthcare facility that the user is
            assigned to.
        :param role: The role of the new user.
        """
        # Register the new user.
        UserUtils.register_user(
            username=username,
            email=email,
            name=name,
            health_facility_name=health_facility_name,
            role=role,
            phone_numbers=phone_numbers,
        )
        try:
            # Override the new users temporary password.
            cognito.set_user_password(username=username, new_password=password)
        except ClientError as err:
            error = err.response.get("Error")
            print(error)
            raise ValueError(error)

    # End of function.

    @staticmethod
    def delete_user(username: str):
        """
        Deletes a user from both the Cognito user pool and our database.

        :param username: The username of the user to be deleted.
        """
        # Find user in database.
        user_orm = crud.read(UserOrm, username=username)
        cognito_user = cognito.get_user(username=username)

        if cognito_user is not None:
            # Delete from user pool.
            cognito.delete_user(username=username)
        if user_orm is not None:
            # Delete from database.
            crud.delete(user_orm)

    # End of function.

    @staticmethod
    def get_user_orm_list():
        """
        :return: A list of user ORM models from the database.
        """
        # Get list of users from our database.
        return crud.read_all(UserOrm)

    # End of function.

    @staticmethod
    def get_user_dict_list():
        """
        :return: A list of dicts containing user data from the database.
        """
        # Get list of users from our database.
        user_orm_list = crud.read_all(UserOrm)
        user_dict_list = [
            UserUtils.get_user_dict_from_orm(user_orm) for user_orm in user_orm_list
        ]
        return user_dict_list

    # End of function.

    @staticmethod
    def does_username_exist(username: str) -> bool:
        """
        Queries the database to determine if the specified username is in the system.

        :param username: The username to check.
        """
        if crud.read(UserOrm, username=username) is None:
            return False
        return True

    # End of function.

    @staticmethod
    def _update_user_phone_numbers(user_orm: UserOrm, phone_numbers: set[str]):
        # Get the user's existing phone numbers.
        old_phone_numbers = set(PhoneNumberUtils.get_users_phone_numbers(user_orm.id))

        # Isolate those phone numbers which are not already in the database.
        new_phone_numbers = phone_numbers.difference(old_phone_numbers)

        # Isolate the phone numbers to remove.
        removed_phone_numbers = old_phone_numbers.difference(phone_numbers)

        # Delete the removed phone numbers from the database.
        for phone_number_orm in user_orm.phone_numbers:
            if phone_number_orm.phone_number in removed_phone_numbers:
                db.session.delete(phone_number_orm)

        # Add new phone numbers.
        for new_phone_number in new_phone_numbers:
            user_orm.phone_numbers.append(
                UserPhoneNumberOrm(phone_number=new_phone_number)
            )

    @staticmethod
    def update_user_phone_numbers(user_id: int, phone_numbers: set[str]):
        """
        Compares the set of provided phone numbers with those stored in the
        database for the user and adds or removes from those in the database
        such that the database will reflect the provided set.

        Any phone numbers which are in the database but not in the set will be
        deleted from the database.

        Any phone numbers which are in the set but not in the database will be
        added to the database.

        :param user_id: The id of the user.
        :param phone_numbers: The set of phone numbers to update the user with.
        :param commit: If True, the database session will commit the changes. Defaults to True.
        """
        user_orm = crud.read(UserOrm, id=user_id)
        if user_orm is None:
            return ValueError(f"No user with id ({user_id}) found.")

        UserUtils._update_user_phone_numbers(user_orm, phone_numbers)

        db.session.commit()

    # End of function.

    @staticmethod
    def update_user(user_id: int, user_update_dict: dict[str, Any]):
        """
        Updates the user's fields.
        Fields which are allowed to be changed
        include email, name, role, health_facility_name, and phone_numbers.

        The Cognito user pool will be updated in addition to the database.

        :param user_id: The id of the user.
        :param user_update_dict: The updated fields as a dict:
                                {
                                    "name": str,
                                    "email: str,
                                    "role": str,
                                    "health_facility_name": str,
                                    "phone_numbers": list[str]
                                }
        """
        user_orm = crud.read(UserOrm, id=user_id)
        if user_orm is None:
            return ValueError(f"No user with id ({user_id}) found.")

        username: str = user_orm.username
        cognito.update_user_attributes(
            username,
            {"email": user_update_dict["email"], "name": user_update_dict["name"]},
        )

        UserUtils._update_user_phone_numbers(
            user_orm, set(user_update_dict["phone_numbers"])
        )

        user_orm.email = user_update_dict["email"]
        user_orm.name = user_update_dict["name"]
        user_orm.role = user_update_dict["role"]
        user_orm.health_facility_name = user_update_dict["health_facility_name"]

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ValueError(e)

    # End of function.

    @staticmethod
    def create_secret_key_for_user(user_id):
        stale_date = get_future_date(days_after=SMS_KEY_DURATION - 10)
        expiry_date = get_future_date(days_after=SMS_KEY_DURATION)
        secret_Key = UserUtils.generate_new_sms_secret_key()
        new_key = {
            "user_id": user_id,
            "secret_Key": str(secret_Key),
            "expiry_date": str(expiry_date),
            "stale_date": str(stale_date),
        }
        sms_new_key_model = marshal.unmarshal(SmsSecretKeyOrm, new_key)
        crud.create(sms_new_key_model)
        return new_key

    # End of function.

    @staticmethod
    def update_sms_secret_key_for_user(user_id):
        stale_date = get_future_date(days_after=SMS_KEY_DURATION - 10)
        expiry_date = get_future_date(days_after=SMS_KEY_DURATION)
        secret_Key = UserUtils.generate_new_sms_secret_key()
        new_key = {
            "secret_Key": str(secret_Key),
            "expiry_date": str(expiry_date),
            "stale_date": str(stale_date),
        }
        crud.update(SmsSecretKeyOrm, new_key, user_id=user_id)
        return new_key

    # End of function.

    @staticmethod
    def get_user_sms_secret_key(user_id):
        sms_secret_key = crud.read(SmsSecretKeyOrm, user_id=user_id)
        if sms_secret_key and sms_secret_key.secret_Key:
            sms_key = marshal.marshal(sms_secret_key, SmsSecretKeyOrm)
            return sms_key
        return None

    # End of function.

    @staticmethod
    def get_user_sms_secret_key_string(user_id):
        sms_secret_key = crud.read(SmsSecretKeyOrm, user_id=user_id)
        if sms_secret_key:
            return sms_secret_key.secret_Key
        return None

    # End of function.

    @staticmethod
    def generate_new_sms_secret_key():
        return secrets.randbits(256).to_bytes(32, "little").hex()

    # End of function.
