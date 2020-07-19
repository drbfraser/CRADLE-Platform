from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import data.crud as crud
import data.marshal as marshal
import service.assoc as assoc
import service.invariant as invariant
import service.view as view
from Manager.PatientStatsManager import PatientStatsManager
from models import Patient


# /api/patients
class Root(Resource):
    @staticmethod
    @jwt_required
    def get():
        user = util.current_user()
        patients = view.patient_view_for_user(user)
        if util.query_param_bool(request, name="simplified"):
            # TODO: Compute simplified view for each patient
            return []
        else:
            return [marshal.marshal(p) for p in patients]

    @staticmethod
    @jwt_required
    def post():
        json = request.get_json(force=True)
        # TODO: Validate request
        patient = marshal.unmarshal(Patient, json)
        invariant.resolve_reading_invariants(patient)
        crud.create(patient)

        # Associate the patient with the user who created them
        user = util.current_user()
        # TODO: If the user is a HCW then we should only associate patient -> facility,
        #       if they are a VHT, then we should only associate patient -> user
        assoc.associate(patient, user.healthFacility, user)

        # If the patient has any readings, and those readings have referrals, we
        # associate the patient with the facilities they were referred to
        for reading in patient.readings:
            referral = reading.referral
            if referral and not assoc.has_association(
                patient, referral.healthFacility, user
            ):
                assoc.associate(patient, referral.healthFacility, user)

        return marshal.marshal(patient), 201


# /api/patients/<string:patient_id>
class SinglePatient(Resource):
    @staticmethod
    @jwt_required
    def get(patient_id: str):
        patient = crud.read(Patient, patientId=patient_id)
        if not patient:
            abort(404, message=f"No patient with id {patient_id}")
        return marshal.marshal(patient)


# /api/patients/<string:patient_id>/info
class PatientInfo(Resource):
    @staticmethod
    @jwt_required
    def get(patient_id: str):
        patient = crud.read(Patient, patientId=patient_id)
        if not patient:
            abort(404, message=f"No patient with id {patient_id}")
        return marshal.marshal(patient, shallow=True)

    @staticmethod
    @jwt_required
    def put(patient_id: str):
        json = request.get_json(force=True)
        # TODO: Validate
        crud.update(Patient, json, patientId=patient_id)


# /api/patients/<string:patient_id>/stats
class PatientStats(Resource):
    @staticmethod
    @jwt_required
    def get(patient_id: str):
        return PatientStatsManager().put_data_together(patient_id)


# /api/patients/<string:patient_id>/readings
class PatientReadings(Resource):
    @staticmethod
    @jwt_required
    def get(patient_id: str):
        patient = crud.read(Patient, patientId=patient_id)
        return [marshal.marshal(r) for r in patient.readings]
