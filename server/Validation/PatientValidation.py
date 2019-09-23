# This module provides functions to validate the request data for a Patient.


def patient_body_invalid(request_body):
    """Validates whether a request has all required values and constraints.

    :param request_body: JSON request body
    :return: The error for Flask to return, or None if no error is found
    """
    if request_body is None:
        return {'HTTP 400': 'The request body cannot be empty.'}, 400
    if request_body.get('personal-info') is None:
        return {'HTTP 400': 'The request body field personal-info is required.'}, 400

    return None
