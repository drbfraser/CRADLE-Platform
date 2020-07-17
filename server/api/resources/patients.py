from flask import request
from flask_restful import Resource

import api.util as util


# /api/patients
class Root(Resource):
    @staticmethod
    def get():
        if util.is_simplified_request(request):
            pass
        else:
            # Return all patient info
            pass

    @staticmethod
    def post():
        pass


# /api/patients/<string:patient_id>
class SinglePatient(Resource):
    @staticmethod
    def get(patient_id: str):
        pass


# /api/patients/<string:patient_id>/info
class PatientInfo(Resource):
    @staticmethod
    def get(patient_id: str):
        pass

    @staticmethod
    def put(patient_id: str):
        pass


# /api/patients/<string:patient_id>/stats
class PatientStats(Resource):
    @staticmethod
    def get(patient_id: str):
        pass


# /api/patients/<string:patient_id>/readings
class PatientReadings(Resource):
    @staticmethod
    def get(patient_id: str):
        pass
