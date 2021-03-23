"""
The ``api.util`` module contains utility functions to help extract useful information
from requests.
"""

import flask_jwt_extended as jwt
from flask import Request

import data.crud as crud
import data.marshal as marshal
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


def query_param_limit(request: Request, name: str) -> int:
    """
    Returns Integer if the request URL contains a limit query parameter.

    :param request: A request
    :param name: The name of the parameter to check for
    :return: 10 if the value for the parameter is not specified, otherwise given value.
    """
    return request.args.get(name, 10, type=int)


def query_param_page(request: Request, name: str) -> int:
    """
    Returns Integer if the request URL contains a page query parameter.

    :param request: A request
    :param name: The name of the parameter to check for
    :return: 1 if the value for the parameter is not specified, otherwise given value.

    """
    return request.args.get(name, 1, type=int)


def query_param_sortBy(request: Request, name: str) -> str:
    """
    Returns String if the request URL contains a page sortBy parameter.

    :param request: A request
    :param name: The name of the parameter to check for
    :return: patientName if the value for the parameter is not specified, otherwise given column name.

    """
    return request.args.get(name, "patientName", type=str)


def query_param_sortDir(request: Request, name: str) -> str:
    """
    Returns String if the request URL contains a page sortDir parameter.

    :param request: A request
    :param name: The name of the parameter to check for
    :return: asc if the value for the parameter is not specified, otherwise given column name.

    """
    return request.args.get(name, "asc", type=str)


def query_param_search(request: Request, name: str) -> str:
    """
    Returns String if the request URL contains a page sortDir parameter.

    :param request: A request
    :param name: The name of the parameter to check for
    :return: empty string if the value for the parameter is not specified, otherwise given column name.

    """
    return request.args.get(name, "", type=str)


def current_user() -> User:
    """
    Returns the the model for the user making the request.

    :return:
    """
    identity = jwt.get_jwt_identity()
    return crud.read(User, id=identity["userId"])


def isGoodPassword(password: str) -> bool:
    """
    Returns a Boolean indicating if the password inputted meets the desired characteristics or not

    :param password: The password string to evaluate
    """
    # To-Do: if anything requirments are necessary for a good password (having a number or special character
    # etc, these should be added here as well)

    passlength = False

    if len(password) >= 8:
        passlength = True

    return passlength


def filterPairsWithNone(payload: dict) -> dict:
    """
    Returns  dict with all the key-value pairs wherein the value is not None

    :param payload: The dictionary to evaluate
    """

    updated_data = {}
    for k, v in payload.items():
        if payload[k] is not None:
            updated_data[k] = v

    return updated_data


def getDictionaryOfUserInfo(id: int) -> dict:

    """
    Takes in an id and returns all of the information about a user from the users table
    and from the supervises table

    :param id: The user's id
    """

    user = crud.read(User, id=id)
    userDict = marshal.marshal(user)

    # The vhtlist has to be marshalled manually
    vhtList = []
    for user in user.vhtList:
        vhtList.append(user.id)
    userDict["supervises"] = vhtList

    userDict.pop("password")

    #Just for uniformity in the names of the keys
    userDict["userId"] = userDict["id"]
    userDict.pop("id")

    return userDict


def doesUserExist(id: int) -> bool:
    """
    Takes in id of the user and does a read to see if this user exists or not.
    :param id: The user's id

    """

    user = crud.read(User, id=id)
    if user is None:
        return False
    else:
        return True
