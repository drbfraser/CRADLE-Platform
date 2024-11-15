import time

from flasgger import swag_from
from flask import request
from flask_restful import Resource, abort

from api import util
from common import user_utils
from data import crud, marshal
from models import HealthFacilityOrm, PatientOrm, ReadingOrm, ReferralOrm
from service import assoc, invariant
from validation.readings import ReadingValidator


# /api/readings
class Root(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/readings-post.yml",
        methods=["POST"],
        endpoint="readings",
    )
    def post():
        json = request.get_json(force=True)

        try:
            reading_pydantic_model = ReadingValidator.validate(json)
        except Exception as e:
            abort(400, message=str(e))
            return None

        new_reading = reading_pydantic_model.model_dump()
        new_reading = util.filterPairsWithNone(new_reading)

        if not crud.read(PatientOrm, id=new_reading["patient_id"]):
            abort(400, message="Patient does not exist")
            return None

        current_user = user_utils.get_current_user_from_jwt()
        user_id = current_user["id"]

        new_reading["user_id"] = user_id

        if "referral" in new_reading:
            health_facility = crud.read(
                HealthFacilityOrm,
                name=new_reading["referral"]["health_facility_name"],
            )

            if not health_facility:
                abort(400, message="Health facility does not exist")
                return None
            UTCTime = str(round(time.time() * 1000))
            crud.update(
                HealthFacilityOrm,
                {"new_referrals": UTCTime},
                True,
                name=new_reading["referral"]["health_facility_name"],
            )

            referral = marshal.unmarshal(ReferralOrm, new_reading["referral"])
            crud.create(referral, refresh=True)

            patient = referral.patient
            facility = referral.health_facility
            if not assoc.has_association(patient, facility):
                assoc.associate(patient, facility=facility)
            del new_reading["referral"]

        reading = marshal.unmarshal(ReadingOrm, new_reading)

        if crud.read(ReadingOrm, id=reading.id):
            abort(409, message=f"A reading already exists with id: {reading.id}")
            return None

        invariant.resolve_reading_invariants(reading)
        crud.create(reading, refresh=True)
        return marshal.marshal(reading), 201


# /api/readings/<string:id>
class SingleReading(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/single-reading-get.yml",
        methods=["GET"],
        endpoint="single_reading",
    )
    def get(reading_id: str):
        reading = crud.read(ReadingOrm, readingId=reading_id)
        if not reading:
            abort(404, message=f"No reading with id {reading_id}")

        return marshal.marshal(reading)
