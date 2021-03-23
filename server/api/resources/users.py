import logging, json
from flask import request, jsonify
from flask_restful import Resource, abort, reqparse
from models import validate_user, User, UserSchema, Role, RoleEnum
from config import db, flask_bcrypt
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    jwt_refresh_token_required,
    get_jwt_identity,
    get_jwt_claims,
)
from manager.UserManager import UserManager
from manager.RoleManager import RoleManager
from flasgger import swag_from
from api.decorator import roles_required
from api.util import isGoodPassword
from data import crud
from data import marshal
from models import User, supervises
import enum
from api.util import (
    filterPairsWithNone,
    getDictionaryOfUserInfo,
    doesUserExist,
)

# Building a parser that will be used over several apis for Users
UserParser = reqparse.RequestParser()
UserParser.add_argument(
    "email", type=str, required=True, help="This field cannot be left blank!"
)
UserParser.add_argument(
    "firstName", type=str, required=True, help="This field cannot be left blank!"
)
UserParser.add_argument(
    "healthFacilityName",
    type=str,
    required=True,
    help="This field cannot be left blank!",
)
UserParser.add_argument(
    "role", type=str, required=True, help="This field cannot be left blank!"
)
UserParser.add_argument("supervises", type=int, action="append")

supported_roles = []
for role in RoleEnum:
    supported_roles.append(role.name)


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

            userDictList.append(userDict)

        if userDictList is None:
            return {"message": "no users currently exist"}, 404
        return userDictList


# api/user/vhts [GET]
class UserAllVHT(Resource):

    # get all VHT's Info
    @roles_required([RoleEnum.CHO, RoleEnum.ADMIN, RoleEnum.HCW])
    @swag_from("../../specifications/user-vhts.yml", methods=["GET"])
    def get(self):

        vhtModelList = crud.find(User, User.role == RoleEnum.VHT.name)

        vhtDictionaryList = []
        for vht in vhtModelList:
            vhtDict = marshal.marshal(vht)
            vhtDictionaryList.append(
                {
                    "userId": vht.id,
                    "email": vht.email,
                    "healthFacilityName": vht.healthFacilityName,
                    "firstName": vht.firstName,
                }
            )

        if vhtDictionaryList is None:
            return []
        return vhtDictionaryList


# api/user/{int: userId}/change_pass [POST]
class AdminPasswordChange(Resource):

    # Ensure that we have the fields we want in JSON payload
    parser = reqparse.RequestParser()
    parser.add_argument(
        "password", type=str, required=True, help="This field cannot be left blank!"
    )

    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/admin-change-pass.yml", methods=["POST"])
    def post(self, id):

        data = self.parser.parse_args()

        # check if user exists
        if not doesUserExist(id):
            return {"message": "There is no user with this id"}, 400

        # check if password given is suitable
        if not isGoodPassword(data["password"]):
            return {
                "message": "The new password must be at least 8 characters long"
            }, 400

        data["password"] = flask_bcrypt.generate_password_hash(data["password"])

        # Update password
        crud.update(User, data, id=id)

        return {"message": "Success! Password has been changed"}, 200


# /api/user/current/change_pass [POST]
class UserPasswordChange(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument(
        "old_password", type=str, required=True, help="This field cannot be left blank!"
    )
    parser.add_argument(
        "new_password", type=str, required=True, help="This field cannot be left blank!"
    )

    @jwt_required
    @swag_from("../../specifications/user-change-pass.yml", methods=["POST"])
    def post(self):
        data = self.parser.parse_args()

        # check if password given is suitable
        if not isGoodPassword(data["new_password"]):
            return {
                "message": "The new password must be at least 8 characters long"
            }, 400

        identity = get_jwt_identity()

        # Get all information about the user who is using this endpoint
        user = crud.read(User, id=identity["userId"])

        # If old password and password we have on file match
        if user and flask_bcrypt.check_password_hash(
            user.password, data["old_password"]
        ):
            # Create new dictionary with just keys we want to replace
            updated_payload = {
                "password": flask_bcrypt.generate_password_hash(data["new_password"])
            }

            # Perform update
            crud.update(User, updated_payload, id=identity["userId"])

            return {"message": "Success! Password has been changed"}, 200
        else:
            return {"error": "old_password incorrect"}, 400


# api/user/register [POST]
class UserRegisterApi(Resource):

    # Allow for parsing a password too
    registerParser = UserParser.copy()
    registerParser.add_argument(
        "password", type=str, required=True, help="This field cannot be left blank!"
    )

    # Create a new user
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-register.yml", methods=["POST"])
    def post(self):

        # Parse args
        new_user = filterPairsWithNone(self.registerParser.parse_args())

        # Ensure that email is unique
        if (crud.read(User, email=new_user["email"])) is not None:
            return {"message": "there is already a user with this email"}, 400

        # Ensure that role is supported
        if new_user["role"] not in supported_roles:
            return {"message": "Not a supported role"}, 400

        # Encrypt pass
        new_user["password"] = flask_bcrypt.generate_password_hash(new_user["password"])
        listOfVhts = new_user.pop("supervises", None)

        # Create the new user
        userModel = marshal.unmarshal(User, new_user)
        crud.create(userModel)

        # Viewing the results of the creation
        createdUser = marshal.marshal(crud.read(User, email=new_user["email"]))
        createdUser.pop("password")
        createdUserId = createdUser.get("id")

        #Calling the id, userId for uniformity in the response
        createdUser["userId"] = createdUser["id"]
        createdUserId = createdUser.pop("id")

        # Updating the supervises table if necessary as well
        if new_user["role"] == "CHO" and listOfVhts is not None:
            crud.add_vht_to_supervise(createdUserId, listOfVhts)

        return createdUser, 200


# api/user/auth [POST]
class UserAuthApi(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument(
        "email", type=str, required=True, help="This field cannot be left blank!"
    )
    parser.add_argument(
        "password", type=str, required=True, help="This field cannot be left blank!"
    )

    # login to account
    @swag_from("../../specifications/user-auth.yml", methods=["POST"])
    def post(self):
        data = self.parser.parse_args()
        user = crud.read(User, email=data["email"])

        if user and flask_bcrypt.check_password_hash(user.password, data["password"]):
            del data["password"]

            # setup any extra user params
            data["role"] = user.role
            data["firstName"] = user.firstName
            data["healthFacilityName"] = user.healthFacilityName
            data["isLoggedIn"] = True
            data["userId"] = user.id

            vhtList = []
            data["supervises"] = []
            if data["role"] == RoleEnum.CHO.name:
                if user.vhtList:
                    for user in user.vhtList:
                        vhtList.append(user.id)
                    data["supervises"] = vhtList

            access_token = create_access_token(identity=data)
            refresh_token = create_refresh_token(identity=data)
            data["token"] = access_token
            data["refresh"] = refresh_token

            return data, 200
        else:
            return {"message": "Invalid email or password"}, 401


# api/user/auth/refresh_token
class UserAuthTokenRefreshApi(Resource):
    @jwt_refresh_token_required
    @swag_from("../../specifications/user-auth-refresh.yml", methods=["POST"])
    def post(self):
        current_user = get_jwt_identity()
        new_token = create_access_token(identity=current_user, fresh=False)
        return {"token": new_token}, 200


# /api/user/current
# Get identity of current user with jwt token
class UserTokenApi(Resource):
    @jwt_required
    @swag_from("../../specifications/user-current.yml", methods=["GET"])
    def get(self):
        tokenData = get_jwt_identity()
        userId = tokenData["userId"]

        return getDictionaryOfUserInfo(userId), 200


# api/user/<int:id> [GET, PUT, DELETE]
class UserApi(Resource):

    # edit user with id
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-put.yml", methods=["PUT"])
    def put(self, id):

        # Ensure we have id
        if not id:
            return {"message": "must provide an id"}, 400

        # Parse the arguments that we want
        new_user = filterPairsWithNone(UserParser.parse_args())

        # Ensure that id is valid
        if not doesUserExist(id):
            return {"message": "no user with this id"}, 400

        if new_user["role"] not in supported_roles:
            return {"message": "Not a supported role"}, 400

        # If cho add vht's to cho's list
        newVhtIds = new_user.get("supervises")
        if newVhtIds is not None and new_user["role"] == RoleEnum.CHO.name:
            crud.add_vht_to_supervise(id, new_user["supervises"])
            new_user.pop("supervises", None)

        # Update User
        crud.update(User, new_user, id=id)

        return getDictionaryOfUserInfo(id)

    @jwt_required
    @swag_from("../../specifications/user-get.yml", methods=["GET"])
    def get(self, id):

        # Ensure we have id
        if not id:
            return {"message": "must provide an id"}, 400

        # Ensure that id is valid
        if not doesUserExist(id):
            return {"message": "no user with this id"}, 400

        return getDictionaryOfUserInfo(id)

    @roles_required([RoleEnum.ADMIN])
    @swag_from("../../specifications/user-delete.yml", methods=["DELETE"])
    def delete(self, id):

        # Ensure we have id
        if not id:
            return {"message": "must provide an id"}, 400

        # Ensure that id is valid
        user = crud.read(User, id=id)
        if user is None:
            return {"message": "no user with this id"}, 400

        crud.delete(user)

        return {"message": "User deleted"}, 200
