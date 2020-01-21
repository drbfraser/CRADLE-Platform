import logging, json
import logging, json
from flask import request, jsonify
from flask_restful import Resource, abort
from models import validate_user, User, UserSchema, Role
from config import db, flask_bcrypt
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                    jwt_required, jwt_refresh_token_required, get_jwt_identity)
from Manager.UserManager import UserManager
from Manager.RoleManager import RoleManager


userManager = UserManager()
roleManager = RoleManager()

# /password_reset
class PasswordReset(Resource):

    # generate temporary password reset token
    # todo: extract 'SECRET_KEY'
    def generate_token_reset(self, token, expire_sec=1800):
        s = Serializer(current_app.config['SECRET_KEY'], expire_sec)
        return s.dumps({'user_id': self.id}).decode('utf-8') 

    # verify is generated token is valid
    @staticmethod
    def verify_reset_token(self, token):
        s = Serializer(app.config['SECRET_KEY'])
        try:
            user_id = s.loads(token)['user_id']
        except:
            return None
        # user = User.query.filter_by(email=data['email']).first()
        return userManager.search(user_id) # ???, search for the ID corresponding to the email

# from flask import request, render_template
# from flask_jwt_extended import create_access_token, decode_token
# from database.models import User
# from flask_restful import Resource
# import datetime
# from resources.errors import SchemaValidationError, InternalServerError, \
#     EmailDoesnotExistsError, BadTokenError
# from jwt.exceptions import ExpiredSignatureError, DecodeError, \
#     InvalidTokenError


class ForgotPassword(Resource):
    def post(self):
        url = request.host_url + 'reset/'
        try:
            body = request.get_json()
            email = body.get('email')
            if not email:
                raise SchemaValidationError

            user = User.objects.get(email=email)
            if not user:
                raise EmailDoesnotExistsError

            expires = datetime.timedelta(hours=24)
            reset_token = create_access_token(str(user.id), expires_delta=expires)

            return send_email('[Cradle System] Reset Your Password',
                              sender='support@cradle.com', # change 
                              recipients=[user.email],
                              text_body=render_template('email/reset_password.txt',
                                                        url=url + reset_token),
                              html_body=render_template('email/reset_password.html',
                                                        url=url + reset_token))
        except SchemaValidationError:
            raise SchemaValidationError
        except EmailDoesnotExistsError:
            raise EmailDoesnotExistsError
        except Exception as e:
            raise InternalServerError


class ResetPassword(Resource):
    def post(self):
        url = request.host_url + 'reset/'
        try:
            body = request.get_json()
            reset_token = body.get('reset_token')
            password = body.get('password')

            if not reset_token or not password:
                raise SchemaValidationError

            user_id = decode_token(reset_token)['identity']

            user = User.objects.get(id=user_id)

            user.modify(password=password)
            user.hash_password()
            user.save()

            return send_email('[Movie-bag] Password reset successful',
                              sender='support@movie-bag.com',
                              recipients=[user.email],
                              text_body='Password reset was successful',
                              html_body='<p>Password reset was successful</p>')

        except SchemaValidationError:
            raise SchemaValidationError
        except ExpiredSignatureError:
            raise ExpiredTokenError
        except (DecodeError, InvalidTokenError):
            raise BadTokenError
        except Exception as e:
            raise InternalServerError