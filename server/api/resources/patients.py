from flask import request
from flask_restful import Resource, abort

import api.util as util
import data.crud as crud
from data.marshal import marshal
from models import Patient


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
        patient = crud.read(Patient, patientId=patient_id)
        if not patient:
            abort(404, message=f"No patient with id {patient_id}")
        return marshal(patient)


# /api/patients/<string:patient_id>/info
class PatientInfo(Resource):
    @staticmethod
    def get(patient_id: str):
        patient = crud.read(Patient, patientId=patient_id)
        if not patient:
            abort(404, message=f"No patient with id {patient_id}")
        return marshal(patient, shallow=True)

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
        patient = crud.read(Patient, patientId=patient_id)
        return [marshal(r) for r in patient.readings]
