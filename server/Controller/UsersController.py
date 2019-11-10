import logging
from flask import request, jsonify
from flask_restful import Resource, abort
from models import validate_user, User, UserSchema, Role
from config import db, flask_bcrypt
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                    jwt_required, jwt_refresh_token_required, get_jwt_identity)
from Manager.UserManager import UserManager


userManager = UserManager()

# user/all [POST]
class UserAll(Resource):
    
    # get all users
    def get(self):
        logging.debug('Received request: GET user/all')

        users = userManager.read_all_no_password()
        if users is None:
            abort(404, message="No users currently exist.")
        print(users)
        return users


# user/register [POST]
class UserApi(Resource):

    # Create a new user
    def post(self):
        # register user endpoint
        data = validate_user(request.get_json())
        if data['ok']:
            data = data['data']

            # check if user exists
            user = User.query.filter_by(email=data['email']).first()
            if user:
                return { "message" : "Email has already been taken"}, 400

            # get password
            data['password'] = flask_bcrypt.generate_password_hash(data['password'])

            # find the role of the user
            role = Role.query.filter_by(name=data['role']).first()
            del data['role']
            
            # Add a new patient to db
            user_schema = UserSchema()
            new_user = user_schema.load(data, session=db.session)

            role.users.append(new_user) # add new user to their role

            db.session.add(role) # add user and role
            db.session.commit()

            return {}, 200
        else:
            return {'message': 'Please check the fields'}, 400


# user/auth [POST]
class UserAuthApi(Resource):

    # login to account
    def post(self):
        data = validate_user(request.get_json())
        if data['ok']:
            data = data['data']

            user = User.query.filter_by(email=data['email']).first()
            if user and flask_bcrypt.check_password_hash(user.password, data['password']):
                del data['password']

                # setup any extra user params
                data['role'] = user.roleIds[0].name.name # get first role of user
                data['firstName'] = user.firstName
                data['isLoggedIn'] = True

                access_token = create_access_token(identity=data)
                refresh_token = create_refresh_token(identity=data)
                data['token'] = access_token
                data['refresh'] = refresh_token

                return data, 200
            else:
                return {'message': 'Invalid email or password'}, 401
        else:
            return {'message': 'Bad request parameters: {}'.format(data['message'])}, 400

# Get identity of current user with jwt token
class UserTokenApi(Resource):
    @jwt_required
    def get(self):
        current_user = get_jwt_identity()
        return current_user, 200
