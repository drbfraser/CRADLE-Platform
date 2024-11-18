from flask import request
from humps import decamelize


def get_request_body():
    """
    Gets the body of the request as a python object and
    recursively converts the keys to be in snake case.

    Use this function in place of `request.get_json()`.
    """
    return decamelize(request.get_json(force=True))


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
        "vital_signs": list(filter(None, request_args.get("vital_signs", []))),
        "referrers": list(filter(None, request_args.get("referrer", []))),
        "health_facilities": list(
            filter(None, request_args.get("health_facility", []))
        ),
    }

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
