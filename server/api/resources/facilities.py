import time
from typing import Optional

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from pydantic import BaseModel, Field

from api.decorator import roles_required
from data import crud, marshal
from enums import RoleEnum
from models import HealthFacilityOrm
from validation.facilities import FacilityValidator

# /api/facilities

api_facilities = APIBlueprint(
    name="facilities",
    import_name=__name__,
    url_prefix="/facilities",
)


class FacilitiesGetQuery(BaseModel):
    simplified: Optional[bool] = Field(
        ..., description="If true, only the names of facilities will be returned."
    )


# /api/facilities [GET]
@api_facilities.get("")
def get_all_facilities(query: FacilitiesGetQuery):
    facilities = crud.read_all(HealthFacilityOrm)
    if query.simplified:
        # If responding to a "simplified" request, only return the names of the
        # facilities and no other information.
        return [f.name for f in facilities]
    # Otherwise, return all information about the health facilities
    return [marshal.marshal(f) for f in facilities]


# /api/facilities [POST]
@api_facilities.post("")
@roles_required([RoleEnum.ADMIN])
def create_facility(body: FacilityValidator):
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


class GetFacilityPath(BaseModel):
    facility_name: str


class GetFacilityQuery(BaseModel):
    new_referrals: Optional[bool] = Field(
        False,
        description="If true, will only return the timestamp of new_referrals of the facility.",
    )


# /api/facilities/<str:facility_name> [GET]
api_facilities.get("/<str:facility_name>")


def get_facility(path: GetFacilityPath, query: GetFacilityQuery):
    facility_name = path.facility_name
    facility = crud.read(HealthFacilityOrm, name=facility_name)
    if facility is None:
        return abort(404, message=f"Facility ({facility_name}) not found.")

    if query.new_referrals:
        if facility is not None:
            new_referrals = facility.new_referrals
        # If responding to a "new_referrals" request, only return the timestamp of new_referrals of that facility
        return new_referrals
    # Otherwise, return all information about the health facilities
    return marshal.marshal(facility)
