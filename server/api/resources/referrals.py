import time
from math import floor
from flasgger import swag_from
from flask import request
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from flask_restful import Resource, abort

import api.util as util
import data.crud as crud
import data.marshal as marshal
import service.assoc as assoc
import service.view as view
from models import HealthFacility, Reading, Referral
from validation import referrals
import service.serialize as serialize


# /api/referrals
class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/referrals-get.yml", methods=["GET"], endpoint="referrals"
    )
    def get():
        user = get_jwt_identity()

        params = util.get_query_params(request)
        if params.get("health_facility") and params["health_facility"] == "default":
            params["health_facility"] = user["healthFacilityName"]

        referrals = view.referral_view(user, **params)

        return [serialize.serialize_referral(r) for r in referrals]

    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/referrals-post.yml",
        methods=["POST"],
        endpoint="referrals",
    )
    def post():
        json = request.get_json(force=True)
        error_message = referrals.validate(json)
        if error_message is not None:
            abort(400, message=error_message)

        reading = crud.read(Reading, readingId=json["readingId"])
        healthFacility = crud.read(
            HealthFacility, healthFacilityName=json["referralHealthFacilityName"]
        )

        if crud.read(Referral, readingId=json["readingId"]):
            abort(400, message="A referral has already been created for that reading")

        if not reading:
            abort(400, message="Reading ID refers to a non-existent reading")

        if not healthFacility:
            abort(400, message="Health facility does not exist")

        json["patientId"] = reading.patientId
        json["userId"] = get_jwt_identity()["userId"]
        json["dateReferred"] = floor(time.time())
        json["isAssessed"] = False

        referral = marshal.unmarshal(Referral, json)
        crud.create(referral, refresh=True)

        # Creating a referral also associates the corresponding patient to the health
        # facility they were referred to.
        patient = referral.patient
        facility = referral.healthFacility
        if not assoc.has_association(patient, facility):
            assoc.associate(patient, facility=facility)

        return marshal.marshal(referral), 201


# /api/referrals/<int:referral_id>
class SingleReferral(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-referral-get.yml",
        methods=["GET"],
        endpoint="single_referral",
    )
    def get(referral_id: int):
        referral = crud.read(Referral, id=referral_id)
        if not referral:
            abort(404, message=f"No referral with id {id}")

        return marshal.marshal(referral)
