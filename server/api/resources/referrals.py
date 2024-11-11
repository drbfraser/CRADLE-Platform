import time
from typing import Any, cast

from flasgger import swag_from
from flask import request
from flask_restful import Resource, abort

import data
from api import util
from data import crud, marshal
from models import HealthFacilityOrm, PatientOrm, ReferralOrm
from service import assoc, serialize, view
from shared.user_utils import UserUtils
from utils import get_current_time
from validation.referrals import CancelStatus, NotAttend, ReferralEntity
from validation.validation_exception import ValidationExceptionError


# /api/referrals
class Root(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/referrals-get.yml",
        methods=["GET"],
        endpoint="referrals",
    )
    def get():
        user_data = UserUtils.get_current_user_from_jwt()

        params = util.get_query_params(request)
        if params.get("health_facilities") and "default" in params["health_facilities"]:
            params["health_facilities"].append(user_data["health_facility_name"])

        user = cast(dict[Any, Any], user_data)
        referrals = view.referral_list_view(user, **params)
        return serialize.serialize_referral_list(referrals)

    @staticmethod
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
            return None

        health_facility_name = request_body["health_facility_name"]
        health_facility = crud.read(
            HealthFacilityOrm,
            name=health_facility_name,
        )

        if not health_facility:
            abort(400, message="Health facility does not exist")
        else:
            UTCTime = str(round(time.time() * 1000))
            crud.update(
                HealthFacilityOrm,
                {"newReferrals": UTCTime},
                True,
                name=health_facility_name,
            )

        if "user_id" not in request_body:
            request_body["user_id"] = UserUtils.get_current_user_from_jwt()["id"]

        patient = crud.read(PatientOrm, id=request_body["patient_id"])
        if not patient:
            abort(400, message="Patient does not exist")
            return None

        referral = marshal.unmarshal(ReferralOrm, request_body)

        crud.create(referral, refresh=True)
        # Creating a referral also associates the corresponding patient to the health
        # facility they were referred to.
        patient = referral.patient
        facility = referral.health_facility
        if not assoc.has_association(patient, facility):
            assoc.associate(patient, facility=facility)

        return marshal.marshal(referral), 201


# /api/referrals/<int:referral_id>
class SingleReferral(Resource):
    @staticmethod
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
    @swag_from(
        "../../specifications/referrals-assess-update-put.yml",
        methods=["PUT"],
        endpoint="referral_assess",
    )
    def put(referral_id: str):
        referral = crud.read(ReferralOrm, id=referral_id)
        if referral is None:
            abort(404, message=f"No referral with id {referral_id}")
            return None

        if not referral.is_assessed:
            referral.is_assessed = True
            referral.date_assessed = get_current_time()
            data.db_session.commit()
            data.db_session.refresh(referral)

        return marshal.marshal(referral), 201


# /api/referrals/cancel-status-switch/<string:referral_id>
class ReferralCancelStatus(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/referrals-cancel-update-put.yml",
        methods=["PUT"],
        endpoint="referral_cancel_status",
    )
    def put(referral_id: str):
        if crud.read(ReferralOrm, id=referral_id) is None:
            abort(404, message=f"No referral with id {referral_id}")
            return None

        request_body = request.get_json(force=True)

        try:
            CancelStatus.validate_cancel_put_request(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        if not request_body["is_cancelled"]:
            request_body["cancel_reason"] = None
            request_body["date_cancelled"] = None
        else:
            request_body["date_cancelled"] = get_current_time()

        crud.update(ReferralOrm, request_body, id=referral_id)

        referral = crud.read(ReferralOrm, id=referral_id)
        data.db_session.commit()
        data.db_session.refresh(referral)

        return marshal.marshal(referral)


# /api/referrals/not-attend/<string:referral_id>
class ReferralNotAttend(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/referrals-not-attend-update-put.yml",
        methods=["PUT"],
        endpoint="referral_not_attend",
    )
    def put(referral_id: str):
        referral = crud.read(ReferralOrm, id=referral_id)
        if referral is None:
            abort(404, message=f"No referral with id {referral_id}")
            return None

        request_body = request.get_json(force=True)

        try:
            NotAttend.validate_not_attend_put_request(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))
            return None

        if not referral.not_attended:
            referral.not_attended = True
            referral.not_attend_reason = request_body["not_attend_reason"]
            referral.date_not_attended = get_current_time()
            data.db_session.commit()
            data.db_session.refresh(referral)

        return marshal.marshal(referral)
