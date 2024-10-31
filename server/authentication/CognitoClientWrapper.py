import base64
import hashlib
import hmac
import json
import logging

from botocore.exceptions import ClientError
from mypy_boto3_cognito_idp import CognitoIdentityProviderClient

logger = logging.getLogger(__name__)

def print_json(json_str):
  print(json.dumps(json_str, indent=4))


# Wrapper to encapsulate the AWS Cognito Identity Provider client.
class CognitoClientWrapper:
  cognito_idp_client: CognitoIdentityProviderClient
  user_pool_id: str
  client_id: str
  client_secret: str

  def __init__(self,
               cognito_idp_client: CognitoIdentityProviderClient,
               user_pool_id: str,
               client_id: str,
               client_secret: str):
    self.cognito_idp_client: CognitoIdentityProviderClient = cognito_idp_client
    self.user_pool_id: str = user_pool_id
    self.client_id: str = client_id
    self.client_secret: str = client_secret

  def _secret_hash(self, username: str) -> str:
        """
        Calculates a secret hash from a user name and a client secret.

        :param username: The user name to use when calculating the hash.
        :return: The secret hash.
        """
        key = self.client_secret.encode()
        msg = bytes(username + self.client_id, "utf-8")
        secret_hash = base64.b64encode(
          hmac.new(key, msg, digestmod=hashlib.sha256).digest(),
        ).decode()
        return secret_hash

  def create_user(self, username: str, email: str, is_fake_user: bool = False):
    """
    Creates a user in the user pool. Self-service signup is disabled, so only
    admins can create users. This means that the 'sign_up' action will fail,
    and instead we must use the 'admin_create_user' API.

    A temporary password will be generated automatically for the new user,
    and an invite email with their temporary password will be sent to them.

    When the new user first logs in, they will be prompted to create a new
    password.

    For development purposes, so that we can create fake users, the
    'is_fake_user' boolean will set the newly created user's email as
    verified. This way, a verification email will not be sent to the fake
    user.

    :param username: The user name that identifies the new user.
    :param email: The email address for the new user.
    :param is_fake_user: Boolean to indicate that the new user's email should
      be automatically set to verified.
    """
    """
    If we do not specify a temporary password to use, then Cognito will
    auto-generate one and email it to the user's email. Since the fake users we
    create won't have real emails, we can use a temporary password that is known
    to us by passing it to the API.
    """
    temporary_password = "Temporary_123"

    self.cognito_idp_client.admin_create_user(UserPoolId=self.user_pool_id, Username=username, UserAttributes=[
        {
          "Name": "email",
          "Value": email,
        },
        {
          "Name": "email_verified",
          "Value": str(is_fake_user),
        },
        # {
        #   "Name": "phone_number_verified",
        #   "Value": str(is_fake_user),
        # },
      ], DesiredDeliveryMediums=[
        "EMAIL",
      ], TemporaryPassword=temporary_password)
  # End of function

  def delete_user(self, username: str):
    """
    Delete the specified user from the user pool.
    """
    try:
      self.cognito_idp_client.admin_delete_user(UserPoolId=self.user_pool_id, Username=username)
    except ClientError as err:
      logger.error("ERROR: Failed to delete user with username: %s", username)
      logger.error("%s", err)
      raise

  # End of function

  def sign_up_user(self, username: str, password: str, email: str):
    """
    Signs up a new user with Amazon Cognito. This action prompts Amazon Cognito
    to send an email to the specified email address. The email contains a code that
    can be used to confirm the user.

    When the user already exists, the user status is checked to determine whether
    the user has been confirmed.

    :param user_name: The user name that identifies the new user.
    :param password: The password for the new user.
    :param user_email: The email address for the new user.
    :return: True when the user is already confirmed with Amazon Cognito.
              Otherwise, false.
    """
    try:
      secret_hash = self._secret_hash(username)
      response = self.cognito_idp_client.sign_up(ClientId=self.client_id, Username=username, Password=password, SecretHash=secret_hash, UserAttributes=[
          {
            "Name": "email",
            "Value": email,
          },
        ])
      confirmed = response["UserConfirmed"]
    except ClientError as err:
      error = err.response.get("Error")
      if not error:
        raise
      error_code = error.get("Code")
      if not error_code:
        raise

      if error_code == "UsernameExistsException":
        response = self.cognito_idp_client.admin_get_user(
                    UserPoolId=self.user_pool_id, Username=username,
                )
        user_status = response["UserStatus"]
        logger.warning("User %s already exists. Status: %s", username, user_status)
        confirmed = user_status == "CONFIRMED"
      else:
        error_message = error.get("Message")
        logger.error(
                    "Couldn't sign up %s. \nerror code: %s \n error message: %s",
                    username,
                    error_code,
                    error_message,
                )
        raise
    return confirmed
  # End of function

  def list_users(self):
    try:
      response = self.cognito_idp_client.list_users(UserPoolId=self.user_pool_id)
      users = response["Users"]
    except ClientError as err:
      logger.error("ERROR: Could not list users for %s\n%s", self.user_pool_id , err.response.get("Error"))
      raise
    else:
      return users
  # End of function

  def start_sign_in(self, username: str, password: str):
    try:
      init_response = self.cognito_idp_client.admin_initiate_auth(UserPoolId=self.user_pool_id, ClientId=self.client_id, AuthFlow="ADMIN_USER_PASSWORD_AUTH", AuthParameters={
            "USERNAME": username,
            "PASSWORD": password,
            "SECRET_HASH": self._secret_hash(username),
          })

      challenge_name = init_response.get("ChallengeName")
      session_token = init_response.get("Session")

      if challenge_name == "NEW_PASSWORD_REQUIRED":
        # User must create a new password.
        while True:
          new_password = input("Please enter a new password: ")
          confirm_password = input("Confirm new password: ")
          if new_password == confirm_password:
            break
          print("ERROR: Passwords do not match.")
        # End while

        auth_result = self.respond_to_new_password_challenge(
          session_token,
          username,
        )
        return auth_result
      # End if
    except ClientError as err:
      logger.error("ERROR: Could not sign in for %s\n%s", username, err.response.get("Error"))
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
          print("ERROR: Passwords do not match.")
        # End while
    challenge_response = self.cognito_idp_client.admin_respond_to_auth_challenge(UserPoolId=self.user_pool_id, ClientId=self.client_id, Session=session_token, ChallengeName="NEW_PASSWORD_REQUIRED", ChallengeResponses={
        "USERNAME": username,
        "NEW_PASSWORD": new_password,
        "SECRET_HASH": self._secret_hash(username),
      })
    return challenge_response["AuthenticationResult"]
