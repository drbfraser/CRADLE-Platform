from flask import request, jsonify
from flask_restful import Resource, abort
from models import validate_user, User, UserSchema, Role
from config import db, flask_bcrypt
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                    jwt_required, jwt_refresh_token_required, get_jwt_identity)

# user/register [POST]
class UserApi(Resource):

    # Create a new user
    def post(self):
        # register user endpoint
        data = validate_user(request.get_json())
        if data['ok']:
            data = data['data']
            data['password_hash'] = flask_bcrypt.generate_password_hash(data['password_hash'])
            
            # Add a new patient to db
            # TODO: properly handle role for user, currently default to 'HCW'
            user_schema = UserSchema()
            role_hcw = Role.query.filter_by(name='HCW').first()

            new_user = user_schema.load(data, session=db.session)
            role_hcw.users.append(new_user) # add new user to 'HCW' role

            db.session.add(role_hcw)
            db.session.commit()

            return {'message': 'User created successfully!'}, 200
        else:
            return {'message': 'Bad request parameters: {}'.format(data['message'])}, 400


# user/auth [POST]
class UserAuthApi(Resource):

    # login to account
    def post(self):
        data = validate_user(request.get_json())
        if data['ok']:
            data = data['data']

            user = User.query.filter_by(email=data['email']).first()
            user_data = data
            if user and flask_bcrypt.check_password_hash(user.password_hash, data['password_hash']):
                access_token = create_access_token(identity=data)
                refresh_token = create_refresh_token(identity=data)
                user_data['token'] = access_token
                user_data['refresh'] = refresh_token
                return {'data': user_data}, 200
            else:
                return {'message': 'invalid username or password'}, 401
        else:
            return {'message': 'Bad request parameters: {}'.format(data['message'])}, 400
