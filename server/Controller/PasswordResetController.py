import smtplib
from environs import Env
from itsdangerous import URLSafeTimedSerializer
import logging, json
from flask import request
from flask_restful import Resource, abort
from Manager.UserManager import UserManager
from config import flask_bcrypt
from validation.errors import (
    InternalServerError,
    EmailDoesnotExistsError,
    BadTokenError,
)
from jwt.exceptions import DecodeError, InvalidTokenError

userManager = UserManager()
env = Env()
env.read_env()

SENDER_EMAIL_ADDRESS = env("EMAIL_USER")
SENDER_EMAIL_PASSWORD = env("EMAIL_PASSWORD")
serializer = URLSafeTimedSerializer("change this secret key!")  # TODO: export key


def _get_request_body():
    raw_req_body = request.get_json(force=True)
    print("Request body: " + json.dumps(raw_req_body, indent=2, sort_keys=True))
    return raw_req_body


def send_email(receiver, msg):
    if receiver is None:
        abort(400, message="receiver email is non-existent")
    smtp = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    smtp.login(SENDER_EMAIL_ADDRESS, SENDER_EMAIL_PASSWORD)
    smtp.sendmail(SENDER_EMAIL_ADDRESS, receiver, msg)
    smtp.close()


# /api/forgot
class ForgotPassword(Resource):
    def post(self):
        logging.debug("Receive request: POST /forgot")
        url = request.host_url + "api/reset/"
        logging.debug("Sent link to reset email")

        try:
            # get email sent from client
            body = _get_request_body()
            user_email = body.get("email")

            # query for user in database
            user = userManager.read("email", user_email)
            if user is None:
                abort(400, message=f'No user with email "{user_email}" exists.')
            logging.debug(
                f'user with email "{user_email}" has requested for a password reset.'
            )

            # create reset token
            reset_token = serializer.dumps(user_email)

            # send email
            header = (
                "To:"
                + user_email
                + "\n"
                + "From: "
                + SENDER_EMAIL_ADDRESS
                + "\n"
                + "Subject: Password Reset Requested \n"
            )
            content = (
                f"Dear User,\n\nTo reset your password follow this link:\n\n{url + reset_token} \n(expires in 1 hour)\n\n"
                f"If this was not requested by you, please ignore this message.\n\n\nCradle Support"
            )
            msg = header + content
            send_email(user_email, msg)

            return url + reset_token, 200

        except EmailDoesnotExistsError:
            raise EmailDoesnotExistsError
        except Exception as e:
            raise InternalServerError


# /api/reset/<string:reset_token>
class ResetPassword(Resource):
    def put(self, reset_token):
        logging.debug("Receive Request: PUT /reset/<reset_token>")
        url = request.host_url
        try:
            user_email = serializer.loads(reset_token, max_age=60)
            if user_email is None:
                abort(400, message="reset_token not valid")

            body = _get_request_body()
            curr_user = userManager.read("email", user_email)
            if curr_user is None:
                abort(400, message="there is no user with that email")

            body["password"] = flask_bcrypt.generate_password_hash(
                body["password"]
            ).decode("utf-8")
            update_res = userManager.update("email", user_email, body)
            if not update_res:
                abort(400, message=f'"{user_email}" does not exist')

            # respond with password change success
            header = (
                "To:"
                + user_email
                + "\n"
                + "From: "
                + SENDER_EMAIL_ADDRESS
                + "\n"
                + "Subject: Password Change \n"
            )
            content = f"Dear User,\n\nYour password have been succsesfully changed.\n\n\nCradle Support"
            msg = header + content
            send_email(user_email, msg)
            return f"password changed for user with email address: {user_email}", 200

        except (DecodeError, InvalidTokenError):
            raise BadTokenError
        except Exception as e:
            raise InternalServerError
