from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse

import api.util as util
import data.crud as crud
import data.marshal as marshal
from models import HealthFacility

from api.decorator import roles_required
from models import RoleEnum


# /api/facilities
class Root(Resource):

    # Ensuring that we select only these keys from the JSON payload
    parser = reqparse.RequestParser()
    parser.add_argument(
        "healthFacilityName",
        type=str,
        required=True,
        help="This field cannot be left blank!",
    )
    parser.add_argument("healthFacilityPhoneNumber")
    parser.add_argument("about")
    parser.add_argument("facilityType")
    parser.add_argument("location")

    @staticmethod
    @jwt_required
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
        else:
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

        # Get key-value pairs from parser and remove pairs with a None value
        data = Root.parser.parse_args()
        data = util.filterPairsWithNone(data)
        

        # Create a DB Model instance for the new facility and load into DB
        facility = marshal.unmarshal(HealthFacility, data)
        facility.newReferrals = 0

        crud.create(facility)

        # Get back a dict for return
        facilityDict = marshal.marshal(
            crud.read(HealthFacility, healthFacilityName=data["healthFacilityName"])
        )
        return facilityDict, 201

# /api/facilities/<str:facility_name>
class SingleFacility(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-facility-get.yml",
        methods=["GET"],
        endpoint="single_facility",
    )
    def get(facility_name: str):
        facility = crud.read(HealthFacility, healthFacilityName=facility_name)
        if util.query_param_bool(request, "newReferrals"):
            # set newReferral of requested facility to 0
            facility.newReferrals = 0
            crud.create(facility)
            # If responding to a "newReferrals" request, only return the number of newReferrals of that facility
            return facility.newReferrals
        else:
            # Otherwise, return all information about the health facilities
            return marshal.marshal(facility)
        
