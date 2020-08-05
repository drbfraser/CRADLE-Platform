from Validation.validate import required_keys_present, values_correct_type


def validate(request_body):
    """
    Returns an error code and message if the /api/assessments post request
    is not valid. Else, returns None.

    :param json: The request body as a dict object
    :return: An error message if request body in invalid in some way. None otherwise. 
    """
    error_message = None

    # Check if required keys are present
    required_keys = [
        "readingId",
        "followupNeeded",
        "dateAssessed",
        "healthcareWorkerId",
    ]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # If patient has followupNeeded set to True, make sure followupInstructions is filled in
    if request_body.get("followupNeeded") == True:
        error_message = required_keys_present(request_body, ["followupInstructions"])
    if error_message is not None:
        return error_message

    # Check that certain fields are of type string
    error_message = values_correct_type(request_body, ["readindId"], str)
    if error_message is not None:
        return error_message

    # Check that certain fields are of type int
    error_message = values_correct_type(request_body, ["dateAssessed"], int)
    if error_message is not None:
        return error_message

    return error_message
