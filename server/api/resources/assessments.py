from flasgger import swag_from
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort

from api import util
from common import commonUtil
from data import crud, marshal
from models import FollowUp
from utils import get_current_time
from validation.assessments import AssessmentValidator
from validation.validation_exception import ValidationExceptionError


# /api/assessments
class Root(Resource):
    @staticmethod
    @jwt_required()
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
            assessment_pydantic_model = AssessmentValidator.validate(json)
        except ValidationExceptionError as e:
            abort(400, message=str(e))
        new_assessment = assessment_pydantic_model.model_dump()
        new_assessment = commonUtil.filterNestedAttributeWithValueNone(
            new_assessment,
        )

        assessment = marshal.unmarshal(FollowUp, new_assessment)

        crud.create(assessment)

        return assessment.id, 201

    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/assessments-get.yml",
        methods=["GET"],
        endpoint="assessments",
    )
    def get():
        follow_ups = crud.read_all(FollowUp)
        return [marshal.marshal(f) for f in follow_ups]


# /api/assessments/<string:assessment_id>
class SingleAssessment(Resource):
    @staticmethod
    @jwt_required()
    @swag_from(
        "../../specifications/single-assessment-get.yml",
        methods=["GET"],
        endpoint="single_assessment",
    )
    def get(assessment_id: str):
        follow_up = crud.read(FollowUp, id=assessment_id)
        if not follow_up:
            abort(404, message=f"No assessment with id {id}")

        return marshal.marshal(follow_up)

    @staticmethod
    @jwt_required()
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

        assessment = crud.read(FollowUp, id=assessment_id)
        if not assessment:
            abort(404, message=f"No assessment with id {assessment_id}")

        try:
            assessment_pydantic_model = AssessmentValidator.validate(json)
        except ValidationExceptionError as e:
            abort(400, message=str(e))

        update_assessment = assessment_pydantic_model.model_dump()
        update_assessment = commonUtil.filterNestedAttributeWithValueNone(
            update_assessment,
        )
        crud.update(FollowUp, update_assessment, id=assessment.id)

        return assessment.id, 200
