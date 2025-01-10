import time

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from api.decorator import roles_required
from common.api_utils import FacilityNamePath
from data import crud, marshal
from enums import RoleEnum
from models import HealthFacilityOrm
from validation.facilities import (
    HealthFacilityListResponse,
    HealthFacilityModel,
    HealthFacilityNameListResponse,
    HealthFacilityNewReferrals,
)

# /api/facilities
api_facilities = APIBlueprint(
    name="facilities",
    import_name=__name__,
    url_prefix="/facilities",
    abp_tags=[Tag(name="Facilities", description="")],
    abp_security=[{"jwt": []}],
)


# /api/facilities [GET]
@api_facilities.get("", responses={200: HealthFacilityListResponse})
def get_all_facilities():
    """Get All Health Facilities"""
    facilities = crud.read_all(HealthFacilityOrm)
    return [marshal.marshal(f) for f in facilities]


# /api/facilities/names [GET]
@api_facilities.get("/names", responses={200: HealthFacilityNameListResponse})
def get_all_facility_names():
    """
    Get All Health Facility Names
    Get a list containing the names of all Health Facilities.
    """
    facilities = crud.read_all(HealthFacilityOrm)
    return [f.name for f in facilities]


# /api/facilities [POST]
@api_facilities.post("", responses={201: HealthFacilityModel})
@roles_required([RoleEnum.ADMIN])
def create_facility(body: HealthFacilityModel):
    """Create Health Facility"""
    new_facility = body.model_dump()
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


# /api/facilities/<string:health_facility_name> [GET]
@api_facilities.get(
    "/<string:health_facility_name>", responses={200: HealthFacilityModel}
)
def get_facility(path: FacilityNamePath):
    """Get Health Facility"""
    facility = crud.read(HealthFacilityOrm, name=path.health_facility_name)
    if facility is None:
        return abort(
            404, description=f"Facility ({path.health_facility_name}) not found."
        )
    return marshal.marshal(facility)


# /api/facilities/<string:health_facility_name>/new_referrals [GET]
@api_facilities.get(
    "/<string:health_facility_name>", responses={200: HealthFacilityNewReferrals}
)
def get_facility_new_referrals(path: FacilityNamePath):
    """Get Health Facility's New Referrals Timestamp"""
    facility = crud.read(HealthFacilityOrm, name=path.health_facility_name)
    if facility is None:
        return abort(
            404, description=f"Facility ({path.health_facility_name}) not found."
        )
    return {"new_referrals": facility.new_referrals}, 200
