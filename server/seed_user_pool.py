import os
import pprint
from typing import TypedDict

from botocore.exceptions import ClientError

from authentication import cognito
from authentication.CognitoClientWrapper import (
  ENABLE_DEV_USERS,
)
from enums import RoleEnum

"""
This script will seed the AWS Cognito user pool with fake users.
"""


pprinter = pprint.PrettyPrinter(indent=4, sort_dicts=False, compact=False)

class UserDict(TypedDict):
  name: str
  username: str
  email: str
  password: str
  facility: str
  role: str
  phone_numbers: list[str]

"""
The minimal users needed for the application to be functional. Includes only
a single admin user.
"""
minimal_seed_users: list[UserDict] = [
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
      os.environ["EMULATOR_PHONE_NUMBER"],
    ],
  },
]

seed_users: list[UserDict] = [
  {
    "name": "Brian Fraser",
    "username": "brian_fraser",
    "email": "brian@admin.com",
    "password": "Brian_123",
    "facility": "H0000",
    "role": RoleEnum.ADMIN.value,
    "phone_numbers": ["+1-604-123-4567", "+1-604-123-4568"],
  },
  {
    "name": "CHO User",
    "username": "cho",
    "email": "cho@email.com",
    "password": "Cho_123",
    "facility": "H0000",
    "role": RoleEnum.CHO.value,
    "phone_numbers": ["+256-415-1234"],
  },
  {
    "name": "HCW User",
    "username": "hcw",
    "email": "hcw@email.com",
    "password": "Hcw_123",
    "facility": "H0000",
    "role": RoleEnum.HCW.value,
    "phone_numbers": ["+256-416-1234"],
  },
  {
    "name": "VHT User 0",
    "username": "vht0",
    "email": "vht0@email.com",
    "password": "Vht_123",
    "facility": "H0000",
    "role": RoleEnum.VHT.value,
    "phone_numbers": ["+256-417-0000", "+256-417-0001", "+256-417-0002"],
  },
  {
    "name": "VHT User 1",
    "username": "vht1",
    "email": "vht1@email.com",
    "password": "Vht_123",
    "facility": "H1000",
    "role": RoleEnum.VHT.value,
    "phone_numbers": ["+256-417-1000", "+256-417-1001", "+256-417-1002"],
  },
  {
    "name": "VHT User 2",
    "username": "vht2",
    "email": "vht2@email.com",
    "password": "Vht_123",
    "facility": "H2000",
    "role": RoleEnum.VHT.value,
    "phone_numbers": ["+256-417-2000", "+256-417-2001", "+256-417-2002"],
  },
]

def populate_user_pool(seed_users: list[UserDict]):
  if not ENABLE_DEV_USERS:
    raise RuntimeError("ERROR: ENABLE_DEV_USERS is not set to true.")

  try:
    # If the seed users are already in the user pool, delete them and then recreate them.
    existing_users = cognito.list_users()
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
      # Set the new user's password.
      cognito.set_user_password(username=seed_user["username"], new_password=seed_user["password"])
  except ClientError as err:
    print("ERROR: Failed to create user.")
    error = err.response.get("Error")
    if error is not None:
      code =  error.get("Code")
      print("Error: ", error)
    if code is not None and code != "UsernameExistsException":
      print(code)
    exit(1)
# End of function.

def main():
  populate_user_pool(minimal_seed_users)
  populate_user_pool(seed_users)
# End of function.

if __name__ == "__main__":
  main()
