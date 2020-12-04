from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import data.crud as crud
import service.assoc as assoc
from models import Patient, HealthFacility, User
from validation import associations


# /api/patientAssociations
class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/patientAssociations-post.yml",
        methods=["POST"],
        endpoint="patientAssociations",
    )
    def post():
        json: dict = request.get_json(force=True)
        error_message = associations.validate(json)
        if error_message is not None:
            abort(400, message=error_message)

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
            #     if user exists but no health facility then assign the patient to the user's health facility
            facility = user.healthFacility
        else:
            user = None

        if not facility_name and not user_id:
            # If neither facility_name or user_id are present in the request, create a
            # associate patient with the current user's health facility
            user = util.current_user()
            assoc.associate(patient, user.healthFacility, user)
        else:
            # Otherwise, simply associate the provided models together
            if not assoc.has_association(patient, facility, user):
                assoc.associate(patient, facility, user)

        return {}, 201
