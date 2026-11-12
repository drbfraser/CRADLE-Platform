import time

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from api.authorization import (
    load_authorized_patient_resource,
    require_patient_access,
    require_referral_action,
)
from common import user_utils
from common.api_utils import ReadingIdPath
from data import orm_serializer
from models import HealthFacilityOrm, PatientOrm, ReadingOrm, ReferralOrm
from service import assoc, invariant
from service.patient_authorization import ReferralAction
from validation.readings import CreateReadingRequest, ReadingResponse

# /api/readings
api_readings = APIBlueprint(
    name="readings",
    import_name=__name__,
    url_prefix="/readings",
    abp_tags=[Tag(name="Readings", description="")],
    abp_security=[{"jwt": []}],
)


# /api/readings [POST]
@api_readings.post("", responses={201: ReadingResponse})
def create_new_reading(body: CreateReadingRequest):
    """Create New Reading"""
    if body.referral is None:
        require_patient_access(body.patient_id)
    else:
        require_referral_action(body.patient_id, ReferralAction.CREATE)
        if body.referral.patient_id != body.patient_id:
            return abort(
                400, description="Referral patient must match the reading patient."
            )

    if crud.read(PatientOrm, id=body.patient_id) is None:
        return abort(404, description=f"No Patient found with ID: {body.patient_id}")

    current_user = user_utils.get_current_user_from_jwt()
    user_id = current_user["id"]
    new_reading_dict = body.model_dump()
    new_reading_dict["user_id"] = user_id
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

        new_referral = body.referral.model_dump()
        new_referral["user_id"] = user_id
        referral = orm_serializer.unmarshal(ReferralOrm, new_referral)
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
@api_readings.get("/<string:reading_id>", responses={200: ReadingResponse})
def get_reading(path: ReadingIdPath):
    """Get Reading"""
    reading = load_authorized_patient_resource(ReadingOrm, path.reading_id)
    return orm_serializer.marshal(reading)
