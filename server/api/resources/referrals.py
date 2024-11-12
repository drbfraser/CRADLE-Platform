import time

from flasgger import swag_from
from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource, abort

import data
from api import util
from data import crud, marshal
from models import HealthFacility, Patient, Referral
from service import assoc, serialize, view
from utils import get_current_time
from validation.referrals import (
    CancelStatusValidator,
    NotAttendValidator,
    ReferralEntityValidator,
)
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
            referral_pydantic_model = ReferralEntityValidator.validate(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        new_referral = referral_pydantic_model.model_dump()
        new_referral = util.filterPairsWithNone(new_referral)

        healthFacility = crud.read(
            HealthFacility,
            healthFacilityName=new_referral["referralHealthFacilityName"],
        )

        if not healthFacility:
            abort(400, message="Health facility does not exist")
        else:
            UTCTime = str(round(time.time() * 1000))
            crud.update(
                HealthFacility,
                {"newReferrals": UTCTime},
                True,
                healthFacilityName=new_referral["referralHealthFacilityName"],
            )

        if "userId" not in new_referral:
            new_referral["userId"] = get_jwt_identity()["userId"]

        patient = crud.read(Patient, patientId=new_referral["patientId"])

        if not patient:
            abort(400, message="Patient does not exist")

        referral = marshal.unmarshal(Referral, new_referral)

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
        referral = crud.read(Referral, id=referral_id)
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
        referral = crud.read(Referral, id=referral_id)
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
        if not crud.read(Referral, id=referral_id):
            abort(404, message=f"No referral with id {referral_id}")

        request_body = request.get_json(force=True)

        try:
            cancel_status_pydantic_model = CancelStatusValidator.validate(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        cancel_status_model_dump = cancel_status_pydantic_model.model_dump()

        if not cancel_status_model_dump["isCancelled"]:
            cancel_status_model_dump["cancelReason"] = None
            cancel_status_model_dump["dateCancelled"] = None
        else:
            cancel_status_model_dump["dateCancelled"] = get_current_time()

        crud.update(Referral, cancel_status_model_dump, id=referral_id)

        referral = crud.read(Referral, id=referral_id)
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
        if not crud.read(Referral, id=referral_id):
            abort(404, message=f"No referral with id {referral_id}")

        request_body = request.get_json(force=True)

        try:
            not_attend_pydantic_model = NotAttendValidator.validate(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        not_attend_model_dump = not_attend_pydantic_model.model_dump()

        referral = crud.read(Referral, id=referral_id)
        if not referral.notAttended:
            referral.notAttended = True
            referral.notAttendReason = not_attend_model_dump["notAttendReason"]
            referral.dateNotAttended = get_current_time()
            data.db_session.commit()
            data.db_session.refresh(referral)

        return marshal.marshal(referral)
