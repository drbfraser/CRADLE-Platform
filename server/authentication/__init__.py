import logging
import os

import boto3
import jwt
from dotenv import load_dotenv
from flask import Request, Response, request
from werkzeug.exceptions import Unauthorized

import config
from authentication import sms_auth
from authentication.CognitoClientWrapper import CognitoClientWrapper

logger = logging.getLogger(__name__)

load_dotenv()
COGNITO_SECRETS_FILE = os.environ.get("COGNITO_SECRETS_FILE")
load_dotenv(COGNITO_SECRETS_FILE)
AWS_REGION = os.environ["AWS_REGION"]
COGNITO_USER_POOL_ID = os.environ["COGNITO_USER_POOL_ID"]
COGNITO_APP_CLIENT_ID = os.environ["COGNITO_APP_CLIENT_ID"]
COGNITO_CLIENT_SECRET = os.environ["COGNITO_CLIENT_SECRET"]

COGNITO_AWS_ACCESS_KEY_ID = os.environ["COGNITO_AWS_ACCESS_KEY_ID"]
COGNITO_AWS_SECRET_ACCESS_KEY = os.environ["COGNITO_AWS_SECRET_ACCESS_KEY"]

cognito = CognitoClientWrapper(
    cognito_idp_client=boto3.client(
        service_name="cognito-idp",
        region_name=AWS_REGION,
        aws_access_key_id=COGNITO_AWS_ACCESS_KEY_ID,
        aws_secret_access_key=COGNITO_AWS_SECRET_ACCESS_KEY,
    ),
    user_pool_id=COGNITO_USER_POOL_ID,
    client_id=COGNITO_APP_CLIENT_ID,
    client_secret=COGNITO_CLIENT_SECRET,
    aws_region=AWS_REGION,
)

app = config.app


def is_public_endpoint(request: Request):
    # Public route paths.
    if request.path in {
        "/api/user/auth",
        "/api/user/auth/refresh_token",
        "/api/version",
    }:
        return True

    whitelist: tuple[str, ...] = ("/openapi", "/apidocs")
    if request.path.startswith(whitelist):
        return True

    if request.endpoint is None:
        return False

    if request.endpoint in {
        "version",
        "static",
    }:
        return True

    endpoint_handler_func = app.view_functions[request.endpoint]
    is_public = getattr(endpoint_handler_func, "is_public_endpoint", False)
    logger.debug(
        "Check if route is public endpoint",
        extra={
            "endpoint": request.endpoint,
            "url": request.path,
            "is_public_endpoint": is_public,
        },
    )
    return is_public


def _get_access_token() -> str:
    """
    Gets the JWT access token from the authorization header.
    """
    # Get JWT access token.
    authorization = request.authorization
    if authorization is None:
        raise Unauthorized("No authorization header found.")
    access_token = authorization.token
    if access_token is None:
        raise Unauthorized("No access token found.")
    return access_token


def _decode_access_token() -> dict:
    """
    Checks the 'iss' claim of the access token and uses this claim to determine whether the token is a
    Cognito issued access token, or a token issued internally for authenticating requests relayed from the SMS relay
    endpoint. The appropriate function is then called to decode the token.

    Decoding the access token also verifies it in the process. If verification fails, an exception is thrown.
    """
    access_token = _get_access_token()
    payload: dict = jwt.decode(access_token, options={"verify_signature": False})
    issuer_claim = payload.get("iss")

    if issuer_claim is None:
        raise Unauthorized("No 'iss' claim found in access token.")

    try:
        if issuer_claim == sms_auth.CRADLE_SMS_ISSUER:
            payload = sms_auth.decode_sms_access_token(access_token)
        else:
            payload = cognito.decode_access_token(access_token)
    except ValueError as err:
        raise Unauthorized(str(err))
    return payload


def get_username_from_jwt() -> str:
    """
    Verifies access token in request authorization header and retrieves
    the user's username from the token.

    :return username: Username extracted from the JWT access token.
    """
    payload = _decode_access_token()
    username = payload.get("username")

    if username is None:
        raise Unauthorized("No 'username' found in access token.")

    return username


@app.before_request
def require_authorization():
    """
    Run authorization check for all urls by default.
    """
    # Respond OK to pre-flight request.
    if request.method.upper() == "OPTIONS":
        return Response()

    if is_public_endpoint(request):
        return None

    # Decoding the access token will also verify it. If verification fails, an exception will be thrown.
    _decode_access_token()
