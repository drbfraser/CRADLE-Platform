from datetime import datetime, date

# This module provides functions to validate the request data for a Patient.

# helper method that makes sure all required keys and values are in request body
def check_if_required_keys_present(request_body, required_keys):
    for key in required_keys:
        if key not in request_body:
            print("Missing key: " + key)
            return {"HTTP 400": "The request body key {" + key + "} is required."}, 400
        if request_body.get(key) == "" or request_body.get(key) is None:
            print("Missing value for: " + key)
            return (
                {
                    "HTTP 400": "The request body value for the key {"
                    + key
                    + "} is required."
                },
                400,
            )
    return None


# helper method that checks gestational age isn't over 43 weeks/10 months
def check_gestational_age_under_limit(request_body):
    gestation_timestamp = int(request_body.get("gestationalTimestamp"))
    gestation_date = datetime.fromtimestamp(gestation_timestamp)
    today = date.today()
    num_of_weeks = (today - gestation_date.date()).days // 7
    if num_of_weeks > 43:
        return "Gestation is greater than 43 weeks/10 months."
    return None


# helper method that makes sure that expected string types are
# in fact strings/ints/string (depending on critera)
def check_if_values_string_int_array(
    request_body, must_be_string, must_be_int, must_be_array
):
    for key in request_body:
        if (
            must_be_string is not None
            and key in must_be_string
            and request_body.get(key) is not None
        ):
            if not isinstance((request_body.get(key)), str):
                return (
                    {
                        "HTTP 400": "The value for key {"
                        + key
                        + "} is must be a string."
                    },
                    400,
                )
        if (
            must_be_int is not None
            and key in must_be_int
            and request_body.get(key) is not None
        ):
            if not isinstance(int(request_body.get(key)), int):
                return (
                    {"HTTP 400": "The value for key {" + key + "} is must be an int."},
                    400,
                )
        if (
            must_be_array is not None
            and key in must_be_array
            and request_body.get(key) is not None
        ):
            if not isinstance((request_body.get(key)), list):
                return (
                    {"HTTP 400": "The value for key {" + key + "}  must be a array."},
                    400,
                )
        # add other type checks here once they're confirmed
    return None


def check_patient_fields(request_body):

    if request_body is None:
        return {"HTTP 400": "The request body cannot be empty."}, 400

    # if request_body.get('villageNumber') is not "" or None:
    # ToDo: Currently not storing village information, so will have to add village checking once that has been fixed

    required_keys = {
        "patientId",
        "patientName",
        "patientSex",
    }

    required_keys_present_message = check_if_required_keys_present(
        request_body, required_keys
    )

    if required_keys_present_message is not None:
        return required_keys_present_message

    gestational_age_message = None
    if (
        request_body.get("patientSex") == "FEMALE"
        and request_body.get("isPregnant") == True
    ):
        gestational_age_message = check_gestational_age_under_limit(request_body)

    if gestational_age_message is not None:
        print(gestational_age_message)
        return gestational_age_message

    # values that must be of type string
    must_be_string = {
        "patientId",
        "patientName",
        "gestationalAgeUnit",
        "villageNumber",
        "zone",
        "medicalHistory",
        "drugHistory",
    }

    # # todo: repeated code -- pull this out as a funciton that all necessary functions can use
    # # making sure that values are of the correct type
    # for key in request_body:
    #     if key in must_be_string and request_body.get(key) is not None:
    #         if not isinstance((request_body.get(key)), str):
    #             return {'HTTP 400': 'The value for key {' + key + '} is must be a string.'}, 400
    #     if key in must_be_int and request_body.get(key) is not None:
    #         if not isinstance(int(request_body.get(key)), int):
    #             return {'HTTP 400': 'The value for key {' + key + '} is must be an int.'}, 400
    #     # add other type checks here once they're confirmed

    # To Do: Do we also want to check for value ranges here? Or only on client side?


def check_reading_fields(request_body):

    if request_body is None:
        return {"HTTP 400": "The request body cannot be empty."}, 400

    # if request_body.get('villageNumber') is not "" or None:
    # ToDo: Currently not storing village information, so will have to add village checking once that has been fixed

    required_keys = {
        "userId",
        "dateTimeTaken",
        "readingId",
        "bpSystolic",
        "bpDiastolic",
        "heartRateBPM",
        "isFlaggedForFollowup",
    }

    required_keys_present_message = check_if_required_keys_present(
        request_body, required_keys
    )
    if required_keys_present_message is not None:
        return required_keys_present_message

    # values that must be of type string
    must_be_string = {
        # 'userId', -- deal with this later
        "readingId",
    }
    # must be of type array
    must_be_array = {
        "symptoms",
    }
    # values that must be of type int
    must_be_int = {"dateTimeTaken", "bpSystolic", "bpDiastolic", "heartRateBPM"}

    values_string_or_int_array_message = check_if_values_string_int_array(
        request_body, must_be_string, must_be_int, must_be_array
    )

    if values_string_or_int_array_message is not None:
        return values_string_or_int_array_message


def update_info_invalid(patient_id, request_body):
    required_keys = {"patientName", "villageNumber"}

    required_keys_present_message = check_if_required_keys_present(
        request_body, required_keys
    )
    if required_keys_present_message is not None:
        return required_keys_present_message

    # values that must be of type int
    must_be_int = {"villageNumber"}

    values_string_or_int_message = check_if_values_string_int_array(
        request_body, None, must_be_int, None
    )
    if values_string_or_int_message is not None:
        return values_string_or_int_message

    return None
