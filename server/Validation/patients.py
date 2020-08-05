from datetime import datetime, date


def validate(request_body):
    """
    Returns an error code and message if the /api/patients post request
    is not valid. Else, returns None.

    :param json: The request body as a dict object
    :return: An error message if request body in invalid in some way. None otherwise. 
    """
    error_message = None

    # Check if required keys are present
    required_keys = ["patientId", "patientName", "patientSex", "isPregnant"]
    error_message = required_keys_present(request_body, required_keys)
    if error_message is not None:
        return error_message

    # If patient is pregnant, check  if certain pregnancy related fields are present
    if request_body.get("isPregnant") == True:
        error_message = required_keys_present(request_body, ["gestationalTimestamp", "gestationalAgeUnit"])
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

    if request_body.get("dob") != datetime.strptime(request_body.get("dob"), "%Y-%m-%d").strftime('%Y-%m-%d'):
        return "dob is not in the required YYYY-MM-DD format."

    return error_message
    

def required_keys_present(request_body, required_keys):
    """
    Returns an error message if the required keys are not
    present. Else, returns None.

    :param json: The request body as a dict object
    :param required_keys: The list of required key names
    :return: An error message if required keys are not present. None otherwise. 
    """
    for key in required_keys:
        if key not in request_body:
            return "The request body key {" + key + "} is required."
        if request_body.get(key) == "" or request_body.get(key) is None:
            return "The request body value for the key {" + key + "} is required."
    return None


def check_gestational_age_under_limit(request_body):
    gestation_timestamp = int(request_body.get("gestationalTimestamp"))
    gestation_date = datetime.fromtimestamp(gestation_timestamp)
    today = date.today()
    num_of_weeks = (today - gestation_date.date()).days // 7
    if num_of_weeks > 43:
        return "Gestation is greater than 43 weeks/10 months."
    return None


def values_correct_type(request_body, key_names, type):
    """
    Returns an error message if the values of some keys are not
    the correct specified type. Else, returns None.

    :param json: The request body as a dict object
    :param required_keys: The list of keys to have their values checked. 
    :return: An error message if the values are not the correct type. None otherwise. 
    """
    for key in key_names:
        if key in request_body and request_body.get(key) is not None:
            if type == int:
                if not isinstance(int(request_body.get(key)), type):
                    return "The value for key {" + key + "} is not the correct type."
            else:
                if not isinstance((request_body.get(key)), type):
                    return "The value for key {" + key + "} is not the correct type."
    return None