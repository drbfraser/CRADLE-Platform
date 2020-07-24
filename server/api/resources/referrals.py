from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import data.crud as crud
import data.marshal as marshal
import service.assoc as assoc
import service.view as view
from models import Referral


# /api/referrals
class Root(Resource):
    @staticmethod
    @jwt_required
    def get():
        user = util.current_user()
        referrals = view.referral_view_for_user(user)

        # If the request does not specifically specify "all=true", then only return the
        # referrals which have not been assessed.
        if not util.query_param_bool(request, "all"):
            referrals = [r for r in referrals if not r.isAssessed]

        return [marshal.marshal(r) for r in referrals]

    @staticmethod
    @jwt_required
    def post():
        json = request.get_json(force=True)
        # TODO: Validate request
        referral = marshal.unmarshal(Referral, json)
        crud.create(referral)

        # Creating a referral also associates the corresponding patient to the health
        # facility they were referred to.
        patient = referral.patient
        facility = referral.healthFacility
        if not assoc.has_association(patient, facility):
            assoc.associate(patient, facility=facility)

        return marshal.marshal(referral), 201


# /api/referrals/<int:id>
class SingleReferral(Resource):
    @staticmethod
    @jwt_required
    def get(referral_id: int):
        referral = crud.read(Referral, id=referral_id)
        if not referral:
            abort(404, message=f"No referral with id {id}")

        return marshal.marshal(referral)
