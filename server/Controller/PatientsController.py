import logging
import json

from flask import request
from flask_restful import Resource, abort
from datetime import date, datetime

# Project modules
from Manager.PatientManagerNew import PatientManager as PatientManagerNew
from Manager.ReadingManagerNew import ReadingManager as ReadingManagerNew
from Validation import PatientValidation
from Manager.UserManager import UserManager
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                    jwt_required, jwt_refresh_token_required, get_jwt_identity)
patientManager = PatientManagerNew()
readingManager = ReadingManagerNew()
userManager = UserManager()


decoding_error = 'The json body could not be decoded. Try enclosing appropriate fields with quotations, or ensuring that values are comma separated.'



def abort_if_body_empty(request_body):
    if request_body is None:
        abort(400, message="The request body cannot be empty.")


def abort_if_patient_doesnt_exist(patient_id):
    patient = patientManager.read("patientId", patient_id)

    if patient is None:
        abort(404, message="Patient {} doesn't exist.".format(patient_id))
    else:
        return patient


def abort_if_patient_exists(patient_id):
    patient = patientManager.read("patientId", patient_id)

    if patient:
        abort(400, message="Patient {} already exists.".format(patient_id))

# input format: yyyy-mm-dd
# output: age
def calculate_age_from_dob(patient_data):
    DAYS_IN_YEAR = 365.2425
    birthDate = datetime.strptime(patient_data['dob'], '%Y-%m-%d')
    age = int((datetime.now() - birthDate).days / DAYS_IN_YEAR)
    patient_data['patientAge'] = age
    return patient_data


# URI: /api/patient [Get, Post]
# [GET]: Get a list of patients
# [POST]: Create a new patient 
class PatientAll(Resource):

    @staticmethod
    def _get_request_body():
        raw_req_body = request.get_json(force=True)
        if 'patient' in raw_req_body:
            body = raw_req_body['patient']
        else:
            body = raw_req_body
        print('Request body: ' + json.dumps(body, indent=2, sort_keys=True))
        return body

    # Get list of all patients
    @staticmethod
    def get():
        logging.debug('Received request: GET /patient')

        patients = patientManager.read_all()
        if patients is None:
            abort(404, message="No patients currently exist.")
        return patients

    # Create a new patient
    def post(self):
        logging.debug('Received request: POST /patient')
        try:
            patient_data = self._get_request_body()
        except:
            return {'HTTP 400':decoding_error}, 400
        patient_data = self._get_request_body()

        # Ensure all data is valid
        abort_if_body_empty(patient_data)
        abort_if_patient_exists(patient_data['patientId'])
        invalid = PatientValidation.check_patient_fields(patient_data)
        if invalid is not None:
            return invalid

        # if age is not provided, populate age using dob
        if patient_data['dob'] is not None and patient_data['patientAge'] is None:
            patient_data = calculate_age_from_dob(patient_data)

        response_body = patientManager.create(patient_data)
        return response_body, 201

    @staticmethod
    def delete():
        patientManager.delete_all()
        return {}


# URI: api/patient/<string:patient_id> 
# [GET]: Get a specific patient's information
# [PUT]: Update a specific patient's information
class PatientInfo(Resource):
    @staticmethod
    def _get_request_body():
        body = request.get_json(force=True)
        logging.debug('Request body: ' + str(body))
        return body

    # Get a single patient
    def get(self, patient_id):
        logging.debug('Received request: GET /patient/' + patient_id)
        patient = patientManager.read("patientId", patient_id)

        if patient is None:
            abort(404, message="Patient {} doesn't exist.".format(patient_id))
        return patient

    # Update patient info
    def put(self, patient_id):
        logging.debug('Received request: PUT /patient/' + patient_id)

        data = PatientInfo._get_request_body()

        patient = abort_if_patient_doesnt_exist(patient_id)
        # invalid = PatientValidation.update_info_invalid(patient_id, data)
        # if invalid is not None:
        #     return invalid

        response_body = patientManager.update("patientId", patient_id, data)

        return response_body, 200


# URI: api/patient/reading/ [POST]
# [POST]: Create a new patient with a reading 
class PatientReading(Resource):
    @staticmethod
    def _get_request_body():
        body = request.get_json(force=True)
        logging.debug('Request body: ' + str(body))
        return body

    # Create a new patient with a reading
    def post(self):
        logging.debug('Received request: POST /patient/referral')
        try:
            patient_reading_data = self._get_request_body()
        except:
            return {'HTTP 400':decoding_error}, 400
        patient_reading_data = self._get_request_body()
        # Ensure all data is valid
        abort_if_body_empty(patient_reading_data)
        is_invalid_patient = PatientValidation.check_patient_fields(patient_reading_data['patient'])
        is_invalid_reading = PatientValidation.check_reading_fields(patient_reading_data['reading'])

        if is_invalid_patient is not None:
            return is_invalid_patient

        # validate with new reading validator
        if is_invalid_reading is not None:
            return is_invalid_reading

        # create new reading (and patient if it does not already exist)
        reading_and_patient = readingManager.create_reading_and_patient(
            patient_reading_data['patient']['patientId'],
            patient_reading_data
        )
        # associate new reading with patient
        reading_and_patient['message'] = 'Patient reading created successfully!'
        return reading_and_patient, 201


# URI: api/patient/allinfo 
# [GET]: Get a list of ALL patients and their information (info, readings, referrals) 
class PatientAllInformation(Resource):
    @staticmethod
    def _get_request_body():
        body = request.get_json(force=True)
        logging.debug('Request body: ' + str(body))
        return body

    # get all patient information (patientinfo, readings, and referrals)
    @jwt_required
    def get(self):
        current_user = get_jwt_identity()
        patients_readings_referrals = patientManager.get_patient_with_referral_and_reading(current_user)
        #patients_readings_referrals = patientManager.get_patient_with_referral_and_reading()

        if not patients_readings_referrals:
            abort(404, message="No patients currently exist.")
        else:
            return patients_readings_referrals
