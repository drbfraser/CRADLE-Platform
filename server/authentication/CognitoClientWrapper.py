import base64
import hashlib
import hmac
import logging
import os
import pprint
from typing import Optional, cast

import jwt
from botocore.exceptions import ClientError
from flask import request
from jwt import PyJWK, PyJWKClient
from mypy_boto3_cognito_idp import CognitoIdentityProviderClient

pprinter = pprint.PrettyPrinter(indent=4, sort_dicts=False, compact=False)

"""
  Environment variable to enable creating fake users for development purposes.
  If set to True, newly created users will not need to verify their emails,
  and their temporary passwords will be set to one that we
  specify instead of being generated.
"""
COGNITO_ENABLE_DEV_USERS: bool = (
    os.getenv("COGNITO_ENABLE_DEV_USERS", default="false").lower() == "true"
)
if COGNITO_ENABLE_DEV_USERS:
    temporary_password = "Temporary_123"

logger = logging.getLogger(__name__)

# URL to retrieve the JWKS (JSON Web Key Set) if the one we have cached has been rotated.
COGNITO_JWKS_URL = os.getenv("COGNITO_JWKS_URL")
if COGNITO_JWKS_URL is None:
    raise ValueError("Could not retrieve COGNITO_JWKS_URL.")
jwks_client = PyJWKClient(
    COGNITO_JWKS_URL,
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

    def create_user(
        self,
        username: str,
        email: str,
        name: str,
        auto_verify: bool = False,
        suppress_invitation: bool = False,
        temporary_password: Optional[str] = None,
    ):
        """
        Creates a user in the user pool.

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
        :param name: Name of the new user.
        :param email_verified: If true, the new user's email will be auto-verified.
        :param suppress_invitation: If true, the email invitation will not be sent.
        :param temporary_password: If given, will be used as the temporary password.
            If not, then one will be generated.
        """
        user_attributes = [
            {
                "Name": "email",
                "Value": email,
            },
            {
                "Name": "name",
                "Value": name,
            },
        ]

        if auto_verify:
            user_attributes.append(
                {
                    "Name": "email_verified",
                    "Value": "true",
                },
            )

        create_user_kwargs = {
            "UserPoolId": self.user_pool_id,
            "Username": username,
            "UserAttributes": user_attributes,
            "DesiredDeliveryMediums": [
                "EMAIL",
            ],
        }

        if suppress_invitation:
            create_user_kwargs["MessageAction"] = "SUPPRESS"

        if temporary_password is not None:
            create_user_kwargs["TemporaryPassword"] = temporary_password

        return self.client.admin_create_user(**create_user_kwargs)

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
            auth_response = self.client.admin_initiate_auth(
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
            message = ""
            if error is not None:
                message = error.get("Message")
            raise ValueError(message)
        else:
            # Authentication response may require user to set a new password.
            auth_result = auth_response.get("AuthenticationResult")
            challenge_name = auth_response.get("ChallengeName")
            challenge_params = auth_response.get("ChallengeParameters")
            session = auth_response.get("Session")
            access_token = auth_result.get("AccessToken")
            refresh_token = auth_result.get("RefreshToken")
            if access_token is None:
                raise ValueError("Failed to get Access Token.")

            challenge = {
                "challenge_name": challenge_name,
                "challenge_params": challenge_params,
                "session": session,
            }
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "challenge": challenge,
            }

    def respond_to_new_password_challenge(self, session_token: str, username: str):
        while True:
            new_password = input("Please enter a new password: ")
            confirm_password = input("Confirm new password: ")
            if new_password == confirm_password:
                break
            logger.error("ERROR: Passwords do not match.")
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

    def get_access_token(self):
        """
        Gets the JWT access token from the authorization header.
        """
        # Get JWT access token.
        authorization = request.authorization
        if authorization is None:
            raise ValueError("No authorization header found.")
        access_token = authorization.token
        if access_token is None:
            raise ValueError("Access token not found.")
        return access_token

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
        except jwt.DecodeError as err:
            print(err)
            raise ValueError(err)
        except Exception as err:
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

    def get_username_from_jwt(self):
        """
        Verifies access token in request authorization header and retrieves
        the user's username from the token.

        :return username: Username extracted from the JWT.
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
        return username

    def get_user_data_from_jwt(self):
        """
        Verifies access token in request authorization header and retrieves
        the user's info from the database.

        :return user_data: Dict containing user's info.
        """
        username = self.get_username_from_jwt()

        return username

    def refresh_access_token(self, username: str):
        """
        Extracts refresh token from cookies and uses it to get a new access
        token.

        :param username: The username of the user who the tokens belong to.
        :return access_token: New access token.
        """
        refresh_token = request.cookies.get("refresh_token")
        if refresh_token is None:
            raise ValueError("No Refresh Token found.")

        try:
            auth_response = self.client.admin_initiate_auth(
                UserPoolId=self.user_pool_id,
                ClientId=self.client_id,
                AuthFlow="REFRESH_TOKEN_AUTH",
                AuthParameters={
                    "REFRESH_TOKEN": refresh_token,
                    "SECRET_HASH": self._secret_hash(username),
                },
            )
        except ClientError as err:
            error = err.response.get("Error")
            raise ValueError(error)

        auth_result = auth_response.get("AuthenticationResult")

        new_access_token = auth_result.get("AccessToken")
        if new_access_token is None:
            raise ValueError("Could not get new access token.")
        return new_access_token
