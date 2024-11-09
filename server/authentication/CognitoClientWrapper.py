import base64
import hashlib
import hmac
import logging
import os
import pprint
from typing import cast

import jwt
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from flask import request

# from jose import jwt as jose_jwt, jwk
from jwt import PyJWK, PyJWKClient
from mypy_boto3_cognito_idp import CognitoIdentityProviderClient

from shared.user_utils import UserUtils

load_dotenv(dotenv_path="/run/secrets/.aws.secrets.env")


pprinter = pprint.PrettyPrinter(indent=4, sort_dicts=False, compact=False)

"""
  Environment variable to enable creating fake users for development purposes.
  If set to True, newly created users will not need to verify their emails,
  and their temporary passwords will be set to one that we
  specify instead of being generated.
"""
ENABLE_DEV_USERS: bool = (
    os.getenv("ENABLE_DEV_USERS", default="false").lower() == "true"
)
if ENABLE_DEV_USERS:
    temporary_password = "Temporary_123"

logger = logging.getLogger(__name__)

# URI to retrieve the JWKS (JSON Web Key Set) if the one we have cached has been rotated.
JWKS_URI = os.getenv("JWKS_URI")
if JWKS_URI is None:
    raise ValueError("Could not retrieve JWKS_URI.")
jwks_client = PyJWKClient(
    JWKS_URI,
    cache_jwk_set=True,
    cache_keys=True,
)


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
                UserPoolId=self.user_pool_id,
                Username=username,
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
        self.client.admin_set_user_password(
            UserPoolId=self.user_pool_id,
            Username=username,
            Password=new_password,
            Permanent=True,
        )

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
        except ClientError as err:
            error = err.response.get("Error")
            print(error)
            logger.error(
                "ERROR: Could not sign in for %s\n%s",
                username,
                error,
            )
            raise
        else:
            return init_response

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
            response = self.client.admin_get_user(
                UserPoolId=self.user_pool_id, Username=username
            )
        except ClientError as err:
            error = err.response.get("Error")
            if error is None:
                raise
            if error.get("Code") == "UserNotFoundException":
                return None
        else:
            return response

    # End of function

    def update_user_attributes(self, username: str, user_attributes: dict[str, str]):
        """
        Updates the user's attributes in the user pool.

        :param username: The username of the user.
        :param user_attributes: A dict of the new user attributes:
                                {
                                    "email": str,
                                    "name": str
                                }
        """
        self.client.admin_update_user_attributes(
            UserPoolId=self.user_pool_id,
            Username=username,
            UserAttributes=[
                {"Name": k, "Value": v} for k, v in user_attributes.items()
            ],
        )

    # End of function

    def get_access_token(self):
        # Get JWT access token.
        authorization = request.authorization
        if authorization is None:
            raise ValueError("No authorization header found.")
        access_token = authorization.token
        if access_token is None:
            raise ValueError("Access token not found.")
        return access_token

    # End of function

    def verify_access_token(self):
        """
        https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
        """
        """
        The JWKS contains two public keys. The first is the signing key
        for access tokens, the second is the signing key for ID tokens.
        """
        jwks = jwks_client.get_jwk_set()
        if len(jwks.keys) < 1:
            raise ValueError("Could not retrieve JWKS.")

        # Get JWT access token.
        access_token = self.get_access_token()

        key_id = None
        try:
            token_header = jwt.get_unverified_header(access_token)
            key_id = token_header.get("kid")
        except jwt.DecodeError as err:
            print(err)
            raise ValueError("Could not decode access token's header.")
        if key_id is None:
            raise ValueError("Could not retrieve key_id from access token header.")

        signing_key = None
        for key in jwks.keys:
            key = cast(PyJWK, key)
            if key.key_id == key_id:
                signing_key = key
        if signing_key is None:
            raise ValueError("No matching key_id found.")

        # Decode JWT and verify signature.
        try:
            payload = jwt.decode(
                access_token,
                key=signing_key,
                algorithms=["RS256"],
            )
            print("Payload: ")
            pprinter.pprint(payload)
        except jwt.DecodeError as err:
            print(err)
            raise ValueError(err)
        else:
            payload = cast(dict[str, str], payload)
            client_id = payload.get("client_id")
            if client_id is None or client_id != self.client_id:
                raise ValueError("Invalid Access Token.")

        # The GetUser API will throw an error if the token is invalid or expired.
        try:
            user_info = self.client.get_user(AccessToken=access_token)
            logger.info(user_info)
        except ClientError as err:
            error = err.response.get("Error")
            raise ValueError(error)

    # End of function

    def get_user_info_from_jwt(self):
        """
        Verifies access token in request authorization header and retrieves
        the user's info from the database.

        :return user_dict: Dict containing user's info.
        """
        # Verify access token.
        self.verify_access_token()
        access_token = self.get_access_token()
        try:
            cognito_user_info = self.client.get_user(AccessToken=access_token)
        except ClientError as err:
            error = err.response.get("Error")
            raise ValueError(error)

        username = cognito_user_info.get("Username")
        # Retrieve user data from database.
        return UserUtils.get_user_dict_from_username(username)
