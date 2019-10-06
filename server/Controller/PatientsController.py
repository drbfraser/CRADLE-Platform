import logging
import json

from flask import request
from flask_restful import Resource, abort

# Project modules
from models import Patient, PatientSchema, ReadingSchema, ReferralSchema
from Validation import PatientValidation
from Manager import PatientManager, ReadingManager

from Manager.PatientManagerNew import PatientManager as PatientManagerNew

patientManager = PatientManagerNew()

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


# URI: /patient
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

    # Get all patients
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
        patient_data = self._get_request_body()
        # Ensure all data is valid
        abort_if_body_empty(patient_data)
        abort_if_patient_exists(patient_data['patientId'])
        invalid = PatientValidation.create_body_invalid(patient_data)
        if invalid is not None:
            return invalid

        response_body = patientManager.create(patient_data)
        return response_body, 201

    @staticmethod
    def delete():
        patientManager.delete_all()
        return {}


# URI: /patient/<string:patient_id>
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

        patient = abort_if_patient_doesnt_exist(patient_id)
        # invalid = PatientValidation.update_info_invalid(patient_id, data)
        # if invalid is not None:
        #     return invalid

        response_body = patientManager.update("patientId", patient_id, data)

        return response_body, 200


# /patient/reading/ [POST]
class PatientReading(Resource):
    @staticmethod
    def _get_request_body():
        body = request.get_json(force=True)
        logging.debug('Request body: ' + str(body))
        return body

    # Create a new patient with a reading
    def post(self):
        logging.debug('Received request: POST /patient/referral')
        patient_reading_data = self._get_request_body()
        # Ensure all data is valid
        abort_if_body_empty(patient_reading_data)
        invalid = PatientValidation.create_body_invalid(patient_reading_data['patient'])
        if invalid is not None:
            return invalid

        # create new reading (and patient if it does not already exist)
        reading_and_patient = ReadingManager.create_reading_and_patient(
            patient_reading_data['patient']['patientId'],
            patient_reading_data)

        # associate new reading with patient
        reading_and_patient['message'] = 'Patient reading created successfully!'
        return reading_and_patient, 201


# /patient/all/ [GET]
class PatientAllInformation(Resource):
    @staticmethod
    def _get_request_body():
        body = request.get_json(force=True)
        logging.debug('Request body: ' + str(body))
        return body

    # get all patient information (patientinfo, readings, and referrals)
    def get(self):
        patients_readings_referrals = patientManager.get_patient_with_referral_and_reading()
        if not patients_readings_referrals:
            abort(404, message="No patients currently exist.")
        else:
            return patients_readings_referrals    