import time

from flasgger import swag_from
from flask import request
from flask_restful import Resource, abort, reqparse

from api import util
from api.decorator import roles_required
from data import crud, marshal
from enums import RoleEnum
from models import HealthFacilityOrm
from validation.facilities import Facility
from validation.validation_exception import ValidationExceptionError


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
    @swag_from(
        "../../specifications/facilities-get.yml",
        methods=["GET"],
        endpoint="facilities",
    )
    def get():
        facilities = crud.read_all(HealthFacilityOrm)
        if util.query_param_bool(request, "simplified"):
            # If responding to a "simplified" request, only return the names of the
            # facilities and no other information
            return [f.name for f in facilities]
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
        try:
            Facility.validate(args)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        # Create a DB Model instance for the new facility and load into DB
        facility = marshal.unmarshal(HealthFacilityOrm, args)
        facility.new_referrals = str(round(time.time() * 1000))

        crud.create(facility)

        # Get back a dict for return
        facility_dict = marshal.marshal(
            crud.read(HealthFacilityOrm, name=args["health_facility_name"]),
        )
        return facility_dict, 201


# /api/facilities/<str:facility_name>
class SingleFacility(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/single-facility-get.yml",
        methods=["GET"],
        endpoint="single_facility",
    )
    def get(facility_name: str):
        facility = crud.read(HealthFacilityOrm, healthFacilityName=facility_name)
        if facility is None:
            abort(404, message=f"Facility ({facility_name}) not found.")

        if util.query_param_bool(request, "new_referrals"):
            if facility is not None:
                new_referrals = facility.new_referrals
            # If responding to a "new_referrals" request, only return the timestamp of new_referrals of that facility
            return new_referrals
        # Otherwise, return all information about the health facilities
        return marshal.marshal(facility)
