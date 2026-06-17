import time

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common import user_utils
from common.api_utils import ReadingIdPath
from data import orm_serializer
from models import HealthFacilityOrm, PatientOrm, ReadingOrm, ReferralOrm
from service import assoc, invariant
from validation.readings import ReadingModel

# /api/readings
api_readings = APIBlueprint(
    name="readings",
    import_name=__name__,
    url_prefix="/readings",
    abp_tags=[Tag(name="Readings", description="")],
    abp_security=[{"jwt": []}],
)


# /api/readings [POST]
@api_readings.post("", responses={201: ReadingModel})
def create_new_reading(body: ReadingModel):
    """Create New Reading"""
    if crud.read(PatientOrm, id=body.patient_id) is None:
        return abort(404, description=f"No Patient found with ID: {body.patient_id}")

    current_user = user_utils.get_current_user_from_jwt()
    user_id = current_user["id"]
    body.user_id = user_id

    new_reading_dict = body.model_dump()
    if body.referral is not None:
        health_facility = crud.read(
            HealthFacilityOrm,
            name=body.referral.health_facility_name,
        )
        if health_facility is None:
            return abort(404, description="Health facility does not exist")
        UTCTime = str(round(time.time() * 1000))
        crud.update(
            HealthFacilityOrm,
            {"new_referrals": UTCTime},
            True,
            name=body.referral.health_facility_name,
        )

        referral = orm_serializer.unmarshal(ReferralOrm, body.referral.model_dump())
        crud.create(referral, refresh=True)

        patient = referral.patient
        facility = referral.health_facility
        if not assoc.has_association(patient, facility):
            assoc.associate(patient, facility=facility)
        del new_reading_dict["referral"]

    reading = orm_serializer.unmarshal(ReadingOrm, new_reading_dict)

    if crud.read(ReadingOrm, id=reading.id):
        return abort(409, description=f"A reading already exists with id: {reading.id}")

    invariant.resolve_reading_invariants(reading)
    crud.create(reading, refresh=True)
    return orm_serializer.marshal(reading), 201


# /api/readings/<string:reading_id> [GET]
@api_readings.get("/<string:reading_id>", responses={200: ReadingModel})
def get_reading(path: ReadingIdPath):
    """Get Reading"""
    reading = crud.read(ReadingOrm, id=path.reading_id)
    if reading is None:
        return abort(404, description=f"No reading with ID: {path.reading_id}")
    return orm_serializer.marshal(reading)
