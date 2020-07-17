"""
The ``api.util`` module contains utility functions to help extract useful information
from requests.
"""

import flask_jwt_extended as jwt
from flask import Request

import data.crud as crud
from models import User


def is_simplified_request(request: Request) -> bool:
    """
    Returns true if the URL contains a boolean "simplified" query parameter and that
    parameter is set to true.

    :param request: A request
    :return: True if the request contains a "simplified" query parameter
    """
    return request.args.get("simplified", "false", type=str) == "true"


def current_user() -> User:
    """
    Returns the the model for the user making the request.

    :return:
    """
    identity = jwt.current_user()
    return crud.read(User, id=identity["userId"])
