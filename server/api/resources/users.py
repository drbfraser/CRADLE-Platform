import logging
import os
import re
from typing import Any, cast

from botocore.exceptions import ClientError
from flasgger import swag_from
from flask import Flask, make_response, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_restful import Resource, abort, reqparse

from api.decorator import public_endpoint, roles_required
from api.util import (
    add_new_phoneNumber_for_user,
    delete_user_phoneNumber,
    doesUserExist,
    filterPairsWithNone,
    get_all_phoneNumbers_for_user,
    getDictionaryOfUserInfo,
    isGoodPassword,
    replace_phoneNumber_for_user,
    validate_user,
)
from authentication import cognito
from common.date_utils import is_date_passed
from common.regexUtil import phoneNumber_regex_check
from data import crud, marshal
from enums import RoleEnum
from models import UserOrm
from shared.user_utils import UserUtils
from validation.users import (
    UserAuthRequestValidator,
    UserEditValidator,
    UserRegisterValidator,
)
from validation.validation_exception import ValidationExceptionError

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


# api/user/all [GET]
class UserAll(Resource):
    # get all users
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-all.yml", methods=["GET"])
    def get(self):
        user_orm_list = crud.read_all(UserOrm)
        user_dict_list = []

        for user_orm in user_orm_list:
            user_dict = marshal.marshal(user_orm)

            vht_list = []
            for vht in user_orm.vht_list:
                vht_list.append(vht.id)

            user_dict["supervises"] = vht_list
            user_dict["phone_numbers"] = [
                phone_number.phone_number for phone_number in user_orm.phone_numbers
            ]

            user_dict_list.append(user_dict)

        if user_dict_list is None:
            return {"message": "No users currently exist"}, 404
        return user_dict_list


# api/user/vhts [GET]
class UserAllVHT(Resource):
    # get all VHT's Info
    @roles_required([RoleEnum.CHO, RoleEnum.ADMIN, RoleEnum.HCW])
    @swag_from("../../specifications/user-vhts.yml", methods=["GET"])
    def get(self):
        vht_model_list = crud.find(UserOrm, UserOrm.role == RoleEnum.VHT.value)

        vht_dictionary_list = []
        for vht in vht_model_list:
            marshal.marshal(vht)
            vht_dictionary_list.append(
                {
                    "id": vht.id,
                    "email": vht.email,
                    "health_facility_name": vht.health_facility_name,
                    "name": vht.name,
                },
            )

        if vht_dictionary_list is None:
            return []
        return vht_dictionary_list


# api/user/{int: user_id}/change_pass [POST]
class AdminPasswordChange(Resource):
    # Ensure that we have the fields we want in JSON payload
    parser = reqparse.RequestParser()
    parser.add_argument(
        "password",
        type=str,
        required=True,
        help="This field cannot be left blank!",
    )

    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/admin-change-pass.yml", methods=["POST"])
    def post(self, id):
        data = self.parser.parse_args()

        # check if user exists
        if not doesUserExist(id):
            return {"message": no_user_found_message}, 400

        # check if password given is suitable
        if not isGoodPassword(data["password"]):
            return (
                {"message": "The new password must be at least 8 characters long"},
                400,
            )

        # data["password"] = flask_bcrypt.generate_password_hash(data["password"])

        # Update password
        crud.update(UserOrm, data, id=id)

        return {"message": "Success! Password has been changed"}, 200


# /api/user/current/change_pass [POST]
class UserPasswordChange(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument(
        "old_password",
        type=str,
        required=True,
        help="This field cannot be left blank!",
    )
    parser.add_argument(
        "new_password",
        type=str,
        required=True,
        help="This field cannot be left blank!",
    )

    @jwt_required()
    @swag_from("../../specifications/user-change-pass.yml", methods=["POST"])
    def post(self):
        data = self.parser.parse_args()

        # check if password given is suitable
        if not isGoodPassword(data["new_password"]):
            return (
                {"message": "The new password must be at least 8 characters long."},
                400,
            )

        # identity = get_jwt_identity()

        # Get all information about the user who is using this endpoint
        # user = crud.read(User, id=identity["user_id"])

        # If old password and password we have on file match
        # if user and flask_bcrypt.check_password_hash(
        #     user.password,
        #     data["old_password"],
        # ):
        #     # Create new dictionary with just keys we want to replace
        #     updated_payload = {
        #         "password": flask_bcrypt.generate_password_hash(data["new_password"]),
        #     }

        #     # Perform update
        #     crud.update(User, updated_payload, id=identity["user_id"])

        #     return {"message": "Success! Password has been changed"}, 200
        return {"error": "old_password incorrect"}, 400


# api/user/register [POST]
class UserRegisterApi(Resource):
    # Create a new user
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-register.yml", methods=["POST"])
    def post(self):
        request_body = request.get_json(force=True)

        new_user_to_feed = filterPairsWithNone(request_body)

        try:
            # validate the new user
            user_pydantic_model = UserRegisterValidator.validate(new_user_to_feed)
        except ValidationExceptionError as e:
            error_message = str(e)
            LOGGER.error(error_message)
            abort(400, message=error_message)

        # use pydantic model to generate validated dict for later processing
        new_user_dict = user_pydantic_model.model_dump()

        UserUtils.create_user(**new_user_dict)

        # # Updating the supervises table if necessary as well
        # if new_user["role"] == "CHO" and list_of_vhts is not None:
        #     crud.add_vht_to_supervise(created_user_id, list_of_vhts)
        return UserUtils.get_user_dict_from_username(user_pydantic_model.username), 200


def get_user_data_for_token(user: UserOrm) -> dict:
    data = {}
    data["email"] = user.email
    data["role"] = user.role
    data["firstName"] = user.first_name
    data["healthFacilityName"] = user.health_facility_name
    data["isLoggedIn"] = True
    data["user_id"] = user.id
    data["phoneNumbers"] = get_all_phoneNumbers_for_user(user.id)
    vhtList = []
    data["supervises"] = []
    if data["role"] == RoleEnum.CHO.value:
        if user.vhtList:
            for user_in_vht_list in user.vhtList:
                vhtList.append(user_in_vht_list.id)
            data["supervises"] = vhtList
    return data


def get_access_token(data: dict) -> str:
    return create_access_token(identity=data)


def get_refresh_token(data: dict) -> str:
    return create_refresh_token(identity=data)


# api/user/auth [POST]
class UserAuthApi(Resource):
    app = Flask(__name__)

    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["10 per minute", "20 per hour", "50 per day"],
        # parsed by flask limiter library https://flask-limiter.readthedocs.io/en/stable/
    )

    # login to account
    @limiter.limit(
        "10 per minute, 20 per hour, 30 per day",
        error_message="Login attempt limit reached please try again later.",
        exempt_when=lambda: os.environ.get("LIMITER_DISABLED")
        == "True",  # disable limiter during testing stage
    )
    @swag_from(
        "../../specifications/user-auth.yml",
        methods=["POST"],
    )  # needs to be below limiter since it will point to limiter/... path
    def post(self):
        """
        Authentication endpoint.
        """
        request_body = request.get_json(force=True)
        try:
            credentials = UserAuthRequestValidator(**request_body)
        except ValidationExceptionError as err:
            error_message = str(err)
            LOGGER.error(error_message)
            abort(400, message=error_message)

        # Attempt authentication with Cognito user pool.
        try:
            auth_result = cognito.start_sign_in(**credentials.model_dump())
        except ClientError as err:
            error = err.response.get("Error")
            print(error)
            abort(401, message=error)

        # If no exception was raised, then authentication was successful.

        # Get user data from database.
        try:
            user_dict = UserUtils.get_user_dict_with_phone_numbers(credentials.username)
        except ValueError as err:
            LOGGER.error(err)
            LOGGER.error(
                "ERROR: Something has gone wrong. User authentication succeeded but username (%s) is not found in database.",
                credentials.username,
            )
            print(err)
            abort(500, message=error)
        user_id = user_dict["id"]

        # construct and add the sms key information in the same format as api/user/<int:user_id>/smskey
        sms_key = UserUtils.get_user_sms_secret_key(user_id)
        if sms_key:
            # remove extra items
            del sms_key["id"]
            del sms_key["user_id"]
            # change the key name
            sms_key["sms_key"] = sms_key.pop("secret_key")
            # add message
            if is_date_passed(sms_key["expiry_date"]):
                sms_key["message"] = "EXPIRED"
            elif is_date_passed(sms_key["stale_date"]):
                sms_key["message"] = "WARN"
            else:
                sms_key["message"] = "NORMAL"
            # convert dates to string
            sms_key["stale_date"] = str(sms_key["stale_date"])
            sms_key["expiry_date"] = str(sms_key["expiry_date"])
            # store the constructed sms key
            # user_data["smsKey"] = json.dumps(sms_key)
        # else:
        # user_data["sms_key"] = "NOTFOUND"

        # Don't include refresh token in body of response.
        refresh_token = auth_result["refresh_token"]
        del auth_result["refresh_token"]

        # Add sms key to user.
        user_dict = cast(dict[str, Any], user_dict)
        user_dict["sms_key"] = sms_key
        # Don't return sub.
        del user_dict["sub"]

        challenge = auth_result["challenge"]

        resp_body = {
            "access_token": auth_result["access_token"],
            "user": user_dict,
            "challenge": None,
        }

        # Only include challenge in response if challenge_name is not None.
        if challenge["challenge_name"] is not None:
            resp_body["challenge"] = challenge

        resp = make_response(resp_body, 200)
        # Store refresh token in HTTP-Only cookie.
        if refresh_token is not None:
            resp.set_cookie(
                "refresh_token",
                refresh_token,
                path="api/user/auth/refresh_token",
                httponly=True,
                secure=True,
            )
        return resp


# api/user/auth/refresh_token
class UserAuthTokenRefreshApi(Resource):
    @jwt_required(refresh=True)
    @swag_from("../../specifications/user-auth-refresh.yml", methods=["POST"])
    def post(self):
        current_user = get_jwt_identity()
        new_token = create_access_token(identity=current_user, fresh=False)
        return {"token": new_token}, 200


# /api/user/current
# Get identity of current user with jwt token
class UserTokenApi(Resource):
    @jwt_required()
    @swag_from("../../specifications/user-current.yml", methods=["GET"])
    def get(self):
        tokenData = get_jwt_identity()
        user_id = tokenData["user_id"]

        return getDictionaryOfUserInfo(user_id), 200


# api/user/<int:user_id> [GET, PUT, DELETE]
class UserApi(Resource):
    # edit user with id
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-put.yml", methods=["PUT"])
    def put(self, id):
        request_body = request.get_json(force=True)
        request_body["id"] = id
        try:
            # validate the new user
            user_model = UserEditValidator.validate(request_body)
        except ValidationExceptionError as e:
            error_message = str(e)
            LOGGER.error(error_message)
            abort(400, message=error_message)

        # use pydantic model to generate validated dict for later processing

        try:
            # Update the user.
            UserUtils.update_user(id, user_model.model_dump())
        except ValueError as e:
            error_message = str(e)
            LOGGER.error(error_message)
            abort(400, message=error_message)

        # supervises = []
        # if new_user["role"] == RoleEnum.CHO.value:
        #     supervises = new_user.get("supervises", [])

        # crud.add_vht_to_supervise(id, supervises)
        # new_user.pop("supervises", None)

        return UserUtils.get_user_dict_from_id(id), 200

    # @jwt_required()
    @public_endpoint
    @swag_from("../../specifications/user-get.yml", methods=["GET"])
    @public_endpoint
    def get(self, id):
        try:
            user_dict = UserUtils.get_user_dict_from_id(id)
        except ValueError as err:
            error_message = str(err)
            LOGGER.error(error_message)
            abort(404, message=error_message)

        return user_dict, 200

    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-delete.yml", methods=["DELETE"])
    def delete(self, id):
        # Ensure we have id
        if not id:
            error = {"message": null_id_message}
            LOGGER.error(error)
            return error, 400

        # Ensure that id is valid
        user = crud.read(UserOrm, id=id)
        if user is None:
            error = {"message": no_user_found_message}
            LOGGER.error(error)
            return error, 400

        crud.delete(user)

        return {"message": "User deleted"}, 200


# api/user/<int:user_id>/phone
class UserPhoneUpdate(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument(
        "new_phone_number",
        type=str,
        required=True,
        help="New phone number is required",
    )
    parser.add_argument(
        "current_phone_number",
        type=str,
        required=True,
        help="Current phone number is required",
    )
    parser.add_argument(
        "old_phone_number",
        type=str,
        required=True,
        help="Old phone number is required",
    )

    # Handle the GET request for adding a new phone number
    @jwt_required()
    @swag_from("../../specifications/user-phone-get.yml", methods=["GET"])
    def get(self, user_id):
        if not user_id:
            return {"message": null_id_message}, 400
        # check if user exists
        if not doesUserExist(user_id):
            return {"message": no_user_found_message}, 400

        phone_numbers = get_all_phoneNumbers_for_user(user_id)
        return {"phone_numbers": phone_numbers}, 200

    # Handle the PUT request updating a current phone number to a new phone number
    @jwt_required()
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-phone-put.yml", methods=["PUT"])
    def put(self, user_id):
        if not user_id:
            return {"message": null_id_message}, 400
        # check if user exists
        if not doesUserExist(user_id):
            return {"message": no_user_found_message}, 404
        args = self.parser.parse_args()
        new_phone_number = args["newPhoneNumber"]
        current_phone_number = args["currentPhoneNumber"]

        if not phoneNumber_regex_check(new_phone_number):
            return {"message": invalid_phone_number_message}, 400

        if new_phone_number is None:
            return {"message": null_phone_number_message}, 400

        # Add the phone number to user's phoneNumbers
        if replace_phoneNumber_for_user(
            current_phone_number,
            new_phone_number,
            user_id,
        ):
            return {"message": "User phone number updated successfully"}, 200

        return {"message": "Phone number cannot be updated"}, 400

    # Handle the POST request for adding a new phone number
    @jwt_required()
    @swag_from("../../specifications/user-phone-post.yml", methods=["POST"])
    def post(self, user_id):
        if not user_id:
            return {"message": null_id_message}, 400
        # check if user exists
        if not doesUserExist(user_id):
            return {"message": no_user_found_message}, 400

        args = self.parser.parse_args()
        new_phone_number = args["newPhoneNumber"]

        if new_phone_number is None:
            return {"message": "Phone number cannot be null"}, 400

        # Add the phone number to user's phoneNumbers
        if add_new_phoneNumber_for_user(new_phone_number, user_id):
            return {"message": "User phone number added successfully"}, 200

        return {"message": "Phone number already exists"}, 400

    # Handle the DELETE request for deleting an existing phone number
    @jwt_required()
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-phone-delete.yml", methods=["DELETE"])
    def delete(self, user_id):
        if not user_id:
            return {"message": null_id_message}, 400

        # check if user exists
        if not doesUserExist(user_id):
            return {"message": no_user_found_message}, 400

        args = self.parser.parse_args()
        number_to_delete = args["oldPhoneNumber"]

        if number_to_delete is None:
            return {"message": null_phone_number_message}, 400

        if delete_user_phoneNumber(number_to_delete, user_id):
            return {"message": "User phone number deleted successfully"}, 200

        return {"message": "Cannot delete the phone number"}, 400


# api/user/<int:user_id>/smskey
class UserSMSKey(Resource):
    # Handle the PUT request for updating the phone number
    parser = reqparse.RequestParser()

    @jwt_required()
    @swag_from("../../specifications/user-sms-key-get.yml", methods=["GET"])
    def get(self, user_id):
        user_info = get_jwt_identity()
        if user_info["role"] != "ADMIN" and user_info["user_id"] is not user_id:
            return (
                {
                    "message": "Permission denied, you can only get your sms-key or use the admin account",
                },
                403,
            )
        validate_result = validate_user(user_id)
        if validate_result is not None:
            return validate_result
        sms_key = UserUtils.get_user_sms_secret_key(user_id)
        if not sms_key:
            return {"message": "NOTFOUND"}, 424
        if is_date_passed(sms_key["expiry_date"]):
            return (
                {
                    "message": "EXPIRED",
                    "expiry_date": str(sms_key["expiry_date"]),
                    "stale_date": str(sms_key["stale_date"]),
                    "sms_key": sms_key["secret_key"],
                },
                200,
            )
        if is_date_passed(sms_key["stale_date"]):
            return (
                {
                    "message": "WARN",
                    "expiry_date": str(sms_key["expiry_date"]),
                    "stale_date": str(sms_key["stale_date"]),
                    "sms_key": sms_key["secret_key"],
                },
                200,
            )
        return (
            {
                "message": "NORMAL",
                "expiry_date": str(sms_key["expiry_date"]),
                "stale_date": str(sms_key["stale_date"]),
                "sms_key": sms_key["secret_key"],
            },
            200,
        )

    @jwt_required()
    @swag_from("../../specifications/user-sms-key-put.yml", methods=["PUT"])
    def put(self, user_id):
        user_info = get_jwt_identity()
        if user_info["role"] != "ADMIN" and user_info["user_id"] is not user_id:
            return (
                {
                    "message": "Permission denied, you can only get your sms-key or use the admin account",
                },
                403,
            )
        validate_result = validate_user(user_id)
        if validate_result is not None:
            return validate_result
        sms_key = UserUtils.get_user_sms_secret_key(user_id)
        if not sms_key:
            return {"message": "NOTFOUND"}, 424
        new_key = UserUtils.get_user_sms_secret_key(user_id)
        return (
            {
                "message": "NORMAL",
                "sms_key": new_key["secret_key"],
                "expiry_date": str(new_key["expiry_date"]),
                "stale_date": str(new_key["stale_date"]),
            },
            200,
        )

    @jwt_required()
    @swag_from("../../specifications/user-sms-key-post.yml", methods=["POST"])
    def post(self, user_id):
        user_info = get_jwt_identity()
        if user_info["role"] != "ADMIN" and user_info["user_id"] is not user_id:
            return (
                {
                    "message": "Permission denied, you can only get your sms-key or use the admin account",
                },
                403,
            )
        validate_result = validate_user(user_id)
        if validate_result is not None:
            return validate_result
        sms_key = UserUtils.get_user_sms_secret_key(user_id)
        if not sms_key:
            new_key = UserUtils.create_sms_secret_key_for_user(user_id)
            return (
                {
                    "message": "NORMAL",
                    "sms_key": new_key["secret_key"],
                    "expiry_date": str(new_key["expiry_date"]),
                    "stale_date": str(new_key["stale_date"]),
                },
                201,
            )
        return {"message": "DUPLICATE"}, 200


# api/phone/is_relay
class ValidateRelayPhoneNumber(Resource):
    # Define the request parser
    parser = reqparse.RequestParser()
    parser.add_argument(
        "phone_number",
        type=str,
        required=True,
        help="Phone number is required.",
    )

    @jwt_required()
    @swag_from("../../specifications/is-phone-number-relay-get.yml", methods=["GET"])
    def get(self):
        data = self.parser.parse_args()
        phone_number = data["phoneNumber"]
        # remove dashes from the user's entered phone number
        phone_number = re.sub(r"[-]", "", phone_number)

        phone_relay_stat = crud.is_phone_number_relay(phone_number)
        if phone_relay_stat == 1:
            return {"message": "YES"}, 200
        if phone_relay_stat == 0:
            return {"message": "NO"}, 200
        return {"message": "Permission denied"}, 403


# api/phone/relays
class RelayPhoneNumbers(Resource):
    # Define the request parser
    parser = reqparse.RequestParser()

    @jwt_required()
    @swag_from("../../specifications/relay-phone-number-get.yml", methods=["GET"])
    def get(self):
        self.parser.parse_args()
        relay_phone_numbers = crud.get_all_relay_phone_numbers()

        if relay_phone_numbers:
            return {"relayPhoneNumbers": relay_phone_numbers}, 200
        return {"message": "Permission denied"}, 403
