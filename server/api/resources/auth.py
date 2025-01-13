import logging
import os

from botocore.exceptions import ClientError
from dotenv import load_dotenv
from flask import abort, make_response
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from pydantic import Field

import config
from authentication import cognito
from common import user_utils
from validation import CradleBaseModel
from validation.users import UserWithSmsKey

LOGGER = logging.getLogger(__name__)

load_dotenv()
LIMITER_DISABLED = os.getenv("LIMITER_DISABLED", "False").lower() == "true"

app = config.app
limiter = Limiter(
    get_remote_address,
    app=app,
    enabled=not LIMITER_DISABLED,
    default_limits=["50 per hour", "200 per day"],
    # parsed by flask limiter library https://flask-limiter.readthedocs.io/en/stable/
)

# /api/user/auth
api_auth = APIBlueprint(
    name="auth",
    import_name=__name__,
    url_prefix="/user/auth",
    abp_tags=[Tag(name="Auth", description="")],
    abp_security=None,
)


# We don't need to do any additional validation, as Cognito will validate the credentials for us.
class Credentials(CradleBaseModel, extra="forbid"):
    username: str = Field(description="Username or email of the User to authenticate.")
    password: str

    model_config = dict(
        openapi_extra={
            "description": "Credentials of the User to authenticate. The `username` field may be either a username or email.",
            "examples": {
                "example_01": {
                    "summary": "With username",
                    "value": {
                        "username": "admin",
                        "password": "cradle-admin",
                    },
                },
                "example_02": {
                    "summary": "With email",
                    "value": {
                        "username": "admin@email.com",
                        "password": "cradle-admin",
                    },
                },
            },
        }
    )


class AuthenticationResponse(CradleBaseModel):
    access_token: str
    user: UserWithSmsKey

    model_config = dict(
        openapi_extra={
            "description": "Authentication Success Response",
        }
    )


# /api/user/auth [POST]
@api_auth.post("")
@limiter.limit(
    "10 per minute, 20 per hour, 30 per day",
    error_message="Login attempt limit reached please try again later.",
    exempt_when=lambda: os.environ.get("LIMITER_DISABLED")
    == "True",  # disable limiter during testing stage
)
def authenticate(body: Credentials):
    """Authenticate"""
    # Attempt authentication with Cognito user pool.
    try:
        auth_result = cognito.start_sign_in(**body.model_dump())
    except ClientError as err:
        error = err.response.get("Error")
        LOGGER.error(error)
        return abort(401, description=error)
    except ValueError as err:
        error = str(err)
        LOGGER.error(error)
        return abort(401, description=error)
    # If no exception was raised, then authentication was successful.

    # Get user data from database.
    try:
        user_dict = user_utils.get_user_data_from_username(body.username)
    except ValueError as err:
        error = str(err)
        LOGGER.error(error)
        LOGGER.error(
            "ERROR: Something has gone wrong. User authentication succeeded but username (%s) is not found in database.",
            body.username,
        )
        return abort(500, description=error)

    # Don't include refresh token in body of response.
    refresh_token = auth_result["refresh_token"]
    del auth_result["refresh_token"]

    challenge = auth_result["challenge"]

    response_body = {
        "access_token": auth_result["access_token"],
        "user": user_dict,
        "challenge": None,
    }

    # Only include challenge in response if challenge_name is not None.
    if challenge["challenge_name"] is not None:
        response_body["challenge"] = challenge

    response = make_response(response_body, 200)
    # Store refresh token in HTTP-Only cookie.
    if refresh_token is not None:
        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
        )
    return response


class RefreshTokenApiBody(CradleBaseModel):
    username: str


# /api/user/auth/refresh_token [POST]
@api_auth.post("/refresh_token")
def refresh_access_token(body: RefreshTokenApiBody):
    """
    Refresh Access Token
    Refreshes expired Access token and returns a new Access Token.
    Refresh Token is taken from HTTP-Only cookie.
    """
    username = body.username
    try:
        new_access_token = cognito.refresh_access_token(username)
    except ValueError as err:
        error = str(err)
        LOGGER.error(error)
        return abort(401, description=error)
    return {"access_token": new_access_token}, 200
