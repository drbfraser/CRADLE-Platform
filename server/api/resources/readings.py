import time

from flask import abort
from flask_openapi3.blueprint import APIBlueprint

from common import user_utils
from common.api_utils import ReadingIdPath
from data import crud, marshal
from models import HealthFacilityOrm, PatientOrm, ReadingOrm, ReferralOrm
from service import assoc, invariant
from validation.readings import ReadingValidator

api_readings = APIBlueprint(
    name="readings",
    import_name=__name__,
    url_prefix="/readings",
)


# /api/readings [POST]
@api_readings.post("")
def create_reading(body: ReadingValidator):
    if crud.read(PatientOrm, id=body.patient_id) is None:
        return abort(404, message=f"No Patient found with ID: {body.patient_id}")

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
            return abort(404, message="Health facility does not exist")
        UTCTime = str(round(time.time() * 1000))
        crud.update(
            HealthFacilityOrm,
            {"new_referrals": UTCTime},
            True,
            name=body.referral.health_facility_name,
        )

        referral = marshal.unmarshal(ReferralOrm, body.referral.model_dump())
        crud.create(referral, refresh=True)

        patient = referral.patient
        facility = referral.health_facility
        if not assoc.has_association(patient, facility):
            assoc.associate(patient, facility=facility)
        del new_reading_dict["referral"]

    reading = marshal.unmarshal(ReadingOrm, new_reading_dict)

    if crud.read(ReadingOrm, id=reading.id):
        return abort(409, message=f"A reading already exists with id: {reading.id}")

    invariant.resolve_reading_invariants(reading)
    crud.create(reading, refresh=True)
    return marshal.marshal(reading), 201


# /api/readings/<string:reading_id> [GET]
@api_readings.get("/<string:reading_id>")
def get_reading(path: ReadingIdPath):
    reading = crud.read(ReadingOrm, reading_id=path.reading_id)
    if reading is None:
        return abort(404, message=f"No reading with ID: {path.reading_id}")
    return marshal.marshal(reading)
