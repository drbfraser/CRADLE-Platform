import logging, json
import datetime
import yagmail
import os
import smtplib
from email.message import EmailMessage
from environs import Env
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

env = Env()
env.read_env()

EMAIL_ADDRESS = env("EMAIL_USER")
EMAIL_PASSWORD = env("EMAIL_PASSWORD")


# /auth/password_reset
class ForgotPassword(Resource):
    @staticmethod
    def _get_request_body():
        raw_req_body = request.get_json(force=True)
        print('Request body: ' + json.dumps(raw_req_body, indent=2, sort_keys=True))
        return raw_req_body

    # generate temporary password reset token
    # TODO: support reset password with security questions (for those with no email)?
    # TODO: 2FA?
    def post(self):
        logging.debug("Receive request: POST /forgot")
        url = request.host_url + 'api/reset/'
        try:
            # get email sent from client
            body = self._get_request_body()
            email = body.get('email')

            # query for user in database
            user = userManager.read("email", email)

            if user is None:
                abort(400, message=f'No user with email "{email}" exists.')

            expires = datetime.timedelta(hours=1)
            print(f'user with email "{email}" has requested for a password reset.')
            logging.debug(f'user with email "{email}" has requested for a password reset.')

            # create reset token
            reset_token = create_access_token(str(email), expires_delta=expires)

            # send email
            header = 'To:' + EMAIL_ADDRESS + '\n' + 'From: ' + EMAIL_ADDRESS + '\n' + 'Subject: Password Reset Requested \n'
            content = f'Dear User,\n\nTo reset your password follow this link:\n\n{url + reset_token} \n(expires in 1 hour)\n\n'\
                      f'If this was not requested by you, please ignore this message.\n\n\nCradle Support'
            msg = header + content
            smtp = smtplib.SMTP_SSL('smtp.gmail.com', 465)
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.sendmail(EMAIL_ADDRESS, EMAIL_ADDRESS, msg)
            smtp.close()

            logging.debug('Sent link to reset email')
            return url + reset_token, 200

        except Exception as e:
            print(f"Error occurred: {e.with_traceback()}")
            # TODO: proper exception handling
            return None


# verify is generated token is valid
class ResetPassword(Resource):
    # def get(self):
    #     logging.debug('Receive Request: GET /reset')
    #     return 200

    def put(self, reset_token):
        # logging.debug('Receive Request: POST /reset')

        url = request.host_url
        print(f'======= + {url}')
        try:
            user_email = decode_token(reset_token)['identity']

            if reset_token is None or user_email is not:
                abort(400, message="reset_token not valid")

            # retrieve token and newly entered password
            body = request.get_json()
            reset_token = body.get('reset_token')
            password = body.get('new_password')

            # error handling handled by form
            if not reset_token:
                # TODO: proper exception handling
                logging.debug('Token invalid')
                abort(404, message="Invalid token")

            # decode token

            # TODO: query user with email
            curr_user = userManager.read({'email': user_email})

            # TODO: hash pw
            hash_password = flask_bcrypt.generate_password_hash(password)

            # update password
            # TODO: update user password field
            userManager.update("password", hash_password, curr_user)

            # TODO: respond with password change success
            return 200

        except Exception as e:
            # TODO: proper exception handling
            print(f"Error occurred: {e.with_traceback()}")
            return None
