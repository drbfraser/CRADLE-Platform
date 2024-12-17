from flasgger import swag_from
from flask_restful import Resource, abort

from common import api_utils, commonUtil, user_utils
from data import crud, marshal
from models import AssessmentOrm
from utils import get_current_time
from validation.assessments import AssessmentValidator
from validation.validation_exception import ValidationExceptionError


# /api/assessments
class Root(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/assessments-post.yml",
        methods=["POST"],
        endpoint="assessments",
    )
    def post():
        request_body = api_utils.get_request_body()

        # Populate the date_assessed and healthCareWorkerId fields of the followup
        request_body["date_assessed"] = get_current_time()
        current_user = user_utils.get_current_user_from_jwt()
        request_body["healthcare_worker_id"] = current_user["id"]

        try:
            assessment_pydantic_model = AssessmentValidator.validate(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))
        new_assessment = assessment_pydantic_model.model_dump()
        new_assessment = commonUtil.filterNestedAttributeWithValueNone(
            new_assessment,
        )

        assessment = marshal.unmarshal(AssessmentOrm, new_assessment)

        crud.create(assessment)

        return assessment.id, 201

    @staticmethod
    @swag_from(
        "../../specifications/assessments-get.yml",
        methods=["GET"],
        endpoint="assessments",
    )
    def get():
        assessments = crud.read_all(AssessmentOrm)
        return [marshal.marshal(assessment) for assessment in assessments]


# /api/assessments/<string:assessment_id>
class SingleAssessment(Resource):
    @staticmethod
    @swag_from(
        "../../specifications/single-assessment-get.yml",
        methods=["GET"],
        endpoint="single_assessment",
    )
    def get(assessment_id: str):
        assessment = crud.read(AssessmentOrm, id=assessment_id)
        if not assessment:
            abort(404, message=f"No assessment with id {id}")
            return None

        return marshal.marshal(assessment)

    @staticmethod
    @swag_from(
        "../../specifications/single-assessment-put.yml",
        methods=["PUT"],
        endpoint="single_assessment",
    )
    def put(assessment_id: str):
        if not assessment_id:
            abort(404, message="Assessment id is required")
        request_body = api_utils.get_request_body()

        request_body["date_assessed"] = get_current_time()

        # get current user id
        current_user = user_utils.get_current_user_from_jwt()
        request_body["healthcare_worker_id"] = current_user["id"]

        assessment = crud.read(AssessmentOrm, id=assessment_id)
        if not assessment:
            abort(404, message=f"No assessment with id {assessment_id}")
            return None

        try:
            assessment_pydantic_model = AssessmentValidator.validate(request_body)
        except ValidationExceptionError as e:
            abort(400, message=str(e))
            return None

        update_assessment = assessment_pydantic_model.model_dump()
        update_assessment = commonUtil.filterNestedAttributeWithValueNone(
            update_assessment,
        )
        crud.update(AssessmentOrm, update_assessment, id=assessment.id)

        return assessment.id, 200
