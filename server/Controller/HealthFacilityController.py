import logging
import json

from flask import request
from flask_restful import Resource, abort

# Project modules
from models import Patient, PatientSchema, ReadingSchema, ReferralSchema
from Validation import PatientValidation
from Manager.HealthFacilityManager import HealthFacilityManager

healthFacilityManager = HealthFacilityManager()

# URI: /patient
class HealthFacility(Resource):

    @staticmethod
    def _get_request_body():
        raw_req_body = request.get_json(force=True)
        print('Request body: ' + json.dumps(raw_req_body, indent=2, sort_keys=True))
        return raw_req_body

    # Get all patients
    @staticmethod
    def get(name=None):      
        args = request.args  
        if name:
            logging.debug('Received request: GET /health_facility/<id>')
            hf = healthFacilityManager.read("healthFacilityName", name)
            if hf is None: 
                abort(400, message=f'No health facility exists with name "{name}"')
            return hf
        elif args:
            logging.debug('Received request: GET /health_facility')
            print("args: " + json.dumps(args, indent=2, sort_keys=True))
            hfs = healthFacilityManager.search(args)
            if not hfs:
                abort(400, message="No health facilities found with given query params.")
            return hfs
        else:
            logging.debug('Received request: GET /health_facility')
            hfs = healthFacilityManager.read_all()
            if not hfs:
                abort(404, message="No health facilities currently exist.")
            return hfs

    # Create a new patient
    @staticmethod
    def post():
        logging.debug('Received request: POST /health_facility')
        hf_data = HealthFacility._get_request_body()
        response_body = healthFacilityManager.create(hf_data)
        return response_body, 201

    @staticmethod
    def put(name=None):
        # validate inputs
        if not name:
            abort(400, message="name is required")
    
        new_hf = HealthFacility._get_request_body()
        update_res = healthFacilityManager.update("healthFacilityName", name, new_hf)

        if not update_res:
            abort(400, message=f'No health facility exists with name "{name}"')
        else:
            return update_res

    @staticmethod
    def delete(name=None):
        # validate inputs
        if name:
            logging.debug('Received request: DELETE /health_facility/<id>')
            del_res = healthFacilityManager.delete("healthFacilityName", name)
            if not del_res:
                abort(400, message=f'No health facility exists with name "{name}"')
        else:
            logging.debug('Received request: DELETE /health_facility')
            healthFacilityManager.delete_all()
        return {}

    
