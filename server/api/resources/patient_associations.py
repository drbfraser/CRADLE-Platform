from flasgger import swag_from
from flask import request
from flask_restful import Resource, abort

from api import util
from common import commonUtil
from data import crud
from models import HealthFacilityOrm, PatientOrm, UserOrm
from service import assoc
from validation.associations import AssociationValidator
from validation.validation_exception import ValidationExceptionError


# /api/patientAssociations
class Root(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/patientAssociations-post.yml",
        methods=["POST"],
        endpoint="patientAssociations",
    )
    def post():
        json: dict = request.get_json(force=True)

        try:
            association_pydantic_model = AssociationValidator.validate(json)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        new_association = association_pydantic_model.model_dump()
        new_association = commonUtil.filterNestedAttributeWithValueNone(
            new_association,
        )
        patient_id = new_association.get("patientId")
        facility_name = new_association.get("healthFacilityName")
        user_id = new_association.get("userId")

        patient = crud.read(PatientOrm, patientId=patient_id)
        if not patient:
            abort(400, message=f"No patient exists with id: {patient_id}")

        if facility_name:
            facility = crud.read(HealthFacilityOrm, healthFacilityName=facility_name)
            if not facility:
                abort(400, message=f"No health facility with name: {facility_name}")
        else:
            facility = None

        if user_id:
            user = crud.read(UserOrm, id=user_id)
            if not user:
                abort(400, message=f"No user with id: {user_id}")
            #     if user exists but no health facility then assign the patient to the user's health facility
            facility = user.health_facility_name
        else:
            user = None

        if not facility_name and not user_id:
            # If neither facility_name or user_id are present in the request, create a
            # associate patient with the current user's health facility
            user = util.current_user()
            assoc.associate(patient, user.healthFacility, user)
        elif not assoc.has_association(patient, facility, user):
            assoc.associate(patient, facility, user)

        return {}, 201
