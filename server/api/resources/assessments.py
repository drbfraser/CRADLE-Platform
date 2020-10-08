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

        follow_up = marshal.unmarshal(FollowUp, json)

        # Check that reading id which doesn’t reference an existing reading in the database
        reading = crud.read(Reading, readingId=follow_up.readingId)
        if not reading:
            abort(404, message=f"No reading with id {follow_up.readingId}")

        crud.create(follow_up)

        # Creating an assessment also marks any referral attached to the associated
        # reading as "assessed"
        if follow_up.reading.referral:
            follow_up.reading.referral.isAssessed = True
            data.db_session.commit()

        return follow_up.id, 201


# /api/assessments/<int:id>
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


# /api/assessmentUpdate
class UpdateAssessment(Resource):
    @staticmethod
    @jwt_required
    @swag_from(
        "../../specifications/assessments-update-post.yml",
        methods=["POST"],
        endpoint="update_assessment",
    )
    def post():
        json = request.get_json(force=True)

        json["dateAssessed"] = get_current_time()

        # get current UserID
        user = util.current_user()
        json["healthcareWorkerId"] = user.id

        error_message = assessments.validate(json)
        if error_message is not None:
            abort(400, message=error_message)

        follow_up = marshal.unmarshal(FollowUp, json)

        # Check that reading id which doesn’t reference an existing reading in the database
        reading = crud.read(Reading, readingId=follow_up.readingId)
        if not reading:
            abort(404, message=f"No reading with id {follow_up.readingId}")

        updatedAssessment = crud.read(FollowUp, id=json["id"])
        if not updatedAssessment:
            abort(404, message=f"No assessment with id { json['id'] }")

        crud.update(FollowUp, json, id=updatedAssessment.id)

        return updatedAssessment.id, 201
