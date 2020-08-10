from Validation.patients import validate as validate_patient
from Validation.readings import validate as validate_reading
from Validation.validate import required_keys_present, values_correct_type


def validate(request_body):
    """
    Returns an error code and message if the /api/referrals post request
    is not valid. Else, returns None.

    :param json: The request body as a dict object
    :return: An error message if request body in invalid in some way. None otherwise. 
    """
    error_message = None

    # Check if required keys are present
    required_keys = ["referralId"]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # Check that nested `patient` JSON is valid
    error_message = validate_patient(request_body.get("patient"))
    if error_message is not None:
        return error_message

    # Check that each element in the nested `readings` array is valid
    list_of_readings = request_body.get("readings")

    for reading_body in list_of_readings:
        # Validate the reading itself
        error_message = validate_patient(request_body.get(reading_body))
        if error_message is not None:
            return error_message

        referral_body = reading_body.get("referral")

        # Check if required keys are present
        # TODO: check if `referralHealthFacilityName` exists
        error_message = required_keys_present(
            referral_body,
            [
                "dateReferred",
                "readingId",
                "isAssessed",
                "patientId",
                "referralHealthFacilityName",
            ],
        )
        if error_message is not None:
            return error_message

        # Check that certain fields are of type int
        error_message = values_correct_type(request_body, ["dateReferred"], int)
        if error_message is not None:
            return error_message

        # Check that certain fields are of type string
        error_message = values_correct_type(request_body, ["readingId"], str)
        if error_message is not None:
            return error_message

    return error_message
