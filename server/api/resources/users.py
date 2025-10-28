import logging
from typing import List

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import RootModel

import data.db_operations as crud
from api.decorator import roles_required
from common import phone_number_utils, user_utils
from common.api_utils import UserIdPath
from data import marshal
from enums import RoleEnum
from models import UserOrm
from validation import CradleBaseModel
from validation.phone_numbers import PhoneNumberE164
from validation.sms_key import SmsKeyModel
from validation.users import (
    RegisterUserRequestBody,
    UserList,
    UserModel,
)

LOGGER = logging.getLogger(__name__)

# Error messages
_no_user_found_message = "There is no user with this id."
_insufficent_permissions_for_sms_key_message = (
    "Permission denied, you can only get your own sms-key or use the admin account"
)

# /api/user
api_users = APIBlueprint(
    name="users",
    import_name=__name__,
    url_prefix="/user",
    abp_tags=[Tag(name="Users", description="")],
    abp_security=[{"jwt": []}],
)


# /api/user/all [GET]
@api_users.get("/all", responses={200: UserList})
@roles_required([RoleEnum.ADMIN])
def get_all_users():
    """Get All Users"""
    user_list = user_utils.get_all_users_data()
    return user_list, 200


class Vht(CradleBaseModel):
    user_id: int
    email: str
    health_facility_name: str
    name: str


class VhtList(RootModel):
    root: list[Vht]


# /api/user/vhts [GET]
@api_users.get("/vhts", responses={200: VhtList})
@roles_required([RoleEnum.CHO, RoleEnum.ADMIN, RoleEnum.HCW])
def get_vhts():
    """Get VHT List"""
    vht_model_list = crud.find(UserOrm, UserOrm.role == RoleEnum.VHT.value)
    vht_dictionary_list = []
    for vht in vht_model_list:
        marshal.marshal(vht)
        vht_dictionary_list.append(
            {
                "userId": vht.id,
                "email": vht.email,
                "healthFacilityName": vht.health_facility_name,
                "firstName": vht.name,
            },
        )

    return vht_dictionary_list or []


# /api/user/<int:user_id>/change_pass [POST]
@api_users.post("/<int:user_id>/change_pass")
@roles_required([RoleEnum.ADMIN])
def change_password_admin(path: UserIdPath):
    """Change Password (Admin)"""
    # TODO: Reimplement this with the new authentication system.
    return abort(500, description="This endpoint has not yet been implemented.")


# /api/user/current/change_pass [POST]
@api_users.post("/current/change_pass")
def change_password_current_user():
    """Change Password (Current User)"""
    # TODO: Reimplement this with the new authentication system.
    return abort(500, description="This endpoint has not yet been implemented.")


# /api/user/register [POST]
@api_users.post("/register", responses={201: UserModel})
@roles_required([RoleEnum.ADMIN])
def register_user(body: RegisterUserRequestBody):
    """Register New User"""
    try:
        user_utils.create_user(**body.model_dump())
    except ValueError as e:
        error_message = str(e)
        LOGGER.error(error_message)
        return abort(400, description=error_message)

    return user_utils.get_user_dict_from_username(body.username), 200


# /api/user/current [GET]
@api_users.get("/current", responses={200: UserModel})
def get_current_user():
    """
    Get Current User
    Get info of current user from Access Token.
    """
    current_user = user_utils.get_current_user_from_jwt()
    return current_user, 200


# /api/user/<int:user_id> [PUT]
@api_users.put("/<int:user_id>", responses={200: UserModel})
@roles_required([RoleEnum.ADMIN])
def edit_user(path: UserIdPath, body: UserModel):
    """Edit User"""
    try:
        user_utils.update_user(path.user_id, body.model_dump())
    except ValueError as e:
        error_message = str(e)
        LOGGER.error(error_message)
        return abort(400, description=error_message)

    return user_utils.get_user_dict_from_id(path.user_id), 200


# /api/user/<int:user_id> [GET]
@api_users.get("/<int:user_id>", responses={200: UserModel})
def get_user(path: UserIdPath):
    """Get User"""
    try:
        user_dict = user_utils.get_user_data_from_id(path.user_id)
    except ValueError as err:
        error_message = str(err)
        LOGGER.error(error_message)
        return abort(404, description=error_message)
    return user_dict, 200


# /api/user/<int:user_id> [DELETE]
@api_users.delete("/<int:user_id>")
@roles_required([RoleEnum.ADMIN])
def delete_user(path: UserIdPath):
    """Delete User"""
    # Ensure that id is valid
    user = crud.read(UserOrm, id=path.user_id)
    if user is None:
        LOGGER.error(_no_user_found_message)
        return abort(400, description=_no_user_found_message)

    try:
        user_utils.delete_user(user.username)
    except ValueError as err:
        error = str(err)
        LOGGER.error(error)
        return abort(400, description=error)

    return {"description": "User deleted."}, 200


class UserPhoneNumbers(CradleBaseModel):
    phone_numbers: List[PhoneNumberE164]


# TODO: Rework these endpoints. Users should be able to have multiple phone numbers.


class PhoneNumberList(CradleBaseModel):
    phone_numbers: list[str]


# /api/user/<int:user_id>/phone [GET]
@api_users.get("/<int:user_id>/phone")
def get_users_phone_numbers(path: UserIdPath):
    """Get User's Phone Numbers"""
    if not user_utils.does_user_exist(path.user_id):
        return abort(404, description=_no_user_found_message)

    phone_numbers = phone_number_utils.get_users_phone_numbers(path.user_id)
    return {"phone_numbers": phone_numbers}, 200


# /api/user/<int:user_id>/phone [PUT]
@api_users.put("/<int:user_id>/phone")
@roles_required([RoleEnum.ADMIN])
def update_users_phone_numbers(path: UserIdPath, body: UserPhoneNumbers):
    """Update User's Phone Numbers"""
    if not user_utils.does_user_exist(path.user_id):
        return abort(404, description=_no_user_found_message)

    try:
        phone_numbers: set[str] = {
            str(phone_number) for phone_number in body.phone_numbers
        }
        user_utils.update_user_phone_numbers(path.user_id, phone_numbers)
    except ValueError as err:
        error = str(err)
        return abort(400, error)


# /api/user/<int:user_id>/smskey [GET]
@api_users.get("/<int:user_id>/smskey", responses={200: SmsKeyModel})
def get_users_sms_key(path: UserIdPath):
    """Get User's SMS Key"""
    current_user = user_utils.get_current_user_from_jwt()
    if current_user["role"] != "ADMIN" and current_user["id"] is not path.user_id:
        return (
            {
                "description": _insufficent_permissions_for_sms_key_message,
            },
            403,
        )

    sms_key = user_utils.get_user_sms_secret_key_formatted(path.user_id)
    if sms_key is None:
        return abort(424, description="NOTFOUND")
    return sms_key, 200


# /api/user/<int:user_id>/smskey [PUT]
@api_users.put("/<int:user_id>/smskey", responses={200: SmsKeyModel})
def update_users_sms_key(path: UserIdPath):
    """Update User's SMS Key"""
    current_user = user_utils.get_current_user_from_jwt()
    if current_user["role"] != "ADMIN" and current_user["id"] is not path.user_id:
        return (
            {
                "description": _insufficent_permissions_for_sms_key_message,
            },
            403,
        )

    sms_key = user_utils.get_user_sms_secret_key_formatted(path.user_id)
    if sms_key is None:
        return abort(424, description="NOTFOUND")

    new_key = user_utils.update_sms_secret_key_for_user(path.user_id)
    return new_key, 200


# /api/user/<int:user_id>/smskey [POST])
@api_users.post("/<int:user_id>/smskey", responses={201: SmsKeyModel})
def create_new_sms_key(path: UserIdPath):
    """Create New SMS Key"""
    current_user = user_utils.get_current_user_from_jwt()
    if current_user["role"] != "ADMIN" and current_user["id"] is not path.user_id:
        return (
            {
                "description": _insufficent_permissions_for_sms_key_message,
            },
            403,
        )

    sms_key = user_utils.get_user_sms_secret_key_formatted(path.user_id)
    if sms_key is None:
        new_key = user_utils.create_sms_secret_key_for_user(path.user_id)
        return new_key, 201

    return sms_key, 200
