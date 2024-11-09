import logging
import os

import boto3
from dotenv import load_dotenv
from flask import Request, request

import config
from authentication.CognitoClientWrapper import CognitoClientWrapper

logger = logging.getLogger(__name__)

load_dotenv()
# Load aws secrets as environment variables.
load_dotenv(dotenv_path="/run/secrets/.aws.secrets.env")

AWS_REGION = os.environ["AWS_REGION"]
COGNITO_USER_POOL_ID = os.environ["COGNITO_USER_POOL_ID"]
COGNITO_APP_CLIENT_ID = os.environ["COGNITO_APP_CLIENT_ID"]
COGNITO_CLIENT_SECRET = os.environ["COGNITO_CLIENT_SECRET"]

AWS_ACCESS_KEY_ID = os.environ["AWS_ACCESS_KEY_ID"]
AWS_SECRET_ACCESS_KEY = os.environ["AWS_SECRET_ACCESS_KEY"]

cognito = CognitoClientWrapper(
    cognito_idp_client=boto3.client(
        service_name="cognito-idp",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    ),
    user_pool_id=COGNITO_USER_POOL_ID,
    client_id=COGNITO_APP_CLIENT_ID,
    client_secret=COGNITO_CLIENT_SECRET,
)

app = config.app


def is_public_endpoint(request: Request):
    if request.endpoint is None:
        return False

    if request.endpoint.startswith("flasgger.") or request.endpoint in {
        "userauthapi",
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
    if not is_public_endpoint(request):
        cognito.verify_access_token()
