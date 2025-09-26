from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from common.api_utils import AssessmentIdPath
from common.user_utils import get_current_user_from_jwt
from data import marshal
import data.db_operations as crud
from models import AssessmentOrm
from validation.assessments import (
    AssessmentList,
    AssessmentPostBody,
    AssessmentPutBody,
    AssessmentResponse,
)

# /api/assessments
api_assessments = APIBlueprint(
    name="assessments",
    import_name=__name__,
    url_prefix="/assessments",
    abp_tags=[Tag(name="Assessments", description="")],
    abp_security=[{"jwt": []}],
)


# /api/assessments [GET]
@api_assessments.get("", responses={200: AssessmentList})
def get_all_assessments():
    """Get All Assessments"""
    assessments = crud.read_all(AssessmentOrm)
    return [marshal.marshal(assessment) for assessment in assessments], 200


# /api/assessments [POST]
@api_assessments.post("", responses={201: AssessmentResponse})
def create_new_assessment(body: AssessmentPostBody):
    """Create New Assessment"""
    if body.id is not None and crud.read(AssessmentOrm, id=body.id):
        return abort(409, description=f"Assessment with ID: {body.id} already exists.")
    if body.healthcare_worker_id is None:
        body.healthcare_worker_id = get_current_user_from_jwt()["id"]
    assessment = marshal.unmarshal(AssessmentOrm, body.model_dump())
    crud.create(assessment, refresh=True)
    return marshal.marshal(assessment), 201


# /api/assessments/<string:assessment_id> [GET]
@api_assessments.get("/<string:assessment_id>", responses={200: AssessmentResponse})
def get_assessment(path: AssessmentIdPath):
    """Get Assessment"""
    assessment = crud.read(AssessmentOrm, id=path.assessment_id)
    if assessment is None:
        return abort(404, description=f"No assessment with ID: {path.assessment_id}")
    return marshal.marshal(assessment)


# /api/assessments/<string:assessment_id> [PUT]
@api_assessments.put("/<string:assessment_id>", responses={200: AssessmentResponse})
def update_assessment(path: AssessmentIdPath, body: AssessmentPutBody):
    """Update Assessment"""
    if crud.read(AssessmentOrm, id=path.assessment_id) is None:
        return abort(404, description=f"No assessment with id: {path.assessment_id}")
    if body.id != path.assessment_id:
        return abort(400, description="Cannot change ID.")

    """ 
    TODO: We should probably reconsider how we are handling updating assessments.
    Rather than overwriting the old assessment, we should probably be creating a 
    new assessment and recording in some way that this is a revision, rather than
    overwriting the old assessment entirely. 
    """

    update_assessment_dict = body.model_dump()
    crud.update(AssessmentOrm, update_assessment_dict, id=body.id)

    updated_assessment = crud.read(AssessmentOrm, id=body.id)

    return marshal.marshal(updated_assessment), 200
