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

        json["userId"] = get_jwt_identity()["userId"]
        create_time = get_current_time()
        json["dateReferred"] = create_time
        json["lastEdited"] = create_time
        json["isAssessed"] = False
        json["isCancelled"] = False

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


# /api/referrals/assess/<int:referral_id>
class AssessReferral(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/referrals-assess-update-put.yml",
        methods=["PUT"],
        endpoint="referral_assess",
    )
    def put(referral_id: int):
        referral = crud.read(Referral, id=referral_id)
        if not referral:
            abort(404, message=f"No referral with id {referral_id}")

        if not referral.isAssessed:
            referral.isAssessed = True
            referral.lastEdited = get_current_time()
            data.db_session.commit()
            data.db_session.refresh(referral)

        return marshal.marshal(referral), 201


# /api/referrals/cancel-status-switch/<int:referral_id>
class ReferralCancelStatus(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/referrals-cancel-update-put.yml",
        methods=["PUT"],
        endpoint="referral_cancel_status",
    )
    def put(referral_id: int):
        if not crud.read(Referral, id=referral_id):
            abort(404, message=f"No referral with id {referral_id}")

        request_body = request.get_json(force=True)

        error = referrals.validate_cancel_put_request(request_body)
        if error:
            abort(400, message=error)
        
        # If the inbound JSON contains a `base` field then we need to check if it is the
        # same as the `lastEdited` field of the existing referral. If it is then that
        # means that the referral has not been edited on the server since this inbound
        # referral was last synced and we can apply the changes. If they are not equal,
        # then that means the referral has been edited on the server after it was last
        # synced with the client. In these cases, we reject the changes for the client.
        #
        # You can think of this like aborting a git merge due to conflicts.
        base = request_body.get("base")
        if base:
            last_edited = crud.read(Referral, id=referral_id).lastEdited
            if base != last_edited:
                abort(409, message="unable to merge changes, conflict detected")
            
            # Delete the `base` field once we are done with it as to not confuse the
            # ORM as there is no "base" column in the database for referrals.
            del request_body["base"]

        if not request_body["isCancelled"]:
            request_body["cancelReason"] = None
        crud.update(Referral, request_body, id=referral_id)
        referral = crud.read(Referral, id=referral_id)

        # Update the referral's lastEdited timestamp only if there was no `base` field
        # in the request JSON. If there was then that means that this edit happened some
        # time in the past and is just being synced. In this case we want to keep the
        # `lastEdited` value which is present in the request.
        if not base:
            referral.lastEdited = get_current_time()
            data.db_session.commit()
            data.db_session.refresh(referral)  # Need to refresh the referral after commit

        return marshal.marshal(referral)


# /api/referrals/not_attend/<int:referral_id>
class ReferralNotAttend(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/referrals-not-attend-update-put.yml",
        methods=["PUT"],
        endpoint="referral_not_attend",
    )
    def put(referral_id: int):
        if not crud.read(Referral, id=referral_id):
            abort(404, message=f"No referral with id {referral_id}")

        request_body = request.get_json(force=True)

        error = referrals.validate_not_attend_put_request(request_body)
        if error:
            abort(400, message=error)

        request_body["notAttended"] = True
        request_body["dateNotAttended"] = get_current_time()

        crud.update(Referral, request_body, id=referral_id)

        new_record = crud.read(Referral, id=referral_id)

        return marshal.marshal(new_record)
