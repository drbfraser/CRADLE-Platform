# This module provides functions to validate the request data for a Patient.

from Manager import patientManager


 # make sure body has required fields
def check_required_fields(request_body, body_type):
    """
    Makes sure that all data in request meets constraints
    Only checking if required fields exist
    To do in the future for true full validation: would be good to validate type of data, and ensure the exact required keys are in request
    """

    if request_body is None:
        return {'HTTP 400': 'The request body cannot be empty.'}, 400

    if body_type == 'patient':
        required = {
            'patientId',
            'patientAge', 
            'patientSex' }

    elif body_type == 'reading':
        # may need to take userId out of here
        required = { 
            'userId',
            'readingId',
            'dateTimeTaken' }

    # else programmer error, entered incorrect body_type

    for key in required:
        if request_body.get(key) == "":
            print("INVALID KEY")
            return {'HTTP 400': 'The request body field '  + key + ' is required.'}, 400
            
    return None
    
    """
    To do: remove this
    Valid Request for api/patient/reading
    {   
    "patient": {
    
        "patientId":"51253242033”, = needed
        "patientName":"BF”, 
        "patientAge":49, = needed
        "gestationalAgeUnit":"GESTATIONAL_AGE_UNITS_WEEKS",
        "gestationalAgeValue":"45",
        "villageNumber":"1251515",
        "patientSex":"FEMALE”, = needed
        "isPregnant":"true",
        "tank" : null
    },
    "reading": {
    	"userId": "3”, - needed
        "dateTimeTaken": "2019-10-29T17:03:21.494-07:00[America\/Vancouver]”,- needed
        "readingId":"22222”, - needed
        "bpSystolic":20000, - needed
        "bpDiastolic":76, - needed
        "heartRateBPM":67, - needed
        "dateRecheckVitalsNeeded":"2019-09-29T17:03:21.494-07:00[America\/Vancouver]",
        "isFlaggedForFollowup":true, - needed
        "symptoms":"Feverish, Unwell"
    }
    """


def create_body_invalid(request_body):
    """Validates whether a request has all required values and constraints.
    To Do: Merge this with check_required_fields() function above

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
