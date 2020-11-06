from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import data.crud as crud
import data.marshal as marshal
import service.assoc as assoc
import service.view as view
from models import Referral
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
        user = util.current_user()
        limit = util.query_param_limit(request, name="limit")
        page = util.query_param_page(request, name="page")
        sort_by = util.query_param_sortBy(request, name="sortBy")
        sort_dir = util.query_param_sortDir(request, name="sortDir")
        search = util.query_param_search(request, name="search")

        referrals = view.referral_view_for_user(
            user,
            limit=limit,
            page=page,
            sortBy=sort_by,
            sortDir=sort_dir,
            search=search,
        )

        roles = [r.name.value for r in user.roleIds]
        if "CHO" in roles:
            return [marshal.marshal(r) for p in referrals]

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

        referral = marshal.unmarshal(Referral, json)
        crud.create(referral)

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
