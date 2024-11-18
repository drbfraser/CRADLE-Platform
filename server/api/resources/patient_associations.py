from flasgger import swag_from
from flask_restful import Resource, abort

from common import api_utils, commonUtil, user_utils
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
        request_body = api_utils.get_request_body()

        try:
            association_pydantic_model = AssociationValidator.validate(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))
            return None

        new_association = association_pydantic_model.model_dump()
        new_association = commonUtil.filterNestedAttributeWithValueNone(
            new_association,
        )
        patient_id = new_association.get("patientId")
        facility_name = new_association.get("healthFacilityName")
        user_id = new_association.get("userId")

        patient = crud.read(PatientOrm, patientId=patient_id)
        if patient is None:
            abort(400, message=f"No patient exists with id: {patient_id}")
            return None

        if facility_name:
            facility = crud.read(HealthFacilityOrm, healthFacilityName=facility_name)
            if facility is None:
                abort(400, message=f"No health facility with name: {facility_name}")
                return None
        else:
            facility = None

        if user_id is not None:
            user = crud.read(UserOrm, id=user_id)
            if user is None:
                abort(400, message=f"No user with id: {user_id}")
                return None
            #     if user exists but no health facility then assign the patient to the user's health facility
            facility = user.health_facility_name
        else:
            user = None

        if facility_name is None and user_id is None:
            # If neither facility_name or user_id are present in the request, create a
            # associate patient with the current user's health facility
            user_dict = user_utils.get_current_user_from_jwt()
            user_orm = crud.read(UserOrm, id=user_dict["id"])
            assoc.associate(patient, user_orm.health_facility, user_orm)
        elif not assoc.has_association(patient, facility, user):
            assoc.associate(patient, facility, user)

        return {}, 201
