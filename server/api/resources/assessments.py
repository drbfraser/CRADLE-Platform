from flasgger import swag_from
from flask import request
from flask_restful import Resource, abort

from api import util
from data import crud, marshal
from models import FollowUpOrm
from utils import get_current_time
from validation import assessments


# /api/assessments
class Root(Resource):
    @staticmethod
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

        try:
            assessments.validate(json)
        except Exception as e:
            abort(400, message=str(e))

        assessment = marshal.unmarshal(FollowUpOrm, json)

        crud.create(assessment)

        return assessment.id, 201

    @staticmethod
    @swag_from(
        "../../specifications/assessments-get.yml",
        methods=["GET"],
        endpoint="assessments",
    )
    def get():
        follow_ups = crud.read_all(FollowUpOrm)
        return [marshal.marshal(f) for f in follow_ups]


# /api/assessments/<string:assessment_id>
class SingleAssessment(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/single-assessment-get.yml",
        methods=["GET"],
        endpoint="single_assessment",
    )
    def get(assessment_id: str):
        follow_up = crud.read(FollowUpOrm, id=assessment_id)
        if not follow_up:
            abort(404, message=f"No assessment with id {id}")

        return marshal.marshal(follow_up)

    @staticmethod
    @swag_from(
        "../../specifications/single-assessment-put.yml",
        methods=["PUT"],
        endpoint="single_assessment",
    )
    def put(assessment_id: str):
        if not assessment_id:
            abort(404, message="Assessment id is required")
        json = request.get_json(force=True)

        json["dateAssessed"] = get_current_time()

        # get current UserID
        user = util.current_user()
        json["healthcareWorkerId"] = user.id

        assessment = crud.read(FollowUpOrm, id=assessment_id)
        if not assessment:
            abort(404, message=f"No assessment with id {assessment_id}")

        try:
            assessments.validate(json)
        except Exception as e:
            abort(400, message=str(e))

        crud.update(FollowUpOrm, json, id=assessment.id)

        return assessment.id, 200
