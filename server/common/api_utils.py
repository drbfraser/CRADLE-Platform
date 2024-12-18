import json
import re

from flask import request
from humps import decamelize

from common import user_utils
from config import app


def get_request_body():
    """
    Gets the body of the request as a python object and
    recursively converts the keys to be in snake case.

    Use this function in place of `request.get_json()`.
    """
    request_body = request.get_json(force=True, silent=True)
    if request_body is None:
        return {}
    return decamelize(request_body)


def get_query_params() -> dict:
    """
    Extracts URL search params contained in the request
    and converts the keys to snake case.

    :param request: Flask request object
    :return: URL search params converted to snake case,
      stored in a dictionary
    """
    request_args: dict = decamelize(request.args)

    params = {
        "search_text": request_args.get("search"),
        "order_by": request_args.get("sort_by"),
        "direction": request_args.get("sort_dir"),
        "limit": request_args.get("limit"),
        "page": request_args.get("page"),
        "date_range": request_args.get("date_range"),
        "readings": request_args.get("readings"),
        "referrals": request_args.get("referrals"),
        "assessments": request_args.get("assessments"),
        "forms": request_args.get("forms"),
        "lang": request_args.get("lang"),
        "is_assessed": request_args.get("is_assessed"),
        "is_pregnant": request_args.get("is_pregnant"),
        "include_archived": request_args.get("include_archived"),
        "vital_signs": list(
            filter(None, decamelize(request.args.getlist("vital_signs")))
        ),
        "referrers": list(filter(None, decamelize(request.args.getlist("referrer")))),
        "health_facilities": list(
            filter(None, decamelize(request.args.getlist("health_facility")))
        ),
    }

    # If not None, order_by will be assigned a field name, so it too must
    # me converted to snake case.
    order_by = params.get("order_by")
    if order_by is not None:
        params["order_by"] = decamelize(order_by)

    return {k: v for k, v in params.items() if v and k is not None}


def get_query_param_bool(name: str) -> bool:
    """
    Returns true if the request URL contains a boolean query parameter with a given
    ``name`` who's value is "true".

    :param request: A request
    :param name: The name of the parameter to check for
    :return: True if the value for the parameter is "true", otherwise False.
    """
    request_args: dict = decamelize(request.args)
    return request_args.get(name, "false") == "true"


@app.after_request
def log_request_details(response):
    """
    middleware function for logging changes made by users
    """
    try:
        try:
            requestor_data = user_utils.get_current_user_from_jwt()
        except Exception:
            requestor_data = {}

        if len(request.data) == 0:
            req_data = request.args.to_dict()
        else:
            req_data = json.loads(request.data.decode("utf-8"))

        request_data = {}
        for key in req_data:
            if "password" in key.lower():
                continue
            request_data[key] = req_data[key]

        if response.status_code == 200:
            status_str = "Successful"
        else:
            status_str = "Unsuccessful"

        extra = {
            "Response Status": f"{response.status_code} ({status_str})",
            "Request Information": request_data,
            "Requestor Information": requestor_data,
        }

        message = f"Accessing Endpoint: {re.search(r'/api/.*', request.url).group(0)} Request Method: {request.method}"
        app.logger.info(message, extra=extra)
    except Exception as err:
        app.logger.info(
            "An unexpected error occurred while logging request and response data",
        )
        app.logger.error(err)
    return response
