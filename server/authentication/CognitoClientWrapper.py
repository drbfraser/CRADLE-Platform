import base64
import hashlib
import hmac
import logging
import os

from botocore.exceptions import ClientError
from dotenv import load_dotenv
from mypy_boto3_cognito_idp import CognitoIdentityProviderClient

load_dotenv(dotenv_path="/run/secrets/.aws.secrets.env")

"""
  Environment variable to control whether to enable creating fake users for
  development purposes. If set to True, newly created users will not need to
  verify their emails, and their temporary passwords will be set to one that we
  specify instead of being generated.
"""
ENABLE_DEV_USERS: bool = os.getenv("ENABLE_DEV_USERS", default="false").lower() == "true"
if ENABLE_DEV_USERS:
    temporary_password = "Temporary_123"

logger = logging.getLogger(__name__)

# Wrapper to encapsulate the AWS Cognito Identity Provider client.
class CognitoClientWrapper:
    def __init__(
        self,
        cognito_idp_client: CognitoIdentityProviderClient,
        user_pool_id: str,
        client_id: str,
        client_secret: str,
    ):
        self.client: CognitoIdentityProviderClient = cognito_idp_client
        self.user_pool_id: str = user_pool_id
        self.client_id: str = client_id
        self.client_secret: str = client_secret

    def _secret_hash(self, username: str) -> str:
        """
        Calculates a secret hash from a username and a client secret.

        :param username: The username to use when calculating the hash.
        :return: The secret hash.
        """
        key = self.client_secret.encode()
        msg = bytes(username + self.client_id, "utf-8")
        secret_hash = base64.b64encode(
            hmac.new(key, msg, digestmod=hashlib.sha256).digest(),
        ).decode()
        return secret_hash

    def create_user(self, username: str, email: str, name: str):
        """
        Creates a user in the user pool. Self-service signup is disabled, so only
        admins can create users. This means that the 'sign_up' action will fail,
        and instead we must use the 'admin_create_user' API.

        A temporary password will be generated automatically for the new user,
        and an invite email with their temporary password will be sent to them.

        When the new user first logs in, they will be prompted to create a new
        password.

        For development purposes, so that we can create fake users, we can set the
        newly created user's email as verified. This way, a verification email will
        not be sent to the fake user. If we do not specify a temporary password to
        use, then Cognito will auto-generate one and email it to the user's email.
        Since the fake users we create won't have real emails, we can use a
        temporary password that is known to us by passing it to the API.

        :param username: The username for the new user.
        :param email: The email address for the new user.
        """
        create_user_kwargs = {
            "UserPoolId": self.user_pool_id,
            "Username": username,
            "UserAttributes": [
                {
                    "Name": "email",
                    "Value": email,
                },
                {
                    "Name": "name",
                    "Value": name,
                },
            ],
            "DesiredDeliveryMediums": [
                "EMAIL",
            ],
        }

        if ENABLE_DEV_USERS:
            user_attributes: list = create_user_kwargs["UserAttributes"]
            user_attributes.append(
                {
                    "Name": "email_verified",
                    "Value": "true",
                },
            )
            create_user_kwargs["UserAttributes"] = user_attributes
            create_user_kwargs["TemporaryPassword"] = temporary_password

        response = self.client.admin_create_user(**create_user_kwargs)
        return response
    # End of function

    def delete_user(self, username: str):
        """
        Delete the specified user from the user pool.
        """
        try:
            self.client.admin_delete_user(
                UserPoolId=self.user_pool_id, Username=username,
            )
        except ClientError as err:
            logger.error("ERROR: Failed to delete user with username: %s", username)
            logger.error("%s", err)
            raise

    # End of function

    def list_users(self):
        try:
            response = self.client.list_users(UserPoolId=self.user_pool_id)
            users = response["Users"]
        except ClientError as err:
            logger.error(
                "ERROR: Could not list users for %s\n%s",
                self.user_pool_id,
                err.response.get("Error"),
            )
            raise
        else:
            return users
    # End of function

    def set_user_password(self, username: str, new_password: str):
        """
        Sets a new password for the specified user. If the user previously
        had a temporary password and their status was 'FORCE_CHANGE_PASSWORD',
        setting a new permanent password will change the user's status to
        'CONFIRMED'.

        :param username: The username of the user.
        :param new_password: The new password to set for the user.
        """
        self.client.admin_set_user_password(UserPoolId=self.user_pool_id, Username=username, Password=new_password, Permanent=True)

    def start_sign_in(self, username: str, password: str):
        try:
            init_response = self.client.admin_initiate_auth(
                UserPoolId=self.user_pool_id,
                ClientId=self.client_id,
                AuthFlow="ADMIN_USER_PASSWORD_AUTH",
                AuthParameters={
                    "USERNAME": username,
                    "PASSWORD": password,
                    "SECRET_HASH": self._secret_hash(username),
                },
            )

            challenge_name = init_response.get("ChallengeName")
            session_token = init_response.get("Session")

            if challenge_name == "NEW_PASSWORD_REQUIRED":
                # User must create a new password.
                while True:
                    new_password = input("Please enter a new password: ")
                    confirm_password = input("Confirm new password: ")
                    if new_password == confirm_password:
                        break
                    logger.error("ERROR: Passwords do not match.")
                # End while

                auth_result = self.respond_to_new_password_challenge(
                    session_token,
                    username,
                )
                return auth_result
            # End if
        except ClientError as err:
            logger.error(
                "ERROR: Could not sign in for %s\n%s",
                username,
                err.response.get("Error"),
            )
            raise
        else:
            return init_response.get("AuthenticationResult")
    # End of function

    def respond_to_new_password_challenge(self, session_token: str, username: str):
        while True:
            new_password = input("Please enter a new password: ")
            confirm_password = input("Confirm new password: ")
            if new_password == confirm_password:
                break
            logger.error("ERROR: Passwords do not match.")
        # End while
        challenge_response = self.client.admin_respond_to_auth_challenge(
            UserPoolId=self.user_pool_id,
            ClientId=self.client_id,
            Session=session_token,
            ChallengeName="NEW_PASSWORD_REQUIRED",
            ChallengeResponses={
                "USERNAME": username,
                "NEW_PASSWORD": new_password,
                "SECRET_HASH": self._secret_hash(username),
            },
        )
        return challenge_response["AuthenticationResult"]
    # End of function

    def get_user(self, username: str):
        """
        Retrieves the user's information from the user pool.

        :param username: The username of the user.
        :return: AdminGetUserResponseTypeDef if user was found, or None if user
            was not found.
        """
        try:
            response = self.client.admin_get_user(UserPoolId=self.user_pool_id, Username=username)
        except ClientError as err:
            error = err.response.get("Error")
            if error is None:
                raise
            if error.get("Code") == "UserNotFoundException":
                return None
        else:
            return response
    # End of function
