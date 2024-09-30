import time

from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, reqparse, abort

from api import util
from api.decorator import roles_required
from data import crud, marshal
from enums import RoleEnum
from models import HealthFacility
from validation.facilities import Facility
from validation import facilities


def add_model(parser, model):
    fields = model.__fields__
    for name, field in fields.items():
        parser.add_argument(
            name,
            dest=name,
            default=field.default,
            help=field.description,
        )


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
        # continue using parser but with pydantic to construct model
        parser = reqparse.RequestParser()
        add_model(parser, Facility)
        args = parser.parse_args()
        error_message = facilities.validate(args)

        if error_message is not None:
            abort(400, message=error_message)

        # Create a DB Model instance for the new facility and load into DB
        facility = marshal.unmarshal(HealthFacility, args)
        facility.newReferrals = str(round(time.time() * 1000))

        crud.create(facility)

        # Get back a dict for return
        facilityDict = marshal.marshal(
            crud.read(HealthFacility, healthFacilityName=args["healthFacilityName"]),
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
