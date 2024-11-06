
import logging
from typing import TypedDict, cast

from botocore.exceptions import ClientError

from authentication import cognito
from config import db
from data import crud, marshal
from enums import RoleEnum
from models import UserOrm, UserPhoneNumberOrm
from shared.health_facility_utils import HealthFacilityUtils
from shared.phone_number_utils import PhoneNumberUtils

logger = logging.getLogger(__name__)


supported_roles = [supported_role.value for supported_role in RoleEnum]

"""
This file contains helper functions for managing users and keeping the
AWS Cognito user pool in sync with our database.
"""

# Dictionary representation of marshalled user model.
class UserModelDict(TypedDict):
    id: int
    name: str
    username: str
    email: str
    facility: str
    role: str
    sub: str

class UserUtils:
    @staticmethod
    def get_user_model(username: str):
        username = username.lower()
        user_model = crud.read(UserOrm, username=username)
        if user_model is None:
            raise RuntimeError(f"No user with username ({username}) found.")
        return user_model
    # End of function.

    @staticmethod
    def get_user_dict_from_model(user_model: UserOrm) -> UserModelDict:
        user_dict = marshal.marshal(user_model)
        return cast(UserModelDict, user_dict)
    # End of function.

    @staticmethod
    def get_user_id_from_username(username: str) -> int:
        username = username.lower()
        user_model = UserUtils.get_user_model(username)
        user_dict = UserUtils.get_user_dict_from_model(user_model)
        return user_dict["id"]
    # End of function.

    @staticmethod
    def register_user(username: str,
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
        username = username.lower()
        email = email.lower()
        name = name.lower()
        health_facility_name = health_facility_name.lower()

        phone_numbers = [PhoneNumberUtils.format_to_E164(phone_number) for phone_number in phone_numbers]
        for phone_number in phone_numbers:
            if PhoneNumberUtils.does_phone_number_exist(phone_number):
                raise RuntimeError(f"Phone number ({phone_number}) is already assigned.")
            if not PhoneNumberUtils.is_phone_number_valid(phone_number):
                raise RuntimeError(f"Phone number ({phone_number}) is not valid.")
        if (role not in supported_roles):
            raise RuntimeError(f"Role ({role}) is not a supported role.")
        if (crud.read(UserOrm, username=username)) is not None:
            raise RuntimeError(f"Username ({username}) is already in use.")
        if (crud.read(UserOrm, email=email)) is not None:
            raise RuntimeError(f"Email ({email}) is already in use.")
        if not HealthFacilityUtils.does_facility_exist(facility_name=health_facility_name):
            raise RuntimeError(f"Health facility ({health_facility_name}) does not exist.")

        try:
            # Create the user in the user pool.
            response = cognito.create_user(username=username,
                                            email=email,
                                            name=name)
            cognito_user = response.get("User")
            cognito_username = cognito_user.get("Username")
            if cognito_username is None:
                raise RuntimeError("Could not retrieve username from user pool.")
            username = cognito_username
            user_attributes = cognito_user.get("Attributes")
            if user_attributes is None:
                cognito.delete_user(username)
                raise RuntimeError("Could not retrieve user attributes.")
            # Find the 'sub' unique identifier for the new user.
            for attribute in user_attributes:
                if attribute.get("Name") == "sub":
                    # Get the sub attribute.
                    sub = attribute.get("Value")
            if sub is None:
                cognito.delete_user(username)
                raise RuntimeError("Could not retrieve user's 'sub' attribute.")
        except ClientError as err:
            error = err.response.get("Error")
            print(error)
            code = ""
            message = ""
            if error is not None:
                code = error.get("Code")
                message = error.get("Message")
            logger.exception("Failed to register user in user pool:\n(%s): %s",
                        code,
                        message)

        # Create the user entry in the database.
        try:
            user_model = UserOrm(username=username, email=email, name=name, health_facility_name=health_facility_name, role=role, sub=sub)
            for phone_number in phone_numbers:
                user_model.phone_numbers.append(UserPhoneNumberOrm(phone_number=phone_number))
            crud.create(user_model)
        except Exception as err:
            print(err)
            logger.error("Failed to add user (%s) to the database.", username)
            # If adding the user to the database failed, delete the user from the cognito
            # user pool.
            db.session.rollback()
            cognito.delete_user(username)
            raise
    # End of function.

    @staticmethod
    def create_user(username: str,
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
        UserUtils.register_user(username=username,
                                email=email,
                                name=name,
                                health_facility_name=health_facility_name,
                                role=role,
                                phone_numbers=phone_numbers)
        username = username.lower()
        try:
            # Override the new users temporary password.
            cognito.set_user_password(username=username, new_password=password)
        except ClientError as err:
            error = err.response.get("Error")
            print(error)
            code = ""
            message = ""
            if error is not None:
                code = error.get("Code")
                message = error.get("Message")
            logger.exception("Failed to set password for user:\n(%s): %s",
                        code,
                        message)
            raise
    # End of function.

    @staticmethod
    def delete_user(username: str):
        """
        Deletes a user from both the Cognito user pool and our database.

        :param username: The username of the user to be deleted.
        """
        username = username.lower()
        # Find user in database.
        user_model = crud.read(UserOrm, username=username)
        cognito_user = cognito.get_user(username=username)

        if cognito_user is not None:
            # Delete from user pool.
            cognito.delete_user(username=username)
        if user_model is not None:
            # Delete from database.
            crud.delete(user_model)
    # End of function.

    @staticmethod
    def get_user_list():
        """
        Retrieves and returns a list containing data of all users.
        """
        # Get list of users from cognito user pool.
        cognito_user_list = cognito.list_users()
        # Get list of users from our database.
        user_model_list = crud.read_all(UserOrm)
        user_list = [ UserUtils.get_user_dict_from_model(user_model) for user_model in user_model_list ]
        return user_list, cognito_user_list
    # End of function.

    @staticmethod
    def does_username_exist(username: str) -> bool:
        """
        Queries the database to determine if the specified username is in the system.

        :param username: The username to check.
        """
        username = username.lower()
        user_model = crud.read(UserOrm, username=username)
        if user_model is None:
            return False
        return True
    # End of function.
