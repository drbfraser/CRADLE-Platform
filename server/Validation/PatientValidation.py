# This module provides functions to validate the request data for a Patient.

from Manager import PatientManager


def create_body_invalid(request_body):
    """Validates whether a request has all required values and constraints.

    :param request_body: JSON request body
    :return: The error for Flask to return, or None if no error is found
    """
    if request_body is None:
        return {'HTTP 400': 'The request body cannot be empty.'}, 400
    if request_body.get('personal-info') is None:
        return {'HTTP 400': 'The request body field personal-info is required.'}, 400

    return None


def update_info_invalid(patient_id, request_body):
    """Validates whether a request has all required values and constraints.

    :param patient_id: Unique Patient ID which must already exist
    :param request_body: JSON request body
    :return: The error for Flask to return, or None if no error is found
    """
    if request_body is None:
        return {'HTTP 400': 'The request body cannot be empty.'}, 400

    if PatientManager.get_patient(patient_id) is None:
        return {'HTTP 404': 'The given Patient ID was invalid.'}, 404

    has_required_field = \
        request_body.get('reading') or \
        request_body.get('referral') or \
        request_body.get('fillout')

    if not has_required_field:
        return {'HTTP 400': 'At least one of the request body fields \'reading\', \'referral\', and/or \'fillout\' '
                            'are required.'}, 400

    return None
