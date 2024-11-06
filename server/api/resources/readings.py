import time

from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_jwt_extended.utils import get_jwt_identity
from flask_restful import Resource, abort

from data import crud, marshal
from models import HealthFacilityOrm, PatientOrm, ReadingOrm, ReferralOrm
from service import assoc, invariant
from validation import readings


# /api/readings
class Root(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/readings-post.yml",
        methods=["POST"],
        endpoint="readings",
    )
    def post():
        json = request.get_json(force=True)

        try:
            readings.validate(json)
        except Exception as e:
            abort(400, message=str(e))

        if not crud.read(PatientOrm, patientId=json["patientId"]):
            abort(400, message="Patient does not exist")

        userId = get_jwt_identity()["userId"]

        json["userId"] = userId

        if "referral" in json:
            healthFacility = crud.read(
                HealthFacilityOrm,
                healthFacilityName=json["referral"]["referralHealthFacilityName"],
            )

            if not healthFacility:
                abort(400, message="Health facility does not exist")
            else:
                UTCTime = str(round(time.time() * 1000))
                crud.update(
                    HealthFacilityOrm,
                    {"newReferrals": UTCTime},
                    True,
                    healthFacilityName=json["referral"]["referralHealthFacilityName"],
                )

            referral = marshal.unmarshal(ReferralOrm, json["referral"])
            crud.create(referral, refresh=True)

            patient = referral.patient
            facility = referral.healthFacility
            if not assoc.has_association(patient, facility):
                assoc.associate(patient, facility=facility)
            del json["referral"]

        reading = marshal.unmarshal(ReadingOrm, json)

        if crud.read(ReadingOrm, readingId=reading.readingId):
            abort(409, message=f"A reading already exists with id: {reading.readingId}")

        invariant.resolve_reading_invariants(reading)
        crud.create(reading, refresh=True)
        return marshal.marshal(reading), 201


# /api/readings/<string:id>
class SingleReading(Resource):
    @staticmethod
    @jwt_required()
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
