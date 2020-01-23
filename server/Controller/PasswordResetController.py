import logging, json
import datetime
import yagmail
import os
import smtplib
from email.message import EmailMessage

from flask import request, jsonify
from flask_restful import Resource, abort
from flask import Flask, flash, render_template, request, redirect, jsonify, url_for, session
from models import validate_user, User, UserSchema, Role
from config import db, flask_bcrypt
from datetime import timedelta
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity, decode_token)
from Manager.UserManager import UserManager
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer

userManager = UserManager()

EMAIL_ADDRESS = os.environ.get('EMAIL_USER')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD')


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
        url = request.host_url + 'reset/'
        try:
            # get email sent from client
            body = self._get_request_body()
            email = body.get('email')

            # TODO: query for user in database
            user = userManager.read("email", email)

            if user is None:
                abort(400, message=f'No user with email "{email}" exists.')

            expires = datetime.timedelta(hours=24)
            print(f'user with email "{email}" has requested for a password reset.')
            logging.debug(f'user with email "{email}" has requested for a password reset.')

            # create reset token
            reset_token = create_access_token(str(email), expires_delta=expires)

            # todo: send email
            msg = EmailMessage()
            msg['Subject'] = 'Password Reset Requested'
            msg['From'] = EMAIL_ADDRESS
            msg['To'] = EMAIL_ADDRESS
            msg.set_content(f'Dear User,\n\tTo reset your password follow this link: {reset_token} ' \
                   f'If this was not requested by you, please ignore this message. ' \
                   f'\n ' \
                   f'Cradle Support')

            return url+reset_token, 200
            with smtplib.SMTP_SSL('smtp.gmail.com', 456) as smtp:
                smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                smtp.sendmail(msg)

            logging.debug('Sent link to reset email')
            flash('If the email exists, you will be sent a link to reset your password', 'info')

        except Exception as e:
            # logging.debug('An error occurred' + e)
            # TODO: proper exception handling
            return None

# verify is generated token is valid
class ResetPassword(Resource):
    def post(self):
        url = request.host_url + 'reset/'
        try:

            # retrieve token and newly entered password
            body = request.get_json()
            reset_token = body.get('reset_token')
            password = body.get('password')

            if not reset_token or not password:

                # TODO: proper exception handling
                logging.debug('Token and password invalid')
                abort(404, message="Invalid token")

            # decode token
            user_email = decode_token(reset_token)['identity']

            # TODO: query user with id
            user_id = UserManager.search()

            # update password
            # TODO: update user password field
            userManager.update()

            # respond with password change success
            contents = [
                "Dear {}, \n\t your password has been reset. If this was you, "
            ]
            yagmail.SMTP('mmarty98@hotmail.com').send('kawaisim@hotmail.com', 'successfully reset', contents)
            flash('Your email has been changed.', 'info')

        except Exception as e:
            logging.debug('An error occured' + e)


        # except SchemaValidationError:
        #     raise SchemaValidationError
        # except ExpiredSignatureError:
        #     raise ExpiredTokenError
        # except (DecodeError, InvalidTokenError):
        #     raise BadTokenError
        logging.debug('An error occurred' + e)
        # TODO: proper exception handling
        return None
