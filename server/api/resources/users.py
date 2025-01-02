import logging
import os
from typing import List

from botocore.exceptions import ClientError
from flask import abort, make_response
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_openapi3.blueprint import APIBlueprint

import config
from api.decorator import roles_required
from authentication import cognito
from common import phone_number_utils, user_utils
from common.api_utils import UserIdPath
from data import crud, marshal
from enums import RoleEnum
from models import UserOrm
from validation import CradleBaseModel
from validation.phone_numbers import PhoneNumberE164
from validation.users import (
    UserAuthValidator,
    UserRegisterValidator,
    UserValidator,
)

LOGGER = logging.getLogger(__name__)

# Error messages
null_phone_number_message = "No phone number was provided."
null_id_message = "No id provided."
no_user_found_message = "There is no user with this id."
invalid_phone_number_message = (
    "Phone number {phone_number} has wrong format. The format for phone number should be +x-xxx-xxx-xxxx, "
    "+x-xxx-xxx-xxxxx, xxx-xxx-xxxx or xxx-xxx-xxxxx"
)
phone_number_already_exists_message = (
    "Phone number is already assigned to another user."
)

supported_roles = [role.value for role in RoleEnum]


# /api/user
api_users = APIBlueprint(
    name="users",
    import_name=__name__,
    url_prefix="/user",
)


# /api/user/all [GET]
@api_users.get("/all")
@roles_required([RoleEnum.ADMIN])
def get_all_users():
    user_list = user_utils.get_all_users_data()
    return user_list, 200


# api/user/vhts [GET]
@api_users.get("/vhts")
@roles_required([RoleEnum.CHO, RoleEnum.ADMIN, RoleEnum.HCW])
def get_all_vhts():
    vht_model_list = crud.find(UserOrm, UserOrm.role == RoleEnum.VHT.value)
    vht_dictionary_list = []
    for vht in vht_model_list:
        marshal.marshal(vht)
        vht_dictionary_list.append(
            {
                "user_id": vht.id,
                "email": vht.email,
                "health_facility_name": vht.health_facility_name,
                "name": vht.name,
            },
        )

    if vht_dictionary_list is None:
        return []
    return vht_dictionary_list


# api/user/<int:user_id>/change_pass [POST]
@api_users.post("/<int:user_id>/change_pass")
@roles_required([RoleEnum.ADMIN])
def change_password_admin(path: UserIdPath):
    # TODO: Reimplement this with the new authentication system.
    return abort(500, description="This endpoint has not yet been implemented.")


# /api/user/current/change_pass [POST]
@api_users.post("/current/change_pass")
def change_password_current_user():
    # TODO: Reimplement this with the new authentication system.
    return abort(500, description="This endpoint has not yet been implemented.")


# api/user/register [POST]
@api_users.post("/register")
@roles_required([RoleEnum.ADMIN])
def register_user(body: UserRegisterValidator):
    """
    Create a new User.
    """
    new_user_dict = body.model_dump()
    try:
        user_utils.create_user(**new_user_dict)
    except ValueError as e:
        error_message = str(e)
        LOGGER.error(error_message)
        return abort(400, description=error_message)

    return user_utils.get_user_dict_from_username(body.username), 200


app = config.app
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["10 per minute", "20 per hour", "50 per day"],
    # parsed by flask limiter library https://flask-limiter.readthedocs.io/en/stable/
)


# api/user/auth [POST]
@api_users.post("/auth")
@limiter.limit(
    "10 per minute, 20 per hour, 30 per day",
    error_message="Login attempt limit reached please try again later.",
    exempt_when=lambda: os.environ.get("LIMITER_DISABLED")
    == "True",  # disable limiter during testing stage
)
def authenticate(body: UserAuthValidator):
    """
    Authentication endpoint.
    """
    # Attempt authentication with Cognito user pool.
    try:
        auth_result = cognito.start_sign_in(**body.model_dump())
    except ClientError as err:
        error = err.response.get("Error")
        LOGGER.error(error)
        return abort(401, description=error)
    except ValueError as err:
        error = str(err)
        LOGGER.error(error)
        return abort(401, description=error)
    # If no exception was raised, then authentication was successful.

    # Get user data from database.
    try:
        user_dict = user_utils.get_user_data_from_username(body.username)
    except ValueError as err:
        error = str(err)
        LOGGER.error(error)
        LOGGER.error(
            "ERROR: Something has gone wrong. User authentication succeeded but username (%s) is not found in database.",
            body.username,
        )
        return abort(500, description=err)

    # Don't include refresh token in body of response.
    refresh_token = auth_result["refresh_token"]
    del auth_result["refresh_token"]

    challenge = auth_result["challenge"]

    response_body = {
        "access_token": auth_result["access_token"],
        "user": user_dict,
        "challenge": None,
    }

    # Only include challenge in response if challenge_name is not None.
    if challenge["challenge_name"] is not None:
        response_body["challenge"] = challenge

    response = make_response(response_body, 200)
    # Store refresh token in HTTP-Only cookie.
    if refresh_token is not None:
        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
        )
    return response


class RefreshTokenApiBody(CradleBaseModel):
    username: str


# api/user/auth/refresh_token [POST]
@api_users.post("/auth/refresh_token")
def refresh_access_token(body: RefreshTokenApiBody):
    username = body.username
    try:
        new_access_token = cognito.refresh_access_token(username)
    except ValueError as err:
        error = str(err)
        LOGGER.error(error)
        return abort(401, description=error)
    return {"access_token": new_access_token}, 200


# /api/user/current [GET]
@api_users.get("/current")
def get_current_user():
    """
    # Get identity of current user from access token.
    """
    current_user = user_utils.get_current_user_from_jwt()
    return current_user, 200


# api/user/<int:user_id> [PUT]
@api_users.put("/<int:user_id>")
@roles_required([RoleEnum.ADMIN])
def edit_user(path: UserIdPath, body: UserValidator):
    try:
        # Update the user.
        user_utils.update_user(path.user_id, body.model_dump())
    except ValueError as e:
        error_message = str(e)
        LOGGER.error(error_message)
        return abort(400, description=error_message)
    return user_utils.get_user_dict_from_id(path.user_id), 200


# api/user/<int:user_id> [GET]
@api_users.get("/<int:user_id>")
def get_user(path: UserIdPath):
    try:
        user_dict = user_utils.get_user_data_from_id(path.user_id)
    except ValueError as err:
        error_message = str(err)
        LOGGER.error(error_message)
        return abort(404, description=error_message)
    return user_dict, 200


# api/user/<int:user_id> [DELETE]
@api_users.delete("/<int:user_id>")
@roles_required([RoleEnum.ADMIN])
def delete_user(path: UserIdPath):
    # Ensure that id is valid
    user = crud.read(UserOrm, id=path.user_id)
    if user is None:
        error = no_user_found_message
        LOGGER.error(error)
        return abort(400, description=error)

    try:
        user_utils.delete_user(user.username)
    except ValueError as err:
        error = str(err)
        LOGGER.error(error)
        return abort(400, description=error)

    return {"message": "User deleted."}, 200


class UserPhoneNumbers(CradleBaseModel):
    phone_numbers: List[PhoneNumberE164]


# TODO: Rework these endpoints. Users should be able to have multiple phone numbers.


# api/user/<int:user_id>/phone [GET]
@api_users.get("/<int:user_id>/phone")
def get_users_phone_numbers(path: UserIdPath):
    # Check if user exists.
    if not user_utils.does_user_exist(path.user_id):
        return abort(404, description=no_user_found_message)
    phone_numbers = phone_number_utils.get_users_phone_numbers(path.user_id)
    return {"phone_numbers": phone_numbers}, 200


# api/user/<int:user_id>/phone [PUT]
@api_users.put("/<int:user_id>/phone")
@roles_required([RoleEnum.ADMIN])
def update_users_phone_numbers(path: UserIdPath, body: UserPhoneNumbers):
    # Check if user exists.
    if not user_utils.does_user_exist(path.user_id):
        return abort(404, description=no_user_found_message)
    phone_numbers: set[str] = {str(phone_number) for phone_number in body.phone_numbers}
    try:
        user_utils.update_user_phone_numbers(path.user_id, phone_numbers)
    except ValueError as err:
        error = str(err)
        return abort(400, error)


# api/user/<int:user_id>/smskey [GET]
@api_users.get("/<int:user_id>/smskey")
def get_users_sms_key(path: UserIdPath):
    current_user = user_utils.get_current_user_from_jwt()
    if current_user["role"] != "ADMIN" and current_user["id"] is not path.user_id:
        return (
            {
                "message": "Permission denied, you can only get your own sms-key or use the admin account",
            },
            403,
        )

    sms_key = user_utils.get_user_sms_secret_key_formatted(path.user_id)
    if sms_key is None:
        return abort(424, description="NOTFOUND")
    return sms_key, 200


# api/user/<int:user_id>/smskey [PUT]
@api_users.put("/<int:user_id>/smskey")
def update_users_sms_key(path: UserIdPath):
    current_user = user_utils.get_current_user_from_jwt()
    if current_user["role"] != "ADMIN" and current_user["id"] is not path.user_id:
        return (
            {
                "message": "Permission denied, you can only get your own sms-key or use the admin account",
            },
            403,
        )
    sms_key = user_utils.get_user_sms_secret_key_formatted(path.user_id)
    if sms_key is None:
        return abort(424, description="NOTFOUND")

    # Create new key.
    new_key = user_utils.update_sms_secret_key_for_user(path.user_id)
    return new_key, 200


# api/user/<int:user_id>/smskey [POST])
@api_users.post("/<int:user_id>/smskey")
def create_users_sms_key(path: UserIdPath):
    current_user = user_utils.get_current_user_from_jwt()
    if current_user["role"] != "ADMIN" and current_user["id"] is not path.user_id:
        return (
            {
                "message": "Permission denied, you can only get your own sms-key or use the admin account",
            },
            403,
        )

    sms_key = user_utils.get_user_sms_secret_key_formatted(path.user_id)
    if sms_key is None:
        new_key = user_utils.create_sms_secret_key_for_user(path.user_id)
        return new_key, 201

    return sms_key, 200


# TODO: Move these SMS Relay endpoints into their own file.
class RelayPhoneNumber(CradleBaseModel):
    phone_number: PhoneNumberE164


api_phone = APIBlueprint(
    name="phone",
    import_name=__name__,
    url_prefix="/phone",
)


# api/phone/is_relay [GET]
@api_phone.get("/is_relay")
def is_relay_phone_number(body: RelayPhoneNumber):
    phone_number = str(body.phone_number)
    phone_relay_stat = crud.is_phone_number_relay(phone_number)
    if phone_relay_stat == 1:
        return {"message": "YES"}, 200
    if phone_relay_stat == 0:
        return {"message": "NO"}, 200
    return abort(403, description="Permission denied.")


# api/phone/relays [GET]
@api_phone.get("/relays")
def get_all_relay_phone_numbers():
    relay_phone_numbers = crud.get_all_relay_phone_numbers()
    if relay_phone_numbers is None:
        return abort(403, description="Permission denied.")
    return {"phone_numbers": relay_phone_numbers}, 200
