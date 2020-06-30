# This module provides functions to validate the request data for a Patient.

"""
    Description: validates request for creating a new patient, will also be using this to help validate new patient with a reading

    Request looks like: 
        request_body = {
        "patientId":"51253242033", -- string
        "patientName":"BF", -- string
        "patientAge":49, -- int, should probably stick to one
        "gestationalAgeUnit":"GESTATIONAL_AGE_UNITS_WEEKS", -- string
        "gestationalAgeValue":"45", -- string
        "villageNumber":"1251515", -- string
        "patientSex":"FEMALE", 
        "isPregnant":"true", -- boolean
        "block": "15", -- string
        "medicalHistory": "nothing really", db.text (long string)
        "drugHistory": "nothing really", db.text (long string)
        }

    Required value types specified in request above in -- {value type} 

    Required keys and their values should be in request body
        - Patient ID
        - Patient Name
        - Patient Age
        - Patient Sex

    Ranges for all values: 
        - PatientID: 11 digit attestation number
        - Patient name, initials atleast 2 characters 
        - Patient age: check min-max age on google/our current client restrictions
        - Patient sex: should be male or female (check sex vs gender)
        - Gestational unit: need more info
        - Zone/village: need more info

    Village number should exist
"""
import logging

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

# helper method that makes sure that expected string types are in fact strings/ints (depending on critera)
def check_if_values_string_int_array(request_body, must_be_string, must_be_int,must_be_array):
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
                    {
                        "HTTP 400": "The value for key {"
                        + key
                        + "} is must be a array."
                    },
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
        # 'patientAge',
        "patientSex",
    }

    required_keys_present_message = check_if_required_keys_present(
        request_body, required_keys
    )
    if required_keys_present_message is not None:
        return required_keys_present_message

    # values that must be of type string
    must_be_string = {
        "patientId",
        "patientName",
        "gestationalAgeUnit",
        "gestationalAgeValue",
        "villageNumber",
        "zone",
        "medicalHistory",
        "drugHistory",
    }

    # values that must be of type int
    must_be_int = {"patientAge"}

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


"""
    Description: validates request for creating a new patient with a reading

    Request looks like: 
    Everything in patient request and: 
     "reading" : {
    	"readingId": "asdasd8231280222223", -- string
        "dateTimeTaken" : "2019-09-25T19:00:43.002-07:00[America/Vancouver]", -- string
        "userId": "1", - integer
        "bpSystolic" : 20, -- integer
        "bpDiastolic" : 30, -- integer
        "heartRateBPM" : 10, -- integer
        "dateRecheckVitalsNeeded" : "2019-09-25T19:15:38.032-07:00[America/Vancouver]", -- string
        "isFlaggedForFollowup" : false, - boolean
        "symptoms": "Headache,Blurred vision,Bleeding,sleepy" - db.text (long string)
    }
    For patient, same as above
    For reading: 

    Can also have some more things that are listed in DB, check if still required

    Required Keys:
        - userid // person who took the reading
        - Datetime taken vs datetimelastsaved
        - readingID
        - bpDiastolic
        - BpSystolic
        - heartRateBPM
        - dateRecheckNeeded?? Check if client shows this atm
        - isFlaggedForfollowup
        - Symotoms: or has selected no symptoms
        
    Check value ranges:
        - bpSystolic: check min and max 
        - bpDiastolic: check min and max
        - heartRateBPM: check min and max
        - Datetime cannot be in the past

    userID exists (person who took the reading)

"""


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
    logging.getLogger().info("bugg")
    

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
    must_be_int = {"patientAge", "villageNumber", "gestationalAgeValue"}

    values_string_or_int_message = check_if_values_string_int_array(
        request_body, None, must_be_int,None
    )
    if values_string_or_int_message is not None:
        return values_string_or_int_message
    return None
