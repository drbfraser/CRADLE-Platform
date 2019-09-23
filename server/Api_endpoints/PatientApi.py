from flask import request
from flask_restful import Resource
import logging

# Project modules
from Validation import PatientValidation
from Manager import PatientManager


class Patient(Resource):
    @staticmethod
    def _get_request_body():
        body = request.get_json(force=True)
        logging.debug('Request body: ' + str(body))
        return body

    def post(self):
        logging.debug('Received request: POST /patient')

        body = self._get_request_body()
        invalid = PatientValidation.create_body_invalid(body)
        if invalid is not None:
            return invalid

        response_body = PatientManager.create_patient(body)

        return response_body, 201

    def put(self, id):
        logging.debug('Received request: PUT /patient/' + id)

        body = self._get_request_body()
        invalid = PatientValidation.update_info_invalid(id, body)
        if invalid is not None:
            return invalid

        response_body = PatientManager.update_info(id, body)

        return response_body, 201
