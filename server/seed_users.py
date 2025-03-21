import os
from typing import TypedDict

from botocore.exceptions import ClientError

from authentication import cognito
from common import health_facility_utils, phone_number_utils, user_utils
from enums import FacilityTypeEnum, RoleEnum
from validation.users import RegisterUserRequestBody

"""
This script will seed the database and the AWS Cognito user pool with fake users.
"""
EMULATOR_PHONE_NUMBER = os.environ["EMULATOR_PHONE_NUMBER"]


class SeedUserDict(TypedDict):
    name: str
    username: str
    email: str
    password: str
    health_facility_name: str
    role: RoleEnum
    phone_numbers: list[str]


"""
The minimal users needed for the application to be functional. Includes only
a single admin user.
"""
admin: SeedUserDict = {
    "name": "Admin",
    "username": "admin",
    "email": "admin@email.com",
    "password": "cradle-admin",
    "health_facility_name": "H0000",
    "role": RoleEnum.ADMIN,
    "phone_numbers": [
        "+1-604-456-7890",
        "+256-0414-123456",
    ],
}
minimal_users_list: list[SeedUserDict] = [admin]

users_list: list[SeedUserDict] = [
    {
        "name": "Test Vht",
        "username": "test_vht",
        "email": "test_vht@email.com",
        "password": "cradle-vht",
        "health_facility_name": "H1000",
        "role": RoleEnum.VHT,
        "phone_numbers": ["+256-400-100000", "+256-401-100001", "+256-402-100002"],
    },
    {
        "name": "VHT",
        "username": "vht",
        "email": "vht@email.com",
        "password": "cradle-vht",
        "health_facility_name": "H1000",
        "role": RoleEnum.VHT,
        "phone_numbers": ["+256-403-100003"],
    },
    {
        "name": "CHO User",
        "username": "cho",
        "email": "cho@email.com",
        "password": "cradle-cho",
        "health_facility_name": "H0000",
        "role": RoleEnum.CHO,
        "phone_numbers": ["+256-404-123456"],
    },
    {
        "name": "HCW User",
        "username": "hcw",
        "email": "hcw@email.com",
        "password": "cradle-hcw",
        "health_facility_name": "H0000",
        "role": RoleEnum.HCW,
        "phone_numbers": ["+256-405-654321"],
    },
]


def populate_user_pool(seed_users: list[SeedUserDict]):
    """
    Will create the seed users. If the seed users already exist in the user pool, they will be deleted and recreated.
    """
    try:
        # If the seed users are already in the user pool, delete them and then recreate them.
        existing_users = cognito.list_users()
        existing_usernames = [user.get("Username") for user in existing_users]
        for seed_user in seed_users:
            username = seed_user["username"].lower()
            if username in existing_usernames:
                user_utils.delete_user(username)
                print("Deleted", username)

        # Run the user data through the validator just to be sure everything is good.
        user_models = [RegisterUserRequestBody(**seed_user) for seed_user in seed_users]

        for user_model in user_models:
            user_utils.create_user(**user_model.model_dump())
            user_id = user_utils.get_user_id_from_username(user_model.username)
            print(f"Created user ({user_model.username} : {user_id})")

    except ClientError as err:
        print("ERROR: Failed to create user in user pool.")
        error = err.response.get("Error")
        print(error)
        exit(1)
    except ValueError as err:
        print("ERROR: Failed to create user in database.")
        print(err)
        exit(1)


print("Seeding users complete!")


class FacilityDict(TypedDict):
    name: str
    phone_number: str
    type: str
    location: str
    about: str


# Facilities need to exist in the database before the users are created.
facilities_list: list[FacilityDict] = [
    {
        "name": "H0000",
        "phone_number": "+256-414-999999",
        "type": FacilityTypeEnum.HOSPITAL.value,
        "location": "Kampala",
        "about": "Sample hospital.",
    },
    {
        "name": "H1000",
        "phone_number": "+256-0414-100000",
        "type": FacilityTypeEnum.HOSPITAL.value,
        "location": "Kampala",
        "about": "Sample hospital.",
    },
    {
        "name": "H2000",
        "phone_number": "+256-414-200000",
        "type": FacilityTypeEnum.HOSPITAL.value,
        "location": "Kampala",
        "about": "Sample hospital.",
    },
    {
        "name": "H3000",
        "phone_number": "+256-0434-300000",
        "type": FacilityTypeEnum.HCF_2.value,
        "location": "Jinja",
        "about": "Sample health facility.",
    },
    {
        "name": "H4000",
        "phone_number": "+256-4644-40000",
        "type": FacilityTypeEnum.HCF_3.value,
        "location": "Mubende",
        "about": "Sample health facility.",
    },
    {
        "name": "H5000",
        "phone_number": "+256-4714-50000",
        "type": FacilityTypeEnum.HCF_4.value,
        "location": "Gulu",
        "about": "Sample health facility.",
    },
]


# Facilities need to exist first, since user table rows depend on them.
def seed_facilities(facilities: list[FacilityDict]):
    try:
        for facility in facilities:
            if not health_facility_utils.does_facility_exist(
                facility_name=facility["name"]
            ):
                health_facility_utils.create_health_facility(**facility)
                print(f"Health facility ({facility['name']}) created!")
            else:
                print(f"Health facility ({facility['name']}) already exists.")
    except ValueError as err:
        print(err)


def seed_minimal_users():
    seed_facilities(facilities_list[:1])
    populate_user_pool(minimal_users_list)
    # Pydantic validator won't accept emulator phone number, but we can set it separately.
    admin_phone_numbers = set(phone_number_utils.get_users_phone_numbers(user_id=0))
    emulator_phone_number = phone_number_utils.format(EMULATOR_PHONE_NUMBER)
    admin_phone_numbers.add(emulator_phone_number)
    user_utils.update_user_phone_numbers(user_id=1, phone_numbers=admin_phone_numbers)


def seed_test_users():
    seed_minimal_users()
    seed_facilities(facilities_list[1:])
    populate_user_pool(users_list)


def clear_user_pool():
    cognito_user_list = cognito.list_users()
    for cognito_user in cognito_user_list:
        username = cognito_user.get("Username")
        if username is not None:
            cognito.delete_user(username)
