"""
The ``api.parse`` module contains utility functions to help extract useful information
from URL parameters.
"""

from flask import Request


def is_simplified_request(request: Request) -> bool:
    """
    Returns true if the URL contains a boolean "simplified" query parameter and that
    parameter is set to true.

    :param request: A request
    :return: True if the request contains a "simplified" query parameter
    """
    return request.args.get("simplified", "false", type=str) == "true"
