from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from api.authorization import (
    load_authorized_patient_resource,
    require_patient_access,
    scope_patient_query,
)
from common.api_utils import AssessmentIdPath
from common.user_utils import get_current_user_from_jwt
from data import orm_serializer
from models import AssessmentOrm
from validation.assessments import (
    AssessmentList,
    AssessmentResponse,
    CreateAssessmentRequest,
    UpdateAssessmentRequest,
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
    assessments = crud.read_referrals_or_assessments(
        AssessmentOrm,
        user=get_current_user_from_jwt(),
        scope_query=scope_patient_query,
    )
    return [orm_serializer.marshal(assessment) for assessment in assessments], 200


# /api/assessments [POST]
@api_assessments.post("", responses={201: AssessmentResponse})
def create_new_assessment(body: CreateAssessmentRequest):
    """Create New Assessment"""
    require_patient_access(body.patient_id)
    if body.id is not None and crud.read(AssessmentOrm, id=body.id):
        return abort(409, description=f"Assessment with ID: {body.id} already exists.")
    assessment_data = body.model_dump()
    assessment_data["healthcare_worker_id"] = get_current_user_from_jwt()["id"]
    assessment = orm_serializer.unmarshal(AssessmentOrm, assessment_data)
    crud.create(assessment, refresh=True)
    return orm_serializer.marshal(assessment), 201


# /api/assessments/<string:assessment_id> [GET]
@api_assessments.get("/<string:assessment_id>", responses={200: AssessmentResponse})
def get_assessment(path: AssessmentIdPath):
    """Get Assessment"""
    assessment = load_authorized_patient_resource(AssessmentOrm, path.assessment_id)
    return orm_serializer.marshal(assessment)


# /api/assessments/<string:assessment_id> [PUT]
@api_assessments.put("/<string:assessment_id>", responses={200: AssessmentResponse})
def update_assessment(path: AssessmentIdPath, body: UpdateAssessmentRequest):
    """Update Assessment"""
    assessment = load_authorized_patient_resource(AssessmentOrm, path.assessment_id)
    if body.id != path.assessment_id:
        return abort(400, description="Cannot change ID.")
    if body.patient_id != assessment.patient_id:
        return abort(400, description="Patient ID cannot be changed.")

    """ 
    TODO: We should probably reconsider how we are handling updating assessments.
    Rather than overwriting the old assessment, we should probably be creating a 
    new assessment and recording in some way that this is a revision, rather than
    overwriting the old assessment entirely. 
    """

    update_assessment_dict = body.model_dump()
    crud.update(AssessmentOrm, update_assessment_dict, id=body.id)

    updated_assessment = crud.read(AssessmentOrm, id=body.id)

    return orm_serializer.marshal(updated_assessment), 200
