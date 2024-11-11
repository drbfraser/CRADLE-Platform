import time

from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

from api import util
from api.decorator import roles_required
from data import crud, marshal
from enums import RoleEnum
from models import HealthFacility
from validation.facilities import FacilityValidator
from validation.validation_exception import ValidationExceptionError


# /api/facilities
class Root(Resource):
    # Ensuring that we select only these keys from the JSON payload.

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/facilities-get.yml",
        methods=["GET"],
        endpoint="facilities",
    )
    def get():
        facilities = crud.read_all(HealthFacility)
        if util.query_param_bool(request, "simplified"):
            # If responding to a "simplified" request, only return the names of the
            # facilities and no other information
            return [f.healthFacilityName for f in facilities]
        # Otherwise, return all information about the health facilities
        return [marshal.marshal(f) for f in facilities]

    @staticmethod
    @roles_required([RoleEnum.ADMIN])
    @swag_from(
        "../../specifications/facilities-post.yml",
        methods=["POST"],
        endpoint="facilities",
    )
    def post():
        request_body = request.get_json(force=True)
        new_facility_to_feed = util.filterPairsWithNone(request_body)
        try:
            facility_pydantic_model = FacilityValidator.validate(new_facility_to_feed)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        new_facility = facility_pydantic_model.model_dump()

        # Create a DB Model instance for the new facility and load into DB
        facility = marshal.unmarshal(HealthFacility, new_facility)
        facility.newReferrals = str(round(time.time() * 1000))

        crud.create(facility)

        # Get back a dict for return
        facilityDict = marshal.marshal(
            crud.read(
                HealthFacility,
                healthFacilityName=new_facility["healthFacilityName"],
            ),
        )
        return facilityDict, 201


# /api/facilities/<str:facility_name>
class SingleFacility(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-facility-get.yml",
        methods=["GET"],
        endpoint="single_facility",
    )
    def get(facility_name: str):
        facility = crud.read(HealthFacility, healthFacilityName=facility_name)
        if util.query_param_bool(request, "newReferrals"):
            newReferrals = facility.newReferrals
            # If responding to a "newReferrals" request, only return the timestamp of newReferrals of that facility
            return newReferrals
        # Otherwise, return all information about the health facilities
        return marshal.marshal(facility)
