import logging, json
import datetime
import yagmail
from flask import request, jsonify
from flask_restful import Resource, abort
from flask import Flask, flash, render_template, request, redirect, jsonify, url_for, session
from models import validate_user, User, UserSchema, Role
from config import db, flask_bcrypt
from datetime import timedelta
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)
from Manager.UserManager import UserManager
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer

userManager = UserManager()


# /auth/password_reset
class ForgotPassword(Resource):
    @staticmethod
    def _get_request_body():
        raw_req_body = request.get_json(force=True)
        print('Request body: ' + json.dumps(raw_req_body, indent=2, sort_keys=True))
        return raw_req_body

    # generate temporary password reset token
    # todo: extract 'SECRET_KEY' and use better secret key?
    def post(self):
        logging.debug("Receive requestion: POST /forgot")
        expires = datetime.timedelta(hours=24)
        url = request.host_url + 'reset/'
        args = request.args.get('email')
        print("args:____________ " + json.dumps(args, indent=2, sort_keys=True))
        try:
            # get email sent from client
            body = self._get_request_body()
            email = body.get('email')

            # is error handling handled on the front-end?
            user = UserManager.search(args)

            # create reset token
            reset_token = create_access_token(str(user.id), expires_delta=expires)

            # todo: send email
            contents = [
                "Dear User,\n\tTo reset your password follow this link: {}".format(reset_token)
            ]
            logging.debug('Sent link to reset email')
            yagmail.SMTP('mmarty98@hotmail.com').send('kawaisim@hotmail.com', 'test', contents)
            flash('If the email exists, you will be sent a link to reset your password', 'warning')
            return redirect(url('auth'))
        except Exception as e:
            logging.debug('An error occurred' + e)
            # TODO: proper exception handling
            return None

    # def verify_reset_token(self, token):
    #     s = Serializer(app.config['SECRET_KEY'])
    #     try:
    #         user_id = s.loads(token)['user_id']
    #     except:
    #         return None
    #     # user = User.query.filter_by(email=data['email']).first()
    #     return userManager.search(user_id)  # ???, search for the ID corresponding to the email


#
# class ForgotPassword(Resource):
#     def post(self):
#         url = request.host_url + 'reset/'
#         try:
#             body = request.get_json()
#             email = body.get('email')
#             if not email:
#                 raise SchemaValidationError
#
#             user = User.objects.get(email=email)
#             if not user:
#                 raise EmailDoesnotExistsError
#
#             expires = datetime.timedelta(hours=24)
#             reset_token = create_access_token(str(user.id), expires_delta=expires)
#
#             return send_email('[Cradle System] Reset Your Password',
#                               sender='support@cradle.com', # change
#                               recipients=[user.email],
#                               text_body=render_template('email/reset_password.txt',
#                                                         url=url + reset_token),
#                               html_body=render_template('email/reset_password.html',
#                                                         url=url + reset_token))
#         except SchemaValidationError:
#             raise SchemaValidationError
#         except EmailDoesnotExistsError:
#             raise EmailDoesnotExistsError
#         except Exception as e:
#             raise InternalServerError

# verify is generated token is valid
# class ResetPassword(Resource):
#     def post(self):
#         url = request.host_url + 'reset/'
#         try:
#             body = request.get_json()
#             reset_token = body.get('reset_token')
#             password = body.get('password')
#
#             if not reset_token or not password:
#                 logging.debug('Token and password invalid')
#                 abort(404, message="Invalid token")
#
#             # decode token
#             user_id = decode_token(reset_token)['identity']
#
#             # query user id
#             user = User.objects.get(id=user_id)
#
#             # update password
#             user.modify(password=password)
#             user.hash_password()
#             user.save()
#
#             # respond with password change success
#             return send_email('[Movie-bag] Password reset successful',
#                               sender='support@movie-bag.com',
#                               recipients=[user.email],
#                               text_body='Password reset was successful',
#                               html_body='<p>Password reset was successful</p>')
#
#         # except SchemaValidationError:
#         #     raise SchemaValidationError
#         # except ExpiredSignatureError:
#         #     raise ExpiredTokenError
#         # except (DecodeError, InvalidTokenError):
#         #     raise BadTokenError
#         logging.debug('An error occurred' + e)
#         # TODO: proper exception handling
#         return None
