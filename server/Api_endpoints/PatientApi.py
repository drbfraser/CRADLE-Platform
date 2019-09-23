from flask import request
from flask_restful import Resource
import logging

# Project modules
from Validation import PatientValidation
from Manager import PatientManager


class Patient(Resource):
    def post(self):
        logging.debug('Received request: POST /patient')

        body = request.get_json(force=True)
        logging.debug('Request body: ' + str(body))
        invalid = PatientValidation.patient_body_invalid(body)
        if invalid is not None:
            return invalid

        response_body = PatientManager.create_patient(body)

        return response_body, 201
