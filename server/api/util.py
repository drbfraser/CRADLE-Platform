"""
The ``api.util`` module contains utility functions to help extract useful information
from requests.
"""

import flask_jwt_extended as jwt
from flask import Request

import data.crud as crud
from models import User


def query_param_bool(request: Request, name: str) -> bool:
    """
    Returns true if the request URL contains a boolean query parameter with a given
    ``name`` who's value is "true".

    :param request: A request
    :param name: The name of the parameter to check for
    :return: True if the value for the parameter is "true", otherwise False.
    """
    return request.args.get(name, "false", type=str) == "true"


def current_user() -> User:
    """
    Returns the the model for the user making the request.

    :return:
    """
    identity = jwt.current_user()
    return crud.read(User, id=identity["userId"])
