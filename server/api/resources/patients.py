from flask import request
import flask_jwt_extended as jwt
from flask_restful import Resource, abort

import api.util as util
import data.crud as crud
import service.view as view
from data.marshal import marshal
from models import Patient
from Manager.PatientStatsManager import PatientStatsManager


# /api/patients
class Root(Resource):
    @staticmethod
    @jwt.jwt_required
    def get():
        user = util.current_user()
        patients = view.patient_view_for_user(user)
        if util.is_simplified_request(request):
            # TODO: Compute simplified view for each patient
            return []
        else:
            return [marshal(p) for p in patients]

    @staticmethod
    @jwt.jwt_required
    def post():
        json = request.get_json(force=True)
        # TODO: Validate request
        model = Patient(**json)
        crud.create(model)
        return marshal(model), 201


# /api/patients/<string:patient_id>
class SinglePatient(Resource):
    @staticmethod
    @jwt.jwt_required
    def get(patient_id: str):
        patient = crud.read(Patient, patientId=patient_id)
        if not patient:
            abort(404, message=f"No patient with id {patient_id}")
        return marshal(patient)


# /api/patients/<string:patient_id>/info
class PatientInfo(Resource):
    @staticmethod
    @jwt.jwt_required
    def get(patient_id: str):
        patient = crud.read(Patient, patientId=patient_id)
        if not patient:
            abort(404, message=f"No patient with id {patient_id}")
        return marshal(patient, shallow=True)

    @staticmethod
    @jwt.jwt_required
    def put(patient_id: str):
        json = request.get_json(force=True)
        # TODO: Validate
        crud.update(Patient, json, patientId=patient_id)


# /api/patients/<string:patient_id>/stats
class PatientStats(Resource):
    @staticmethod
    @jwt.jwt_required
    def get(patient_id: str):
        return PatientStatsManager().put_data_together(patient_id)


# /api/patients/<string:patient_id>/readings
class PatientReadings(Resource):
    @staticmethod
    @jwt.jwt_required
    def get(patient_id: str):
        patient = crud.read(Patient, patientId=patient_id)
        return [marshal(r) for r in patient.readings]
