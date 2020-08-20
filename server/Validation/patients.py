from datetime import datetime, date
from typing import Any, Optional
from Validation.validate import required_keys_present, values_correct_type


def validate(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/patients post request
    is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "patientId": "123456", - required
                            "patientName": "testName", - required
                            "isPregnant": True, - required
                            "patientSex": "FEMALE", - required
                            "householdNumber": "20", 
                            "dob": "1990-05-30",
                            "zone": "15",
                            "villageNumber": "50",
                            "gestationalTimestamp": 1587068710, - required if isPregnant = True
                            "gestationalAgeUnit": "GESTATIONAL_AGE_UNITS_WEEKS", - required isPregnant = True
                            "drugHistory": "too much tylenol",
                            "medicalHistory": "not enough advil" 
                        }
    :return: An error message if request body in invalid in some way. None otherwise. 
    """
    error_message = None

    # Check if required keys are present
    required_keys = ["patientId", "patientName", "patientSex", "isPregnant"]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # Check that certain fields are of type bool
    error_message = values_correct_type(request_body, ["isPregnant"], bool)
    if error_message is not None:
        return error_message

    # If patient is pregnant, check  if certain pregnancy related fields are present
    if request_body.get("isPregnant") == True:
        error_message = required_keys_present(
            request_body, ["gestationalTimestamp", "gestationalAgeUnit"]
        )
    if error_message is not None:
        return error_message

    # Check if gestational age is less than or equal to 43 weeks/10 months
    if "gestationalTimestamp" in request_body:
        error_message = check_gestational_age_under_limit(
            int(request_body.get("gestationalTimestamp"))
        )
    if error_message is not None:
        return error_message

    # Check that certain fields are of type string
    error_message = values_correct_type(request_body, ["patientName"], str)
    if error_message is not None:
        return error_message

    # Check that certain fields are of type int
    error_message = values_correct_type(request_body, ["patientId"], int)
    if error_message is not None:
        return error_message

    # Check that patientId is not over the 14 digit limit.
    if len(str(request_body.get("patientId"))) > 14:
        return "patientId is too long. Max is 14 digits."

    # Make sure the dob is in YYYY-mm-dd format
    if "dob" in request_body and not is_correct_date_format(request_body.get("dob")):
        return "dob is not in the required YYYY-MM-DD format."

    return error_message


def validate_put_request(request_body: dict, patient_id) -> Optional[str]:
    """
    Returns an error message if the /api/patients/<string:patient_id>/info PUT
    request is not valid. Else, returns None.

    :param request_body: The request body as a dict object
    :param patient_id: The patient ID the PUT request is being made for

    :return: An error message if request body in invalid in some way. None otherwise. 
    """

    error_message = None

    # Check that each key in the request body is a patient field
    patient_keys = [
        "patientId",
        "patientName",
        "patientSex",
        "isPregnant",
        "householdNumber",
        "dob",
        "villageNumber",
        "gestationalTimestamp",
        "gestationalAgeUnit",
        "drugHistory",
        "medicalHistory",
        "zone",
        "lastEdited",
        "base",
    ]
    for key in request_body:
        if key not in patient_keys:
            return "The key " + key + " is not a valid field in patient"

    # Check that the patientId is not being edited
    if "patientId" in request_body and request_body.get("patientId") != patient_id:
        return "Patient ID cannot be changed."

    # Check that certain fields are of type bool
    if "isPregnant" in request_body:
        error_message = values_correct_type(request_body, ["isPregnant"], bool)
        if error_message is not None:
            return error_message

    # Check if gestational age is less than or equal to 43 weeks/10 months
    if (
        "gestationalTimestamp" in request_body
        and request_body.get("gestationalTimestamp") is not None
    ):
        error_message = check_gestational_age_under_limit(
            int(request_body.get("gestationalTimestamp"))
        )
    if error_message is not None:
        return error_message

    # Check that certain fields are of type string
    if "patientName" in request_body:
        error_message = values_correct_type(request_body, ["patientName"], str)
        if error_message is not None:
            return error_message

    # Make sure the dob is in YYYY-mm-dd format
    if "dob" in request_body and not is_correct_date_format(request_body.get("dob")):
        return "dob is not in the required YYYY-MM-DD format."

    return error_message


def check_gestational_age_under_limit(gestation_timestamp: int) -> Optional[str]:
    """
    Checks if a Unix timestamp is a valid gestational age.
    Is a valid gestational age if is from no more than 43 weeks/10 months ago

    :param gestation_timestamp: The Unix timestamp to validate 
    :return: Returns None if the timestamp is valid, a string message otherwise
    """
    if gestation_timestamp == 0:
        return None

    gestation_date = datetime.fromtimestamp(gestation_timestamp)
    today = date.today()
    num_of_weeks = (today - gestation_date.date()).days // 7
    if num_of_weeks > 43:
        return "Gestation is greater than 43 weeks/10 months."
    return None


def is_correct_date_format(s: Any) -> bool:
    """
    Checks if a value is in the YYYY-mm-dd format.

    :param s: The value to check 
    :return: Returns True if the passed in value is an integer, False otherwise
    """
    try:
        datetime.strptime(s, "%Y-%m-%d").strftime("%Y-%m-%d")
        return True
    except ValueError:
        return False
