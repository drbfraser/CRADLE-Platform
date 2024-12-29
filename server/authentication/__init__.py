import logging
import os

import boto3
from dotenv import load_dotenv
from flask import Request, Response, request
from werkzeug.exceptions import Unauthorized

import config
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
    }:
        return True

    whitelist: tuple[str, ...] = ("/openapi", "/apidocs")
    if request.path.startswith(whitelist):
        return True

    if request.endpoint is None:
        return False

    if request.endpoint.startswith("flasgger.") or request.endpoint in {
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


@app.before_request
def require_authorization():
    """
    Run authorization check for all urls by default
    """
    # Respond OK to pre-flight request.
    if request.method.upper() == "OPTIONS":
        return Response()

    if not is_public_endpoint(request):
        try:
            cognito.verify_access_token()
        except ValueError as err:
            raise Unauthorized(str(err))
