import time

from flasgger import swag_from
from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource, abort

import data
from api import util
from data import crud, marshal
from models import HealthFacilityOrm, PatientOrm, ReferralOrm
from service import assoc, serialize, view
from utils import get_current_time
from validation.referrals import CancelStatus, NotAttend, ReferralEntity
from validation.validation_exception import ValidationExceptionError


# /api/referrals
class Root(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/referrals-get.yml",
        methods=["GET"],
        endpoint="referrals",
    )
    def get():
        user = get_jwt_identity()

        params = util.get_query_params(request)
        if params.get("health_facilities") and "default" in params["health_facilities"]:
            params["health_facilities"].append(user["healthFacilityName"])

        referrals = view.referral_list_view(user, **params)
        return serialize.serialize_referral_list(referrals)

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/referrals-post.yml",
        methods=["POST"],
        endpoint="referrals",
    )
    def post():
        request_body = request.get_json(force=True)

        try:
            ReferralEntity.validate(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        healthFacility = crud.read(
            HealthFacilityOrm,
            healthFacilityName=request_body["referralHealthFacilityName"],
        )

        if not healthFacility:
            abort(400, message="Health facility does not exist")
        else:
            UTCTime = str(round(time.time() * 1000))
            crud.update(
                HealthFacilityOrm,
                {"newReferrals": UTCTime},
                True,
                healthFacilityName=request_body["referralHealthFacilityName"],
            )

        if "userId" not in request_body:
            request_body["userId"] = get_jwt_identity()["userId"]

        patient = crud.read(PatientOrm, patientId=request_body["patientId"])
        if not patient:
            abort(400, message="Patient does not exist")

        referral = marshal.unmarshal(ReferralOrm, request_body)

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
    @jwt_required()
    @swag_from(
        "../../specifications/single-referral-get.yml",
        methods=["GET"],
        endpoint="single_referral",
    )
    def get(referral_id: int):
        referral = crud.read(ReferralOrm, id=referral_id)
        if not referral:
            abort(404, message=f"No referral with id {id}")

        return marshal.marshal(referral)


# /api/referrals/assess/<string:referral_id>
class AssessReferral(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/referrals-assess-update-put.yml",
        methods=["PUT"],
        endpoint="referral_assess",
    )
    def put(referral_id: str):
        referral = crud.read(ReferralOrm, id=referral_id)
        if not referral:
            abort(404, message=f"No referral with id {referral_id}")

        if not referral.isAssessed:
            referral.isAssessed = True
            referral.dateAssessed = get_current_time()
            data.db_session.commit()
            data.db_session.refresh(referral)

        return marshal.marshal(referral), 201


# /api/referrals/cancel-status-switch/<string:referral_id>
class ReferralCancelStatus(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/referrals-cancel-update-put.yml",
        methods=["PUT"],
        endpoint="referral_cancel_status",
    )
    def put(referral_id: str):
        if not crud.read(ReferralOrm, id=referral_id):
            abort(404, message=f"No referral with id {referral_id}")

        request_body = request.get_json(force=True)

        try:
            CancelStatus.validate_cancel_put_request(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        if not request_body["isCancelled"]:
            request_body["cancelReason"] = None
            request_body["dateCancelled"] = None
        else:
            request_body["dateCancelled"] = get_current_time()

        crud.update(ReferralOrm, request_body, id=referral_id)

        referral = crud.read(ReferralOrm, id=referral_id)
        data.db_session.commit()
        data.db_session.refresh(referral)

        return marshal.marshal(referral)


# /api/referrals/not-attend/<string:referral_id>
class ReferralNotAttend(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/referrals-not-attend-update-put.yml",
        methods=["PUT"],
        endpoint="referral_not_attend",
    )
    def put(referral_id: str):
        if not crud.read(ReferralOrm, id=referral_id):
            abort(404, message=f"No referral with id {referral_id}")

        request_body = request.get_json(force=True)

        try:
            NotAttend.validate_not_attend_put_request(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        referral = crud.read(ReferralOrm, id=referral_id)
        if not referral.notAttended:
            referral.notAttended = True
            referral.notAttendReason = request_body["notAttendReason"]
            referral.dateNotAttended = get_current_time()
            data.db_session.commit()
            data.db_session.refresh(referral)

        return marshal.marshal(referral)
