import logging
import os
import re
from typing import Any

from botocore.exceptions import ClientError
from flasgger import swag_from
from flask import Flask, make_response, request
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
    isGoodPassword,
    replace_phoneNumber_for_user,
)
from authentication import cognito
from common import user_utils
from common.regexUtil import phoneNumber_regex_check
from data import crud, marshal
from enums import RoleEnum
from models import UserOrm
from validation.users import (
    UserAuthRequestValidator,
    UserRegisterValidator,
    UserValidator,
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
        user_list = user_utils.get_all_users_data()
        return user_list, 200


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
                    "user_id": vht.id,
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

        user_utils.create_user(**new_user_dict)

        # # Updating the supervises table if necessary as well
        # if new_user["role"] == "CHO" and list_of_vhts is not None:
        #     crud.add_vht_to_supervise(created_user_id, list_of_vhts)
        return user_utils.get_user_dict_from_username(user_pydantic_model.username), 200


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
            return None

        # Attempt authentication with Cognito user pool.
        try:
            auth_result = cognito.start_sign_in(**credentials.model_dump())
        except ClientError as err:
            print(err)
            error = err.response.get("Error")
            print(error)
            abort(401, message=error)
            return None
        except ValueError as err:
            print(err)
            abort(401, message=str(err))
            return None

        # If no exception was raised, then authentication was successful.

        # Get user data from database.
        try:
            user_dict = user_utils.get_user_data_from_username(credentials.username)
        except ValueError as err:
            LOGGER.error(err)
            LOGGER.error(
                "ERROR: Something has gone wrong. User authentication succeeded but username (%s) is not found in database.",
                credentials.username,
            )
            print(err)
            abort(500, message=err)
            return None

        # Don't include refresh token in body of response.
        refresh_token = auth_result["refresh_token"]
        del auth_result["refresh_token"]

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
                httponly=True,
            )
        return resp


# api/user/auth/refresh_token
class UserAuthTokenRefreshApi(Resource):
    @swag_from("../../specifications/user-auth-refresh.yml", methods=["POST"])
    @public_endpoint
    def post(self):
        request_body: dict[str, Any] = request.get_json(force=True)
        username = request_body.get("username")
        if username is None:
            abort(400, message="No username was provided.")
            return None
        try:
            new_access_token = cognito.refresh_access_token(username)
        except ValueError as err:
            print(err)
            LOGGER.error(err)
            abort(401, message=str(err))
            return None
        return {"access_token": new_access_token}, 200


# /api/user/current
# Get identity of current user with jwt token
class UserTokenApi(Resource):
    @swag_from("../../specifications/user-current.yml", methods=["GET"])
    def get(self):
        current_user = user_utils.get_current_user_from_jwt()
        return current_user, 200


# api/user/<int:user_id> [GET, PUT, DELETE]
class UserApi(Resource):
    # edit user with id
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-put.yml", methods=["PUT"])
    def put(self, id):
        request_body = request.get_json(force=True)
        try:
            # validate the new user
            user_model = UserValidator.validate(request_body)
        except ValidationExceptionError as e:
            error_message = str(e)
            LOGGER.error(error_message)
            abort(400, message=error_message)
            return None

        try:
            # Update the user.
            user_utils.update_user(id, user_model.model_dump())
        except ValueError as e:
            error_message = str(e)
            LOGGER.error(error_message)
            abort(400, message=error_message)
            return None

        return user_utils.get_user_dict_from_id(id), 200

    @public_endpoint
    @swag_from("../../specifications/user-get.yml", methods=["GET"])
    @public_endpoint
    def get(self, id):
        try:
            user_dict = user_utils.get_user_data_from_id(id)
        except ValueError as err:
            error_message = str(err)
            LOGGER.error(error_message)
            abort(404, message=error_message)

        return user_dict, 200

    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-delete.yml", methods=["DELETE"])
    def delete(self, id):
        # Ensure that id is valid
        user = crud.read(UserOrm, id=id)
        if user is None:
            error = {"message": no_user_found_message}
            LOGGER.error(error)
            return error, 400

        try:
            user_utils.delete_user(user.username)
        except ValueError as err:
            error = {"message": str(err)}
            LOGGER.error(error)
            return error, 400

        return {"message": "User deleted"}, 200


# TODO: Rework these endpoints. Users should be able to have multiple phone numbers.
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
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-phone-put.yml", methods=["PUT"])
    def put(self, user_id):
        # check if user exists
        if not user_utils.does_user_exist(user_id):
            return {"message": no_user_found_message}, 404

        args = self.parser.parse_args()
        new_phone_number = args["new_phone_number"]
        current_phone_number = args["current_phone_number"]

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
    @swag_from("../../specifications/user-phone-post.yml", methods=["POST"])
    def post(self, user_id):
        if not user_id:
            return {"message": null_id_message}, 400
        # check if user exists
        if not doesUserExist(user_id):
            return {"message": no_user_found_message}, 400

        args = self.parser.parse_args()
        new_phone_number = args["new_phone_number"]

        if new_phone_number is None:
            return {"message": "Phone number cannot be null"}, 400

        # Add the phone number to user's phoneNumbers
        if add_new_phoneNumber_for_user(new_phone_number, user_id):
            return {"message": "User phone number added successfully"}, 200

        return {"message": "Phone number already exists"}, 400

    # Handle the DELETE request for deleting an existing phone number
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-phone-delete.yml", methods=["DELETE"])
    def delete(self, user_id):
        if not user_id:
            return {"message": null_id_message}, 400

        # check if user exists
        if not doesUserExist(user_id):
            return {"message": no_user_found_message}, 400

        args = self.parser.parse_args()
        number_to_delete = args["old_phone_number"]

        if number_to_delete is None:
            return {"message": null_phone_number_message}, 400

        if delete_user_phoneNumber(number_to_delete, user_id):
            return {"message": "User phone number deleted successfully"}, 200

        return {"message": "Cannot delete the phone number"}, 400


# api/user/<int:user_id>/smskey
class UserSMSKey(Resource):
    # Handle the PUT request for updating the phone number
    parser = reqparse.RequestParser()

    @swag_from("../../specifications/user-sms-key-get.yml", methods=["GET"])
    def get(self, user_id):
        current_user = user_utils.get_current_user_from_jwt()
        if current_user["role"] != "ADMIN" and current_user["id"] is not user_id:
            return (
                {
                    "message": "Permission denied, you can only get your own sms-key or use the admin account",
                },
                403,
            )

        sms_key = user_utils.get_user_sms_secret_key_formatted(user_id)
        if sms_key is None:
            return {"message": "NOTFOUND"}, 424
        return sms_key, 200

    @swag_from("../../specifications/user-sms-key-put.yml", methods=["PUT"])
    def put(self, user_id):
        current_user = user_utils.get_current_user_from_jwt()
        if current_user["role"] != "ADMIN" and current_user["id"] is not user_id:
            return (
                {
                    "message": "Permission denied, you can only get your own sms-key or use the admin account",
                },
                403,
            )
        sms_key = user_utils.get_user_sms_secret_key_formatted(user_id)
        if sms_key is None:
            return {"message": "NOTFOUND"}, 424

        # Create new key.
        new_key = user_utils.update_sms_secret_key_for_user(user_id)
        return new_key, 200

    @swag_from("../../specifications/user-sms-key-post.yml", methods=["POST"])
    def post(self, user_id):
        current_user = user_utils.get_current_user_from_jwt()
        if current_user["role"] != "ADMIN" and current_user["id"] is not user_id:
            return (
                {
                    "message": "Permission denied, you can only get your own sms-key or use the admin account",
                },
                403,
            )

        sms_key = user_utils.get_user_sms_secret_key_formatted(user_id)
        if sms_key is None:
            new_key = user_utils.create_sms_secret_key_for_user(user_id)
            return new_key, 201

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

    @swag_from("../../specifications/is-phone-number-relay-get.yml", methods=["GET"])
    def get(self):
        data = self.parser.parse_args()
        phone_number = data["phone_number"]
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

    @swag_from("../../specifications/relay-phone-number-get.yml", methods=["GET"])
    def get(self):
        self.parser.parse_args()
        relay_phone_numbers = crud.get_all_relay_phone_numbers()

        if relay_phone_numbers:
            return {"relayPhoneNumbers": relay_phone_numbers}, 200
        return {"message": "Permission denied"}, 403
