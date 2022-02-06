from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

import api.util as util
import data
import data.crud as crud
import data.marshal as marshal
from models import FollowUp, Reading
from utils import get_current_time
from validation import assessments


# /api/assessments
class Root(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/assessments-post.yml",
        methods=["POST"],
        endpoint="assessments",
    )
    def post():
        json = request.get_json(force=True)

        # Populate the dateAssessed and healthCareWorkerId fields of the followup
        json["dateAssessed"] = get_current_time()
        user = util.current_user()
        json["healthcareWorkerId"] = user.id

        error_message = assessments.validate(json)
        if error_message is not None:
            abort(400, message=error_message)

        assessment = marshal.unmarshal(FollowUp, json)

        crud.create(assessment)

        return assessment.id, 201

    @staticmethod
    @jwt_required
    def get():
        follow_ups = crud.read_all(FollowUp)
        return [marshal.marshal(f) for f in follow_ups]


# /api/assessments/<int:assessment_id>
class SingleAssessment(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/single-assessment-get.yml",
        methods=["GET"],
        endpoint="single_assessment",
    )
    def get(assessment_id: int):
        follow_up = crud.read(FollowUp, id=assessment_id)
        if not follow_up:
            abort(404, message=f"No assessment with id {id}")

        return marshal.marshal(follow_up)


# /api/assessmentUpdate/<int:assessment_id>
class UpdateAssessment(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/assessments-update-post.yml",
        methods=["POST"],
        endpoint="assessmentUpdate",
    )
    def post(assessment_id: int):
        if not assessment_id:
            abort(404, message=f"Assessment id is required")
        json = request.get_json(force=True)

        json["dateAssessed"] = get_current_time()

        # get current UserID
        user = util.current_user()
        json["healthcareWorkerId"] = user.id

        assessment = crud.read(FollowUp, id=assessment_id)
        if not assessment:
            abort(404, message=f"No assessment with id {assessment_id}")

        json["readingId"] = assessment.readingId

        error_message = assessments.validate(json)
        if error_message is not None:
            abort(400, message=error_message)

        crud.update(FollowUp, json, id=assessment.id)

        if assessment.reading.referral:
            assessment.reading.referral.isAssessed = True
            data.db_session.commit()

        return assessment.id, 201
