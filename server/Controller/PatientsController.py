import logging
import json

from flask import request
from flask_restful import Resource, abort

# Project modules
from models import Patient, PatientSchema, ReadingSchema
from Validation import PatientValidation
from Manager import PatientManager, ReadingManager


def abort_if_body_empty(request_body):
    if request_body is None:
        abort(400, message="The request body cannot be empty.")


def abort_if_patient_doesnt_exist(patient_id):
    patient = PatientManager.get_patient(patient_id)

    if patient is None:
        abort(404, message="Patient {} doesn't exist.".format(patient_id))
    else:
        return patient


def abort_if_patient_exists(patient_id):
    patient = PatientManager.get_patient(patient_id)

    if patient:
        abort(404, message="Patient {} already exists.".format(patient_id))


# URI: /patient
class PatientAll(Resource):

    @staticmethod
    def _get_request_body():
        body = request.get_json(force=True)['patient']
        print('Request body: ' + str(body))
        return body

    # Get all patients
    @staticmethod
    def get():
        logging.debug('Received request: GET /patient')

        patients = PatientManager.get_patients()
        if patients is None:
            abort(404, message="No patients currently exist.")
        return patients

    # Create a new patient
    def post(self):
        logging.debug('Received request: POST /patient')
        patient_data = self._get_request_body()
        print(patient_data)
        # Ensure all data is valid
        abort_if_body_empty(patient_data)
        abort_if_patient_exists(patient_data['patientId'])
        invalid = PatientValidation.create_body_invalid(patient_data)
        if invalid is not None:
            return invalid

        response_body = PatientManager.create_patient(patient_data)
        return response_body, 201

    @staticmethod
    def delete():
        PatientManager.delete_all()
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

        patient = PatientManager.get_patient(patient_id)

        if patient is None:
            abort(404, message="Patient {} doesn't exist.".format(patient_id))
        return patient

    # Update patient info
    def put(self, patient_id):
        logging.debug('Received request: PUT /patient/' + patient_id)

        # patient = abort_if_patient_doesnt_exist(patient_id)
        # invalid = PatientValidation.update_info_invalid(patient_id, data)
        # if invalid is not None:
        #     return invalid

        # response_body = PatientManager.update_info(patient_id, data)

        return response_body, 201

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

        # check if patient is already created
        patient = PatientManager.get_patient(patient_reading_data['patient']['patientId'])
        if patient is None:
            patient = PatientManager.create_patient(patient_reading_data['patient'])

        # create new reading 
        reading = ReadingManager.create_reading(patient_reading_data['reading'], patient.patientId)

        # associate new reading with patient

        patient_schema = PatientSchema()
        reading_schema = ReadingSchema()
        return {'message' : 'Patient reading created successfully!',
                'reading' : reading_schema.dump(reading),
                'patient' : patient_schema.dump(patient)
                }, 201
