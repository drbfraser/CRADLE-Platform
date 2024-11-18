import time

from flasgger import swag_from
from flask_restful import Resource, abort

from api import util
from api.decorator import roles_required
from common import api_utils, commonUtil
from data import crud, marshal
from enums import RoleEnum
from models import HealthFacilityOrm
from validation.facilities import FacilityValidator
from validation.validation_exception import ValidationExceptionError


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
        if api_utils.get_query_param_bool("simplified"):
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
        request_body = api_utils.get_request_body()
        new_facility_to_feed = util.filterPairsWithNone(request_body)
        try:
            facility_pydantic_model = FacilityValidator.validate(new_facility_to_feed)
        except ValidationExceptionError as e:
            abort(400, message=str(e))
            return None

        new_facility = facility_pydantic_model.model_dump()
        new_facility = commonUtil.filterNestedAttributeWithValueNone(new_facility)

        # Create a DB Model instance for the new facility and load into DB
        facility = marshal.unmarshal(HealthFacilityOrm, new_facility)
        facility.new_referrals = str(round(time.time() * 1000))

        crud.create(facility)

        # Get back a dict for return
        facility_dict = marshal.marshal(
            crud.read(
                HealthFacilityOrm,
                name=new_facility["name"],
            ),
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
        facility = crud.read(HealthFacilityOrm, name=facility_name)
        if facility is None:
            abort(404, message=f"Facility ({facility_name}) not found.")

        if api_utils.get_query_param_bool("new_referrals"):
            if facility is not None:
                new_referrals = facility.new_referrals
            # If responding to a "new_referrals" request, only return the timestamp of new_referrals of that facility
            return new_referrals
        # Otherwise, return all information about the health facilities
        return marshal.marshal(facility)
