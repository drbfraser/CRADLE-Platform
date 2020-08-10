from Validation.validate import required_keys_present, values_correct_type


def validate(request_body):
    """
    Returns an error code and message if the /api/facilities post request
    is not valid. Else, returns None.

    :param json: The request body as a dict object
    :return: An error message if request body in invalid in some way. None otherwise. 
    """
    error_message = None

    # Check if required keys are present
    required_keys = ["healthFacilityName"]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # Check that certain fields are of type string
    error_message = values_correct_type(request_body, ["healthFacilityName"], str)
    if error_message is not None:
        return error_message

    return error_message
