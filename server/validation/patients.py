from datetime import date, datetime
from typing import Any, Optional

from validation.validate import required_keys_present, values_correct_type


def validate(request_body: dict) -> Optional[str]:
    """
    Returns an error message if the /api/patients post request
    is not valid. Else, returns None.

    :param request_body: The request body as a dict object
                        {
                            "id": "123456", - required
                            "name": "testName", - required
                            "is_pregnant": True, - required
                            "sex": "FEMALE", - required
                            "household_number": "20",
                            "date_of_birth": "1990-05-30",
                            "is_exact_date_of_birth: false
                            "zone": "15",
                            "village_number": "50",
                            "pregnancy_start_date": 1587068710, - required if is_pregnant = True
                            "drug_history": "too much tylenol",
                            "medical_history": "not enough advil",
                            "allergy": "seafood",
                            "is_archived": false
                        }
    :return: An error message if request body in invalid in some way. None otherwise.
    """
    error_message = None

    # Check if required keys are present
    required_keys = [
        "id",
        "name",
        "sex",
        "date_of_birth",
        "is_exact_date_of_birth",
    ]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # Check that certain fields are of type bool
    error_message = values_correct_type(request_body, ["is_pregnant"], bool)
    if error_message is not None:
        return error_message

    # If patient is pregnant, check  if certain pregnancy related fields are present
    if request_body.get("is_pregnant") is True:
        error_message = required_keys_present(
            request_body,
            ["pregnancy_start_date", "gestationalAgeUnit"],
        )
    if error_message is not None:
        return error_message

    # Check if gestational age is less than or equal to 43 weeks/10 months
    if "pregnancy_start_date" in request_body:
        error_message = check_gestational_age_under_limit(
            int(request_body["pregnancy_start_date"]),
        )
    if error_message is not None:
        return error_message

    # Check that certain fields are of type string
    error_message = values_correct_type(request_body, ["name"], str)
    if error_message is not None:
        return error_message

    # Check that certain fields are of type int
    error_message = values_correct_type(request_body, ["id"], str)
    if error_message is not None:
        return error_message

    # Check that id is not over the 14 digit limit.
    if len(str(request_body.get("id"))) > 14:
        return "id is too long. Max is 14 digits."

    # Make sure the date_of_birth is in YYYY-mm-dd format
    if not is_correct_date_format(request_body.get("date_of_birth")):
        return "date_of_birth is not in the required YYYY-MM-DD format."

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
        "id",
        "name",
        "sex",
        "is_pregnant",
        "household_number",
        "date_of_birth",
        "village_number",
        "gestational_timestamp",
        "pregnancy_start_date",
        "drug_history",
        "medical_history",
        "zone",
        "last_edited",
        "base",
        "is_exact_date_of_birth",
        "allergy",
        "is_archived",
    ]
    for key in request_body:
        if key not in patient_keys:
            return "The key " + key + " is not a valid field in patient"

    # Check that the id is not being edited
    if "id" in request_body and request_body.get("id") != patient_id:
        return "Patient ID cannot be changed."

    # Check that certain fields are of type bool
    if "is_pregnant" in request_body:
        error_message = values_correct_type(request_body, ["is_pregnant"], bool)
        if error_message is not None:
            return error_message

    # Check if gestational age is less than or equal to 43 weeks/10 months
    if (
        "pregnancy_start_date" in request_body
        and request_body.get("pregnancy_start_date") is not None
    ):
        error_message = check_gestational_age_under_limit(
            int(request_body["pregnancy_start_date"]),
        )
    if error_message is not None:
        return error_message

    # Check that certain fields are of type string
    if "name" in request_body:
        error_message = values_correct_type(request_body, ["name"], str)
        if error_message is not None:
            return error_message

    # Make sure the date_of_birth is in YYYY-mm-dd format
    if "date_of_birth" in request_body and not is_correct_date_format(
        request_body.get("date_of_birth")
    ):
        return "date_of_birth is not in the required YYYY-MM-DD format."

    return error_message


def check_gestational_age_under_limit(gestational_timestamp: int) -> Optional[str]:
    """
    Checks if a Unix timestamp is a valid gestational age.
    Is a valid gestational age if is from no more than 43 weeks/10 months ago

    :param gestation_timestamp: The Unix timestamp to validate
    :return: Returns None if the timestamp is valid, a string message otherwise
    """
    if gestational_timestamp == 0:
        return None

    gestation_date = datetime.fromtimestamp(gestational_timestamp)
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
