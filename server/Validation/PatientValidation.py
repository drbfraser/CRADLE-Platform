# This module provides functions to validate the request data for a Patient.

from Manager import patientManager
from Manager import patientManager

"""
    Description: validates request for creating a new patient, will also be using this to help validate new patient with a reading

    Request looks like: 
        request_body = {
        "patientId":"51253242033", -- string
        "patientName":"BF", -- string
        "patientAge":49, -- can be string or int, should probably stick to one
        "gestationalAgeUnit":"GESTATIONAL_AGE_UNITS_WEEKS", -- string
        "gestationalAgeValue":"45", -- string
        "villageNumber":"1251515", -- string
        "patientSex":"FEMALE", 
        "isPregnant":"true", -- boolean
        "tank" : null, -- string
        "zone": "11", -- string
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
        - Tank/Zone/village/block: need more info

    Village number should exist
"""


def check_patient_fields(request_body):
  
    if request_body is None:
        return {'HTTP 400': 'The request body cannot be empty.'}, 400

    # if request_body.get('villageNumber') is not "" or None:
    # ToDo: Currently not storing village information, so will have to add village checking once that has been fixed

    required_keys = {
    'patientId',
    'patientName',
    'patientAge', 
    'patientSex'
    }

    # make sure all required keys and values are in request body
    for key in required_keys:
        if key not in request_body:
            print('Missing key: ' + key)
            return {'HTTP 400': 'The request body key {' + key + '} is required.'}, 400
        if request_body.get(key) == "" or request_body.get(key) is None:
            print('Missing value for: ' + key)
            return {'HTTP 400': 'The request body value for the key {' + key + '} is required.'}, 400

    # values that must be of type string
    must_be_string = {
    'patientId',
    'patientName',
    'gestationalAgeUnit',
    'gestationalAgeValue',
    'villageNumber',
    'tank',
    'zone',
    'block',
    'medicalHistory',
    'drugHistory'
    }

    # values that must be of type int
    must_be_int = {
    # currently ok being a string or an int, but may need to change this
    'patientAge' 
    }
        

    # making sure that values are of the correct type
    for key in request_body:
        if key in must_be_string and request_body.get(key) is not None:
            if not isinstance(request_body.get(key), str):
                return {'HTTP 400': 'The value for key {' + key + '} is must be a string.'}, 400


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

def check_patient_and_reading_fields(request_body):

    error = check_patient_fields(request['patient'])
    if error is not None
        return error
  
    if request_body is None:
        return {'HTTP 400': 'The request body cannot be empty.'}, 400

    # if request_body.get('villageNumber') is not "" or None:
    # ToDo: Currently not storing village information, so will have to add village checking once that has been fixed

    required_keys = {
    'userId',
    'dateTimeTaken',
    'readingId', 
    'bpSystolic',
    'bpDiastolic',
    'heartRateBPM',
    'isFlaggedForFollowup',
    'symptoms'
    }

    # make sure all required keys and values are in request body
    for key in required_keys:
        if key not in request_body:
            print('Missing key: ' + key)
            return {'HTTP 400': 'The request body key {' + key + '} is required.'}, 400
        if request_body.get(key) == "" or request_body.get(key) is None:
            print('Missing value for: ' + key)
            return {'HTTP 400': 'The request body value for the key {' + key + '} is required.'}, 400

    # values that must be of type string
    must_be_string = {
    'userId',
    'dateTimeTaken',
    'readingId',
    'symptoms'
    }

    # values that must be of type int
    must_be_int = {
    'bpSystolic',
    'bpDiastolic',
    'heartRateBPM'
    }
        
    # to do: need to check for type int as well, turn this into a general function above
    # making sure that values are of the correct type
    for key in request_body['reading']:
        if key in must_be_string and request_body['reading'].get(key) is not None:
            if not isinstance(request_body['reading'].get(key), str):
                return {'HTTP 400': 'The value for key {' + key + '} is must be a string.'}, 400

    for key in request_body['reading']:
        if key in must_be_int and request_body['reading'].get(key) is not None:
            if not isinstance(request_body.get(key), int):
                return {'HTTP 400': 'The value for key {' + key + '} is must be an int.'}, 400


    # To Do: Do we also want to check for value ranges here? Or only on client side?




# Todo:  only being used in one function, merging this code with new validation code, clean up
def create_body_invalid(request_body):
    """Validates whether a request has all required values and constraints.
    To Do: Merge this with check_patient_fields
() function above

    :param request_body: JSON request body
    :return: The error for Flask to return, or None if no error is found
    """
    if request_body is None:
        return {'HTTP 400': 'The request body cannot be empty.'}, 400
    if request_body.get('patientId') == "":
        return {'HTTP 400': 'The request body field patientId is required.'}, 400
    if request_body.get('patientAge') == "":
        return {'HTTP 400': 'The request body field patientAge is required.'}, 400
    if request_body.get('patientSex') == "":
        return {'HTTP 400': 'The request body field patientSex is required.'}, 400

    return None


# ToDo: not currently being called anywhere, clean this up
def update_info_invalid(patient_id, request_body):
    """Validates whether a request has all required values and constraints.

    :param patient_id: Unique Patient ID which must already exist
    :param request_body: JSON request body
    :return: The error for Flask to return, or None if no error is found
    """
    if request_body is None:
        return {'HTTP 400': 'The request body cannot be empty.'}, 400

    if patientManager.read("patientId", patient_id) is None:
        return {'HTTP 404': 'The given Patient ID was invalid.'}, 404

    has_required_field = \
        request_body.get('reading') or \
        request_body.get('referral') or \
        request_body.get('fillout')

    if not has_required_field:
        return {'HTTP 400': 'At least one of the request body fields \'reading\', \'referral\', and/or \'fillout\' '
                            'are required.'}, 400

    return None
