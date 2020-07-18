from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import data
import data.crud as crud
import data.marshal as marshal
from models import FollowUp


# /api/assessments
class Root(Resource):
    @staticmethod
    @jwt_required
    def post():
        json = request.get_json(force=True)
        # TODO: Validate request
        follow_up = marshal.unmarshal(FollowUp, json)
        crud.create(follow_up)

        # Creating an assessment also marks any referral attached to the associated
        # reading as "assessed"
        if follow_up.reading.referral:
            follow_up.reading.referral.isAssessed = True
            data.db_session.commit()

        return marshal.marshal(follow_up), 201


# /api/assessments/<int:id>
class SingleAssessment(Resource):
    @staticmethod
    @jwt_required
    def get(assessment_id: int):
        follow_up = crud.read(FollowUp, id=assessment_id)
        if not follow_up:
            abort(404, message=f"No assessment with id {id}")

        return marshal.marshal(follow_up)
