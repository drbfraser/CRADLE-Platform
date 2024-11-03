
import logging

from botocore.exceptions import ClientError

from authentication import cognito
from data import crud, marshal
from enums import RoleEnum
from models import User
from server.api.util import phoneNumber_exists

logger = logging.getLogger(__name__)

"""
This file contains helper functions for managing users and keeping the
AWS Cognito user pool in sync with our database.
"""

def register_user(username: str,
                  email: str,
                  name: str,
                  facility: str,
                  role: RoleEnum,
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
    :param facility: The identifier of the healthcare facility that the user is
        assigned to.
    :param role: The role of the new user.
    :param phone_numbers: A list of phone numbers belonging to the user.
    """
    if (crud.read(User, username=username)) is not None:
        raise RuntimeError(f"Username ({username}) is already in use.")
    if (crud.read(User, email=email)) is not None:
        raise RuntimeError(f"Email ({email}) is already in use.")
    for phone_number in phone_numbers:
        if phoneNumber_exists(phone_number):
            raise RuntimeError(f"Phone number ({phone_number}) is already in use.")

    try:
        # Create the user in the user pool.
        response = cognito.create_user(username=username,
                                        email=email,
                                        name=name)
        cognito_user = response.get("User")
        user_attributes = cognito_user.get("Attributes")
        if user_attributes is None:
            raise RuntimeError("Could not retrieve user attributes.")
        # Find the 'sub' unique identifier for the new user.
        for attribute in user_attributes:
            if attribute.get("Name") == "sub":
                sub = attribute.get("Value")
        if sub is None:
            raise RuntimeError("Could not retrieve user's 'sub' attribute.")
    except ClientError as err:
        print(err)
        error = err.response.get("Error")
        print(error)

    # Create the user entry in the database.
    new_user = {
        "username": username,
        "email": email,
        "name": name,
        "health_facility": facility,
        "role": role,
        "sub": sub,
    }
    user_model = marshal.unmarshal(User, new_user)
    crud.create(user_model)
# End of function.

def create_user(username: str,
                  email: str,
                  name: str,
                  facility: str,
                  role: RoleEnum,
                  phone_numbers: list[str],
                  password: str,
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
    :param facility: The identifier of the healthcare facility that the user is
        assigned to.
    :param role: The role of the new user.
    :param phone_numbers: A list of phone numbers belonging to the user.
    """
    register_user(username=username,
                  email=email,
                  name=name,
                  facility=facility,
                  role=role,
                  phone_numbers=phone_numbers)
    try:
        cognito.set_user_password(username=username, new_password=password)
    except ClientError as err:
        print(err)
        error = err.response.get("Error")
        print(error)
        raise
# End of function.


def delete_user(username: str):
    """
    Deletes a user from both the Cognito user pool and our database.

    :param username: The username of the user to be deleted.
    """
    # Find user in database.
    user = crud.read(User, username=username)
    if user is None:
        raise RuntimeError(f"No user with username ({username}) found.")
    cognito_user = cognito.get_user(username=username)
    if cognito_user is None:
        raise RuntimeError(f"No user with username ({username}) found in user pool.")
    # Delete from database.
    crud.delete(user)
    # Delete from user pool.
    cognito.delete_user(username=username)
# End of function.
