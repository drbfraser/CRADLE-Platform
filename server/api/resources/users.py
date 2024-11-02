import json
import logging
import os
import re

import boto3
from dotenv import load_dotenv
from flasgger import swag_from
from flask import Flask
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_restful import Resource, abort, reqparse

from api.decorator import roles_required
from api.util import (
    add_new_phoneNumber_for_user,
    create_secret_key_for_user,
    delete_user_phoneNumber,
    doesUserExist,
    filterPairsWithNone,
    get_all_phoneNumbers_for_user,
    get_user_secret_key,
    getDictionaryOfUserInfo,
    is_date_passed,
    isGoodPassword,
    phoneNumber_exists,
    phoneNumber_regex_check,
    replace_phoneNumber_for_user,
    update_secret_key_for_user,
    validate_user,
)
from authentication.CognitoClientWrapper import CognitoClientWrapper
from config import flask_bcrypt
from data import crud, marshal
from enums import RoleEnum
from models import User
from validation import users

LOGGER = logging.getLogger(__name__)

load_dotenv()
# Load aws secrets as environment variables.
load_dotenv(dotenv_path="/run/secrets/.aws.secrets.env")

AWS_REGION = os.environ["AWS_REGION"]
COGNITO_USER_POOL_ID = os.environ["COGNITO_USER_POOL_ID"]
COGNITO_APP_CLIENT_ID = os.environ["COGNITO_APP_CLIENT_ID"]
COGNITO_CLIENT_SECRET = os.environ["COGNITO_CLIENT_SECRET"]

AWS_ACCESS_KEY_ID = os.environ["AWS_ACCESS_KEY_ID"]
AWS_SECRET_ACCESS_KEY = os.environ["AWS_SECRET_ACCESS_KEY"]

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

# Error messages
null_phone_number_message = "No phone number was provided."
null_id_message = "No id provided."
no_user_found_message = "There is no user with this id."
invalid_phone_number_message = (
    "Phone number {phoneNumber} has wrong format. The format for phone number should be +x-xxx-xxx-xxxx, "
    "+x-xxx-xxx-xxxxx, xxx-xxx-xxxx or xxx-xxx-xxxxx"
)
phone_number_already_exists_message = "Phone number is already assigned to another user."

# Building a parser that will be used over several apis for Users
UserParser = reqparse.RequestParser()
UserParser.add_argument(
    "email",
    type=str,
    required=True,
    help="This field cannot be left blank!",
)
UserParser.add_argument(
    "firstName",
    type=str,
    required=True,
    help="This field cannot be left blank!",
)
UserParser.add_argument(
    "healthFacilityName",
    type=str,
    required=True,
    help="This field cannot be left blank!",
)
UserParser.add_argument(
    "phoneNumbers",
    type=str,
    required=True,
    help="This field cannot be left blank!",
    action="append",
)
UserParser.add_argument(
    "role",
    type=str,
    required=True,
    help="This field cannot be left blank!",
)
UserParser.add_argument("supervises", type=int, action="append")

supported_roles = []
for role in RoleEnum:
    supported_roles.append(role.value)


# api/user/all [GET]
class UserAll(Resource):
    # get all users
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-all.yml", methods=["GET"])
    def get(self):
        userModelList = crud.read_all(User)
        userDictList = []

        for user in userModelList:
            userDict = marshal.marshal(user)
            userDict.pop("password")

            vhtList = []

            for vht in user.vhtList:
                vhtList.append(vht.id)

            userDict["supervises"] = vhtList
            userDict["userId"] = userDict["id"]
            userDict.pop("id")
            userDict["phoneNumbers"] = [
                phone_number.number for phone_number in user.phoneNumbers
            ]

            userDictList.append(userDict)

        if userDictList is None:
            return {"message": "No users currently exist"}, 404
        return userDictList


# api/user/vhts [GET]
class UserAllVHT(Resource):
    # get all VHT's Info
    @roles_required([RoleEnum.CHO, RoleEnum.ADMIN, RoleEnum.HCW])
    @swag_from("../../specifications/user-vhts.yml", methods=["GET"])
    def get(self):
        vhtModelList = crud.find(User, User.role == RoleEnum.VHT.value)

        vhtDictionaryList = []
        for vht in vhtModelList:
            marshal.marshal(vht)
            vhtDictionaryList.append(
                {
                    "userId": vht.id,
                    "email": vht.email,
                    "healthFacilityName": vht.healthFacilityName,
                    "firstName": vht.firstName,
                },
            )

        if vhtDictionaryList is None:
            return []
        return vhtDictionaryList


# api/user/{int: userId}/change_pass [POST]
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

        data["password"] = flask_bcrypt.generate_password_hash(data["password"])

        # Update password
        crud.update(User, data, id=id)

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

        identity = get_jwt_identity()

        # Get all information about the user who is using this endpoint
        user = crud.read(User, id=identity["userId"])

        # If old password and password we have on file match
        if user and flask_bcrypt.check_password_hash(
            user.password,
            data["old_password"],
        ):
            # Create new dictionary with just keys we want to replace
            updated_payload = {
                "password": flask_bcrypt.generate_password_hash(data["new_password"]),
            }

            # Perform update
            crud.update(User, updated_payload, id=identity["userId"])

            return {"message": "Success! Password has been changed"}, 200
        return {"error": "old_password incorrect"}, 400


# api/user/register [POST]
class UserRegisterApi(Resource):
    # Allow for parsing a password too
    registerParser = UserParser.copy()
    registerParser.add_argument(
        "password",
        type=str,
        required=True,
        help="This field cannot be left blank!",
    )
    registerParser.add_argument(
        "username",
        type=str,
        required=True,
        help="Username cannot be left blank!",
    )


    # Create a new user
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-register.yml", methods=["POST"])
    def post(self):
        # Parse args
        new_user = filterPairsWithNone(self.registerParser.parse_args())

        # Get phone numbers.
        phone_numbers = list(new_user.get("phoneNumbers", []))

        # Remove phone numbers from new_user.
        new_user.pop("phoneNumbers")

        # validate the new user
        error_message = users.validate(new_user)
        if error_message is not None:
            LOGGER.error(error_message)
            abort(400, message=error_message)

        # Ensure that email is unique
        if (crud.read(User, email=new_user["email"])) is not None:
            error_message = "There is already a user with this email."
            LOGGER.error(error_message)
            abort(400, message=error_message)

        # Validate phone numbers.
        for phone_number in phone_numbers:
            if phoneNumber_exists(phone_number):
                return {"message": phone_number_already_exists_message }, 400

        create_user_response = cognito.create_user(username=new_user["username"],
                                                   email=new_user["email"],
                                                   name=new_user["firstName"])

        print(create_user_response)

        # Ensure that role is supported
        if new_user["role"] not in supported_roles:
            error_message = {"message": "Not a supported role."}
            LOGGER.error(error_message)
            abort(400, message=error_message)

        # Encrypt pass
        new_user["password"] = flask_bcrypt.generate_password_hash(new_user["password"])
        listOfVhts = new_user.pop("supervises", None)

        # Create the new user
        userModel = marshal.unmarshal(User, new_user)
        crud.create(userModel)

        # Getting the id of the created user
        createdUser = marshal.marshal(crud.read(User, email=new_user["email"]))
        createdUser.pop("password")
        createdUserId = createdUser["id"]

        # Add the new user's phone numbers.
        for phone_number in phone_numbers:
            add_new_phoneNumber_for_user(phone_number, createdUserId)

        # Updating the supervises table if necessary as well
        if new_user["role"] == "CHO" and listOfVhts is not None:
            crud.add_vht_to_supervise(createdUserId, listOfVhts)

        response = getDictionaryOfUserInfo(createdUserId)
        response["ENABLE_DEV_USERS"] = create_user_response
        return response, 200


def get_user_data_for_token(user: User) -> dict:
    data = {}
    data["email"] = user.email
    data["role"] = user.role
    data["firstName"] = user.firstName
    data["healthFacilityName"] = user.healthFacilityName
    data["isLoggedIn"] = True
    data["userId"] = user.id
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

    parser = reqparse.RequestParser()
    parser.add_argument(
        "email",
        type=str,
        required=True,
        help="This field cannot be left blank!",
    )
    parser.add_argument(
        "password",
        type=str,
        required=True,
        help="This field cannot be left blank!",
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
        The implementation of Post method for user login. Two part included in this methods:
        1. Validation check: if the user enters an email that does not exist or inputs the wrong password for their account, then in both cases
            they will receive the following message: "Incorrect username or password."
        2. User params loading: after user identification check is done, system will load the user data and return
            code 200

        """
        data = self.parser.parse_args()
        user = crud.read(User, email=data["email"])
        salted_invalid_password = (
            "$2b$12$xleTmwkhurHlf/5g.4l9U.VADQPcYuIp6QPlMXDJeGez05uRWGqrW"
        )

        # We want to obfuscate and conceal timing information by checking the password hash of an invalid password
        if ((user is None
             and not flask_bcrypt.check_password_hash(
                    salted_invalid_password,
                    data["password"]))
            or (user is not None
                and not flask_bcrypt.check_password_hash(
                    user.password,
                    data["password"]))
        ):
            return {"message": "Incorrect username or password."}, 401

        if user is None:
            return None

        # setup any extra user params
        user_data = get_user_data_for_token(user)

        user_data["token"] = get_access_token(user_data)
        user_data["refresh"] = get_refresh_token(user_data)

        # construct and add the sms key information in the same format as api/user/<int:user_id>/smskey
        sms_key = get_user_secret_key(user.id)
        if sms_key:
            # remove extra items
            del sms_key["id"]
            del sms_key["userId"]
            # change the key name
            sms_key["sms_key"] = sms_key.pop("secret_Key")
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
            user_data["smsKey"] = json.dumps(sms_key)
        else:
            user_data["smsKey"] = "NOTFOUND"

        return user_data, 200


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
        userId = tokenData["userId"]

        return getDictionaryOfUserInfo(userId), 200


# api/user/<int:userId> [GET, PUT, DELETE]
class UserApi(Resource):
    # edit user with id
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-put.yml", methods=["PUT"])
    def put(self, id):
        # Ensure we have id
        if not id:
            return {"message": null_id_message}, 400

        # Parse the arguments that we want
        new_user = filterPairsWithNone(UserParser.parse_args())

        # Save the phoneNumbers field and remove it from new_user.
        phone_numbers = new_user.get("phoneNumbers")
        if phone_numbers is None:
            return {"message": null_phone_number_message}, 400
        phone_numbers = list(phone_numbers)
        new_user = {k: v for k, v in new_user.items() if k != "phoneNumbers"}

        # validate the new users
        error_message = users.validate(new_user)
        if error_message is not None:
            LOGGER.error(error_message)
            abort(400, message=error_message)

        # Ensure that id is valid
        if not doesUserExist(id):
            error = {"message": no_user_found_message}
            LOGGER.error(error)
            return error, 400

        if new_user["role"] not in supported_roles:
            error = {"message": "Not a supported role."}
            LOGGER.error(error)
            return error, 400

        # Validate the phone numbers.
        for phone_number in phone_numbers:
            if not phoneNumber_regex_check(phone_number):
                return {"message": invalid_phone_number_message}, 400

        # Get the user's existing phone numbers.
        old_phone_numbers: list[str] = get_all_phoneNumbers_for_user(id)

        # Isolate those phone numbers which are not already in the database.
        new_phone_numbers = list(set(phone_numbers).difference(set(old_phone_numbers)))

        # Isolate the phone numbers to remove.
        remove_phone_numbers = list(
            set(old_phone_numbers).difference(set(phone_numbers)),
        )

        # If new phone number belongs to an existing user, return an error message.
        for phone_number in new_phone_numbers:
            if phoneNumber_exists(phone_number):
                return phone_number_already_exists_message, 400

        supervises = []
        if new_user["role"] == RoleEnum.CHO.value:
            supervises = new_user.get("supervises", [])

        crud.add_vht_to_supervise(id, supervises)
        new_user.pop("supervises", None)

        # Update the user.
        crud.update(User, new_user, id=id)

        # Add new phone numbers.
        for phone_number in new_phone_numbers:
            add_new_phoneNumber_for_user(phone_number, id)

        # Remove phone numbers to be removed.
        for phone_number in remove_phone_numbers:
            delete_user_phoneNumber(phone_number, id)

        return getDictionaryOfUserInfo(id)

    @jwt_required()
    @swag_from("../../specifications/user-get.yml", methods=["GET"])
    def get(self, id):
        # Ensure we have id
        if not id:
            error = {"message": null_id_message}
            LOGGER.error(error)
            return error, 400

        # Ensure that id is valid
        if not doesUserExist(id):
            error = {"message": no_user_found_message}
            LOGGER.error(error)
            return error, 400

        return getDictionaryOfUserInfo(id)

    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-delete.yml", methods=["DELETE"])
    def delete(self, id):
        # Ensure we have id
        if not id:
            error = {"message": null_id_message}
            LOGGER.error(error)
            return error, 400

        # Ensure that id is valid
        user = crud.read(User, id=id)
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
        "newPhoneNumber",
        type=str,
        required=True,
        help="New phone number is required",
    )
    parser.add_argument(
        "currentPhoneNumber",
        type=str,
        required=True,
        help="Current phone number is required",
    )
    parser.add_argument(
        "oldPhoneNumber",
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

        phoneNumbers = get_all_phoneNumbers_for_user(user_id)
        return {"phoneNumbers": phoneNumbers}, 200

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
        if user_info["role"] != "ADMIN" and user_info["userId"] is not user_id:
            return (
                {
                    "message": "Permission denied, you can only get your sms-key or use the admin account",
                },
                403,
            )
        validate_result = validate_user(user_id)
        if validate_result is not None:
            return validate_result
        sms_key = get_user_secret_key(user_id)
        if not sms_key:
            return {"message": "NOTFOUND"}, 424
        if is_date_passed(sms_key["expiry_date"]):
            return (
                {
                    "message": "EXPIRED",
                    "expiry_date": str(sms_key["expiry_date"]),
                    "stale_date": str(sms_key["stale_date"]),
                    "sms_key": sms_key["secret_Key"],
                },
                200,
            )
        if is_date_passed(sms_key["stale_date"]):
            return (
                {
                    "message": "WARN",
                    "expiry_date": str(sms_key["expiry_date"]),
                    "stale_date": str(sms_key["stale_date"]),
                    "sms_key": sms_key["secret_Key"],
                },
                200,
            )
        return (
            {
                "message": "NORMAL",
                "expiry_date": str(sms_key["expiry_date"]),
                "stale_date": str(sms_key["stale_date"]),
                "sms_key": sms_key["secret_Key"],
            },
            200,
        )

    @jwt_required()
    @swag_from("../../specifications/user-sms-key-put.yml", methods=["PUT"])
    def put(self, user_id):
        user_info = get_jwt_identity()
        if user_info["role"] != "ADMIN" and user_info["userId"] is not user_id:
            return (
                {
                    "message": "Permission denied, you can only get your sms-key or use the admin account",
                },
                403,
            )
        validate_result = validate_user(user_id)
        if validate_result is not None:
            return validate_result
        sms_key = get_user_secret_key(user_id)
        if not sms_key:
            return {"message": "NOTFOUND"}, 424
        new_key = update_secret_key_for_user(user_id)
        return (
            {
                "message": "NORMAL",
                "sms_key": new_key["secret_Key"],
                "expiry_date": str(new_key["expiry_date"]),
                "stale_date": str(new_key["stale_date"]),
            },
            200,
        )

    @jwt_required()
    @swag_from("../../specifications/user-sms-key-post.yml", methods=["POST"])
    def post(self, user_id):
        user_info = get_jwt_identity()
        if user_info["role"] != "ADMIN" and user_info["userId"] is not user_id:
            return (
                {
                    "message": "Permission denied, you can only get your sms-key or use the admin account",
                },
                403,
            )
        validate_result = validate_user(user_id)
        if validate_result is not None:
            return validate_result
        sms_key = get_user_secret_key(user_id)
        if not sms_key:
            new_key = create_secret_key_for_user(user_id)
            return (
                {
                    "message": "NORMAL",
                    "sms_key": new_key["secret_Key"],
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
        "phoneNumber",
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
