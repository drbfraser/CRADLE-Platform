import time
from math import floor
from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, abort

import api.util as util
import data
import data.crud as crud
import data.marshal as marshal
from utils import get_current_time
import service.assoc as assoc
import service.view as view
from models import HealthFacility, Referral, Patient
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
        if params.get("health_facilities") and "default" in params["health_facilities"]:
            params["health_facilities"].append(user["healthFacilityName"])

        referrals = view.referral_list_view(user, **params)
        return serialize.serialize_referral_list(referrals)

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

        healthFacility = crud.read(
            HealthFacility, healthFacilityName=json["referralHealthFacilityName"]
        )

        if not healthFacility:
            abort(400, message="Health facility does not exist")
        else:
            UTCTime = str(round(time.time() * 1000))
            crud.update(
                HealthFacility,
                {"newReferrals": UTCTime},
                True,
                healthFacilityName=json["referralHealthFacilityName"],
            )

        if not "userId" in json:
            json["userId"] = get_jwt_identity()["userId"]
        create_time = get_current_time()
        if not "dateReferred" in json:
            json["dateReferred"] = create_time
        if not "lastEdited" in json:
            json["lastEdited"] = create_time

        patient = crud.read(Patient, patientId=json["patientId"])
        if not patient:
            abort(400, message="Patient does not exist")

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


# /api/referrals/assess/<string:referral_id>
class AssessReferral(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/referrals-assess-update-put.yml",
        methods=["PUT"],
        endpoint="referral_assess",
    )
    def put(referral_id: str):
        referral = crud.read(Referral, id=referral_id)
        if not referral:
            abort(404, message=f"No referral with id {referral_id}")

        if not referral.isAssessed:
            referral.isAssessed = True
            data.db_session.commit()
            data.db_session.refresh(referral)

        return marshal.marshal(referral), 201


# /api/referrals/cancel-status-switch/<string:referral_id>
class ReferralCancelStatus(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/referrals-cancel-update-put.yml",
        methods=["PUT"],
        endpoint="referral_cancel_status",
    )
    def put(referral_id: str):
        if not crud.read(Referral, id=referral_id):
            abort(404, message=f"No referral with id {referral_id}")

        request_body = request.get_json(force=True)

        error = referrals.validate_cancel_put_request(request_body)
        if error:
            abort(400, message=error)

        if not request_body["isCancelled"]:
            request_body["cancelReason"] = None
        crud.update(Referral, request_body, id=referral_id)

        referral = crud.read(Referral, id=referral_id)
        data.db_session.commit()
        data.db_session.refresh(referral)

        return marshal.marshal(referral)


# /api/referrals/not-attend/<string:referral_id>
class ReferralNotAttend(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/referrals-not-attend-update-put.yml",
        methods=["PUT"],
        endpoint="referral_not_attend",
    )
    def put(referral_id: str):
        if not crud.read(Referral, id=referral_id):
            abort(404, message=f"No referral with id {referral_id}")

        request_body = request.get_json(force=True)

        error = referrals.validate_not_attend_put_request(request_body)
        if error:
            abort(400, message=error)

        referral = crud.read(Referral, id=referral_id)
        if not referral.notAttended:
            referral.notAttended = True
            referral.notAttendReason = request_body["notAttendReason"]
            data.db_session.commit()
            data.db_session.refresh(referral)

        return marshal.marshal(referral)
