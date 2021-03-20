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
from api.util import filterPairsWithNone

userManager = UserManager()
roleManager = RoleManager()


Userparser = reqparse.RequestParser()
Userparser.add_argument("email", type=str, required=True, help="This field cannot be left blank!")
Userparser.add_argument("firstName", type=str, required=True, help="This field cannot be left blank!")
Userparser.add_argument("healthFacilityName", type=str, required=True, help="This field cannot be left blank!")
Userparser.add_argument("role", type=str, required=True, help="This field cannot be left blank!")
Userparser.add_argument("supervises")


# user/all [POST]
class UserAll(Resource):

    # get all users
    @jwt_required
    @swag_from("../specifications/user-all.yml", methods=["GET"])
    def get(self):
        logging.debug("Received request: GET user/all")

        users = userManager.read_all_no_password()
        if users is None:
            abort(404, message="No users currently exist.")
        return users


# user/vhts [GET]
class UserAllVHT(Resource):

    # get all VHT Ids
    @jwt_required
    @swag_from("../specifications/user-vhts.yml", methods=["GET"])
    def get(self):
        logging.debug("Received request: GET user/vhts")

        vhtId_list = userManager.read_all_vhts()
        if vhtId_list is None:
            return []
        return vhtId_list


# To do: See if we can use the serializer here instead of a parser
# api/admin/change_pass [POST]
class AdminPasswordChange(Resource):

    # Ensure that we have the fields we want in JSON payload
    parser = reqparse.RequestParser()
    parser.add_argument(
        "password", type=str, required=True, help="This field cannot be left blank!"
    )
    parser.add_argument(
        "id", type=int, required=True, help="This field cannot be left blank!"
    )

    @roles_required([RoleEnum.ADMIN])
    @swag_from("../specifications/admin-change-pass.yml", methods=["POST"])
    def post(self):

        data = self.parser.parse_args()

        # check if user exists
        user = User.query.filter_by(id=data["id"]).first()
        if user is None:
            return {"message": "There is no user with this id"}, 400

        # check if password given is suitable
        if not isGoodPassword(data["password"]):
            return {
                "message": "The new password must be at least 8 characters long"
            }, 400

        data["password"] = flask_bcrypt.generate_password_hash(data["password"])

        # Update password
        update_res = userManager.update("id", data["id"], data)
        update_res.pop("password")

        return update_res, 200


# /api/user/change_pass [POST]
class UserPasswordChange(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument(
        "old_password", type=str, required=True, help="This field cannot be left blank!"
    )
    parser.add_argument(
        "new_password", type=str, required=True, help="This field cannot be left blank!"
    )

    @jwt_required
    @swag_from("../specifications/user-change-pass.yml", methods=["POST"])
    def post(self):
        data = self.parser.parse_args()

        # check if password given is suitable
        if not isGoodPassword(data["new_password"]):
            return {
                "message": "The new password must be at least 8 characters long"
            }, 400

        identity = get_jwt_identity()

        # Get all information about the user who is using this endpoint
        user = User.query.filter_by(id=identity["userId"]).first()

        # If old password and password we have on file match
        if user and flask_bcrypt.check_password_hash(
            user.password, data["old_password"]
        ):
            # Create new dictionary with just keys we want to replace
            updated_payload = {
                "password": flask_bcrypt.generate_password_hash(data["new_password"])
            }

            # Perform update
            update_response = userManager.update(
                "id", identity["userId"], updated_payload
            )

            update_response.pop("password")

            return update_response, 200
        else:
            return {"error": "old_password incorrect"}, 400


# user/register [POST]
class UserRegisterApi(Resource):

    registerParser = Userparser.copy()
    registerParser.add_argument("password", type=str, required=True, help="This field cannot be left blank!")

    # Create a new user
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../specifications/user-register.yml", methods=["POST"])
    def post(self):

        new_user = filterPairsWithNone(self.registerParser.parse_args())

        # Ensure that email is unique
        if(crud.read(User, email=new_user['email'])) is not None:
            return {'message' : 'there is already a user with this email'}, 400

        new_user["password"] = flask_bcrypt.generate_password_hash(new_user["password"])

        userModel = marshal.unmarshal(User, new_user)

        crud.create(userModel)

        createdUser = marshal.marshal(crud.read(User, email=new_user['email']))
        createdUser.pop('password')

        return createdUser, 200


        # # register user endpoint
        # data = validate_user(request.get_json())

        # if data["ok"]:
        #     data = data["data"]

        #     # check if user exists
        #     user = User.query.filter_by(email=data["email"]).first()
        #     if user:
        #         return {"message": "Email has already been taken"}, 400

        #     # get password
        #     data["password"] = flask_bcrypt.generate_password_hash(data["password"])

        #     # find the role of the user
        #     role = Role.query.filter_by(name=data["role"]).first()
        #     if (
        #         role
        #         and data["role"] == "ADMIN"
        #         and data["healthFacilityName"] == "Null"
        #     ):
        #         data["healthFacilityName"] = None
        #     del data["role"]

        #     # Add a new user to db
        #     user_schema = UserSchema()
        #     new_user = user_schema.load(data, session=db.session)

        #     role.users.append(new_user)  # add new user to their role

        #     db.session.add(role)  # add user and role
        #     db.session.commit()

        #     return new_user.id, 201
        # else:
        #     return {"message": "Please check the fields"}, 400


# user/auth [POST]
class UserAuthApi(Resource):

    # login to account
    @swag_from("../specifications/user-auth.yml", methods=["POST"])
    def post(self):
        data = validate_user(request.get_json())
        if data["ok"]:
            data = data["data"]

            user = User.query.filter_by(email=data["email"]).first()

            if user and flask_bcrypt.check_password_hash(
                user.password, data["password"]
            ):
                del data["password"]

                # setup any extra user params
                roles = []
                if user.roleIds:
                    for role in user.roleIds:
                        roles.append(role.name.name)

                data["roles"] = roles
                data["firstName"] = user.firstName
                data["healthFacilityName"] = user.healthFacilityName
                data["isLoggedIn"] = True
                data["userId"] = user.id

                vhtList = []
                data["vhtList"] = []
                if "CHO" in roles:
                    if user.vhtList:
                        for user in user.vhtList:
                            vhtList.append(user.id)
                        data["vhtList"] = vhtList

                access_token = create_access_token(identity=data)
                refresh_token = create_refresh_token(identity=data)
                data["token"] = access_token
                data["refresh"] = refresh_token

                return data, 200
            else:
                return {"message": "Invalid email or password"}, 401
        else:
            return (
                {"message": "Bad request parameters"},
                400,
            )


# user/auth/refresh_token
class UserAuthTokenRefreshApi(Resource):
    @jwt_refresh_token_required
    @swag_from("../specifications/user-auth-refresh.yml", methods=["POST"])
    def post(self):
        current_user = get_jwt_identity()
        new_token = create_access_token(identity=current_user, fresh=False)
        return {"token": new_token}, 200


# user/current
# Get identity of current user with jwt token
class UserTokenApi(Resource):
    @jwt_required
    @swag_from("../specifications/user-current.yml", methods=["GET"])
    def get(self):
        current_user = get_jwt_identity()
        return current_user, 200


# What I will recieve in payload + the id from the path
# {
#   email: string;
#   firstName: string;
#   healthFacilityName: string;
#   role: string; (enum)
#   supervises: number[];
# }


# This put request is what needs to be rewritten 
# user/edit/<int:id> [PUT]
class UserApi(Resource):

    # edit user with id
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../specifications/user-edit.yml", methods=["PUT"])
    def put(self, id):

        # Ensure we have id
        if not id:
            abort(400, message="User ID is required")

        #Parse the arguments that we want
        new_user = filterPairsWithNone(Userparser.parse_args()) 

        # Ensure that id is valid
        if(crud.read(User, id=id)) is None:
            return {'message' : 'no user with this id'}, 400

        # If supervises field is given add vht's to cho's list
        newVhtIds = new_user.get("supervises")
        if newVhtIds is not None:
            crud.add_vht_to_supervise(id, new_user["supervises"])
            new_user.pop("supervises", None)

        # Update User
        crud.update(User, new_user,id=id)
    

        userDict = marshal.marshal(
            crud.read(User, id=id)
        )

        userDict.pop('password')

        return userDict


# user/delete/<int:id>
class UserDelete(Resource):
    @roles_required([RoleEnum.ADMIN])
    @swag_from("../specifications/user-delete.yml", methods=["DELETE"])
    def delete(self, id=None):
        current_user = get_jwt_identity()
        if "ADMIN" in current_user["roles"]:
            if id:
                logging.debug("Received request: DELETE /user/delete/<id>")
                del_res = userManager.delete("id", id)
                if not del_res:
                    abort(400, message=f'No user exists with id "{id}"')
            else:
                abort(400, message="No id supplied for user delete")
        else:
            abort(400, message="Only Admins can delete users")
        return {}
