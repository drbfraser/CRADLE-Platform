import os
import pprint

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

from authentication.CognitoClientWrapper import (
    ENABLE_DEV_USERS,
    CognitoClientWrapper,
)
from enums import RoleEnum

"""
This script will seed the AWS Cognito user pool with fake users.
"""

# Load aws secrets as environment variables.
load_dotenv(dotenv_path="/run/secrets/.aws.secrets.env")

AWS_REGION = os.environ["AWS_REGION"]
COGNITO_USER_POOL_ID = os.environ["COGNITO_USER_POOL_ID"]
COGNITO_APP_CLIENT_ID = os.environ["COGNITO_APP_CLIENT_ID"]
COGNITO_CLIENT_SECRET = os.environ["COGNITO_CLIENT_SECRET"]

AWS_ACCESS_KEY_ID = os.environ["AWS_ACCESS_KEY_ID"]
AWS_SECRET_ACCESS_KEY = os.environ["AWS_SECRET_ACCESS_KEY"]

seed_users = [
  {
    "name": "Admin",
    "username": "admin",
    "email": "admin@admin.com",
    "password": "Admin_123",
    "facility": "H0000",
    "role": RoleEnum.ADMIN.value,
    "phone_numbers": [
      "+1-888-456-7890",
      "+1-098-765-4321",
      os.environ.get("EMULATOR_PHONE_NUMBER"),
    ],
  },
  {
    "name": "Brian Fraser",
    "username": "brian_fraser",
    "email": "brian@admin.com",
    "password": "Brian_123",
    "facility": "H0000",
    "role": RoleEnum.ADMIN.value,
    "phone_numbers": ["+1-604-123-4567", "+1-604-123-4568"],
  },
]

pprinter = pprint.PrettyPrinter(indent=4, sort_dicts=False, compact=False)

def main():
  if not ENABLE_DEV_USERS:
    raise RuntimeError("ERROR: ENABLE_DEV_USERS is not set to true.")
  cognito = CognitoClientWrapper(
      cognito_idp_client=boto3.client(
          service_name="cognito-idp",
          region_name=AWS_REGION,
          aws_access_key_id=AWS_ACCESS_KEY_ID,
          aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
      ),
      user_pool_id=COGNITO_USER_POOL_ID,
      client_id=COGNITO_APP_CLIENT_ID,
      client_secret=COGNITO_CLIENT_SECRET,
  )

  users = []

  try:
    # If the seed users are already in the user pool, delete them and then recreate them.
    existing_users = cognito.list_users()
    # pprinter.pprint(existing_users)
    existing_usernames = [ user.get("Username") for user in existing_users  ]
    for seed_user in seed_users:
      username = seed_user["username"]
      if username in existing_usernames:
        cognito.delete_user(username)
        print("Deleted ", username)

    for seed_user in seed_users:
      response = cognito.create_user(
        username=seed_user["username"],
        email=seed_user["email"],
        name=seed_user["name"],
      )
      pprinter.pprint(response)
      user = response["User"]
      users.append(user)

      # Set the new user's password.
      cognito.set_user_password(username=seed_user["username"], new_password=seed_user["password"])

  except ClientError as err:
    error = err.response.get("Error")
    if error is not None:
      code =  error.get("Code")
      if code is not None and code != "UsernameExistsException":
        print(error.get("Code"))
        print("Error: ", error)
        print("ERROR: Failed to create user.")
        print(err)
        exit(1)
      else:
        print(code)


if __name__ == "__main__":
  main()
