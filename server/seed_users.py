import os
import pprint
from typing import TypedDict

from botocore.exceptions import ClientError

from authentication import cognito
from authentication.CognitoClientWrapper import (
    ENABLE_DEV_USERS,
)
from data.users.user_utils import UserUtils
from enums import FacilityTypeEnum, RoleEnum
from shared.health_facility_utils import HealthFacilityUtils

"""
This script will seed the AWS Cognito user pool with fake users.
"""

pprinter = pprint.PrettyPrinter(indent=4, sort_dicts=False, compact=False)


class SeedUserDict(TypedDict):
    name: str
    username: str
    email: str
    password: str
    health_facility_name: str
    role: str
    phone_numbers: list[str]

"""
The minimal users needed for the application to be functional. Includes only
a single admin user.
"""
minimal_seed_users: list[SeedUserDict] = [
  {
    "name": "Admin",
    "username": "admin",
    "email": "admin@admin.com",
    "password": "Admin_123",
    "health_facility_name": "H0000",
    "role": RoleEnum.ADMIN.value,
    "phone_numbers": [
      "+1-123-456-7890",
      "+256-0414-123456",
      os.environ["EMULATOR_PHONE_NUMBER"],
    ],
  },
]

seed_users: list[SeedUserDict] = [
  {
    "name": "Brian Fraser",
    "username": "brian_fraser",
    "email": "brian@admin.com",
    "password": "Brian_123",
    "health_facility_name": "H0000",
    "role": RoleEnum.ADMIN.value,
    "phone_numbers": ["+1-604-123-4567", "+1-604-123-4568"],
  },
  {
    "name": "CHO User",
    "username": "cho",
    "email": "cho@email.com",
    "password": "Cho_1234",
    "health_facility_name": "H0000",
    "role": RoleEnum.CHO.value,
    "phone_numbers": ["+256-555-123456"],
  },
  {
    "name": "HCW User",
    "username": "hcw",
    "email": "hcw@email.com",
    "password": "Hcw_1234",
    "health_facility_name": "H0000",
    "role": RoleEnum.HCW.value,
    "phone_numbers": ["+256-555-654321"],
  },
  {
    "name": "VHT User 1",
    "username": "vht1",
    "email": "vht1@email.com",
    "password": "Vht_1234",
    "health_facility_name": "H1000",
    "role": RoleEnum.VHT.value,
    "phone_numbers": ["+256-555-100000", "+256-555-100001", "+256-555-100002"],
  },
  {
    "name": "VHT User 2",
    "username": "vht2",
    "email": "vht2@email.com",
    "password": "Vht_1234",
    "health_facility_name": "H2000",
    "role": RoleEnum.VHT.value,
    "phone_numbers": ["+256-555-200000", "+256-555-200001", "+256-555-200002"],
  },
]

def populate_user_pool(seed_users: list[SeedUserDict]):
  if not ENABLE_DEV_USERS:
    raise RuntimeError("ERROR: ENABLE_DEV_USERS is not set to true.")

  try:
    # If the seed users are already in the user pool, delete them and then recreate them.
    existing_users = cognito.list_users()
    existing_usernames = [ user.get("Username") for user in existing_users  ]
    for seed_user in seed_users:
      username = seed_user["username"]
      if username in existing_usernames:
        UserUtils.delete_user(username)
        print("Deleted ", username)

    for seed_user in seed_users:
      phone_numbers = seed_user.get("phone_numbers")
      UserUtils.create_user(username=seed_user["username"],
                            email=seed_user["email"],
                            name=seed_user["name"],
                            health_facility_name=seed_user["health_facility_name"],
                            role=seed_user["role"],
                            password=seed_user["password"],
                            phone_numbers=phone_numbers)
      user_id = UserUtils.get_user_id_from_username(seed_user["username"])
      print(f"Created user ({username} : {user_id})")
      # for phone_number in phone_numbers:
      #   try:
      #     PhoneNumberUtils.add_user_phone_number(user_id, phone_number)
      #   except phonenumbers.NumberParseException as err:
      #     print(err)
      #     print(f"Username: ({username})")
      #     print(f"Phone number: ({phone_number})")
      #     raise

  except ClientError as err:
    print("ERROR: Failed to create user in user pool.")
    error = err.response.get("Error")
    print(error)
    exit(1)
  except RuntimeError as err:
    print("ERROR: Failed to create user in database.")
    print(err)
    exit(1)
print("Seeding users complete!")
# End of function.

facilities = [
  {
    "facility_name": "H0000",
    "phone_number":"+256-414-999999",
    "facility_type":FacilityTypeEnum.HOSPITAL.value,
    "location":"Kampala",
    "about":"Sample hospital.",
  },
  {
    "facility_name": "H1000",
    "phone_number":"+256-0414-100000",
    "facility_type":FacilityTypeEnum.HOSPITAL.value,
    "location":"Kampala",
    "about":"Sample hospital.",
  },
  {
    "facility_name": "H2000",
    "phone_number":"+256-414-200000",
    "facility_type":FacilityTypeEnum.HOSPITAL.value,
    "location":"Kampala",
    "about":"Sample hospital.",
  },
  {
    "facility_name": "H3000",
    "phone_number":"+256-0434-300000",
    "facility_type":FacilityTypeEnum.HCF_2.value,
    "location":"Jinja",
    "about":"Sample health facility.",
  },
  {
    "facility_name": "H4000",
    "phone_number":"+256-4644-40000",
    "facility_type":FacilityTypeEnum.HCF_3.value,
    "location":"Mubende",
    "about":"Sample health facility.",
  },
  {
    "facility_name": "H5000",
    "phone_number":"+256-4714-50000",
    "facility_type":FacilityTypeEnum.HCF_4.value,
    "location":"Gulu",
    "about":"Sample health facility.",
  },
]

# Facilities need to exist first, since user table rows depend on them.
def seed_facilities():
  try:
    for facility in facilities:
      if not HealthFacilityUtils.does_facility_exist(facility_name=facility["facility_name"]):
        HealthFacilityUtils.create_health_facility(**facility)
        print(F"Health facility ({facility['facility_name']}) created!")
      else:
        print(F"Health facility ({facility['facility_name']}) already exists.")
  except RuntimeError as err:
    print(err)
# End of function.


def populate_minimal_users():
  seed_facilities()
  populate_user_pool(minimal_seed_users)
# End of function.

def populate_test_users():
  seed_facilities()
  populate_minimal_users()
  populate_user_pool(seed_users)
# End of function.

def clear_user_pool():
  user_list, cognito_user_list = UserUtils.get_user_list()
  for cognito_user in cognito_user_list:
    username = cognito_user.get("Username")
    if username is not None:
      cognito.delete_user(username)
# End of function.

