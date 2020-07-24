from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import data.crud as crud
import service.assoc as assoc
from models import Patient, HealthFacility, User


# /api/associations
class Root(Resource):
    @staticmethod
    @jwt_required
    def post():
        json: dict = request.get_json(force=True)
        # TODO: Validate request

        patient_id = json.get("patientId")
        facility_name = json.get("healthFacilityName")
        user_id = json.get("userId")

        patient = crud.read(Patient, patientId=patient_id)
        if not patient:
            abort(400, message=f"No patient exists with id: {patient_id}")

        if facility_name:
            facility = crud.read(HealthFacility, healthFacilityName=facility_name)
            if not facility:
                abort(400, message=f"No health facility with name: {facility_name}")
        else:
            facility = None

        if user_id:
            user = crud.read(User, id=user_id)
            if not user:
                abort(400, message=f"No user with id: {user_id}")
        else:
            user = None

        if not facility_name and not user_id:
            # If neither facility_name or user_id are present in the request, create a
            # 'smart' association for the patient by looking at the current user's role
            user = util.current_user()
            assoc.associate_by_user_role(patient, user)
        else:
            # Otherwise, simply associate the provided models together
            if not assoc.has_association(patient, facility, user):
                assoc.associate(patient, facility, user)

        return {}, 201
