import time

from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_jwt_extended.utils import get_jwt_identity
from flask_restful import Resource, abort

from api import util
from data import crud, marshal
from models import HealthFacility, Patient, Reading, Referral
from service import assoc, invariant
from validation.readings import ReadingValidator


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
            reading_pydantic_model = ReadingValidator.validate(json)
        except Exception as e:
            abort(400, message=str(e))

        new_reading = reading_pydantic_model.model_dump()
        new_reading = util.filterPairsWithNone(new_reading)

        if not crud.read(Patient, patientId=new_reading["patientId"]):
            abort(400, message="Patient does not exist")

        userId = get_jwt_identity()["userId"]

        new_reading["userId"] = userId

        if "referral" in new_reading:
            healthFacility = crud.read(
                HealthFacility,
                healthFacilityName=new_reading["referral"][
                    "referralHealthFacilityName"
                ],
            )

            if not healthFacility:
                abort(400, message="Health facility does not exist")
            else:
                UTCTime = str(round(time.time() * 1000))
                crud.update(
                    HealthFacility,
                    {"newReferrals": UTCTime},
                    True,
                    healthFacilityName=new_reading["referral"][
                        "referralHealthFacilityName"
                    ],
                )

            referral = marshal.unmarshal(Referral, new_reading["referral"])
            crud.create(referral, refresh=True)

            patient = referral.patient
            facility = referral.healthFacility
            if not assoc.has_association(patient, facility):
                assoc.associate(patient, facility=facility)
            del new_reading["referral"]

        reading = marshal.unmarshal(Reading, new_reading)

        if crud.read(Reading, readingId=reading.readingId):
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
        reading = crud.read(Reading, readingId=reading_id)
        if not reading:
            abort(404, message=f"No reading with id {reading_id}")

        return marshal.marshal(reading)
