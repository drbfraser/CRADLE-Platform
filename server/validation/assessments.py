from typing import Optional
from validation.validate import required_keys_present, values_correct_type


def validate(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/assessments post request
    is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "dateAssessed": 1551447833, - required
                            "diagnosis": "patient is fine",
                            "medicationPrescribed": "tylenol",
                            "specialInvestigations": "bcccccccccddeeeff",
                            "treatment": "b",
                            "followupNeeded": True, - required
                            "followupInstructions": "pls help, give lots of tylenol" - required if followupNeeded = True
                        }

    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error_message = None

    # Check if required keys are present
    required_keys = [
        "followupNeeded",
        "dateAssessed",
    ]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # If patient has followupNeeded set to True, make sure followupInstructions is filled in
    if request_body.get("followupNeeded") == True:
        error_message = required_keys_present(request_body, ["followupInstructions"])
    if error_message is not None:
        return error_message

    # Check that certain fields are of type int
    error_message = values_correct_type(request_body, ["dateAssessed"], int)
    if error_message is not None:
        return error_message

    return error_message
