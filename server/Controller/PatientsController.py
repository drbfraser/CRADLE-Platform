from flask import request
from flask_restful import Resource, abort
from models import Patient, PatientSchema
import logging

# Project modules
from Validation import PatientValidation
from Manager import PatientManager


def abort_if_body_empty(request_body):
    if request is None:
        abort(400, message="The request body cannot be empty.")


def abort_if_patient_doesnt_exist(patient_id):
    patient = PatientManager.get_patient(patient_id)

    if patient is None:
        abort(404, message="Patient {} doesn't exist.".format(patient_id))
    else:
        return patient


def abort_if_patients_doesnt_exist():
    patients = PatientManager.get_patients()

    if patients is None:
        abort(404, message="No patients currently exist.")
    else:
        return patients


def abort_if_patient_exists(patient_id):
    patient = PatientManager.get_patient(patient_id)

    if patient:
        abort(404, message="Patient {} already exists.".format(patient_id))


class PatientAll(Resource):
    @staticmethod
    def _get_request_body():
        body = request.get_json(force=True)
        logging.debug('Request body: ' + str(body))
        return body

    # Get all patients
    def get(self):
        logging.debug('Received request: GET /patient')
        patients = abort_if_patients_doesnt_exist()

        patient_schema = PatientSchema(many=True)
        data = patient_schema.dump(patients)
        return data

    # Create a new patient
    def post(self):
        logging.debug('Received request: POST /patient')
        patient_data = self._get_request_body()

        # Ensure all data is valid
        abort_if_body_empty(patient_data)
        abort_if_patient_exists(patient_data.get('id'))
        invalid = PatientValidation.create_body_invalid(patient_data)
        if invalid is not None:
            return invalid

        response_body = PatientManager.create_patient(patient_data)
        return response_body, 201

class PatientInfo(Resource):
    @staticmethod
    def _get_request_body():
        body = request.get_json(force=True)
        logging.debug('Request body: ' + str(body))
        return body

    # Get a single patient
    def get(self, patient_id):
        logging.debug('Received request: GET /patient/' + patient_id)
        patient = abort_if_patient_doesnt_exist(patient_id)

        patient_schema = PatientSchema()
        data = patient_schema.dump(patient)
        return data

    # Update patient info (reading, referral, or fillout)
    def put(self, patient_id):
        logging.debug('Received request: PUT /patient/' + patient_id)

        patient = abort_if_patient_doesnt_exist(patient_id)
        data = self._get_request_body()
        invalid = PatientValidation.update_info_invalid(patient_id, data)
        if invalid is not None:
            return invalid

        response_body = PatientManager.update_info(patient_id, data)

        return response_body, 201