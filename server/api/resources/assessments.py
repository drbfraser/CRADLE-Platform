from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from common.api_utils import AssessmentIdPath
from common.user_utils import get_current_user_from_jwt
from data import crud, marshal
from models import AssessmentOrm
from validation.assessments import AssessmentValidator

# /api/assessments
api_assessments = APIBlueprint(
    name="assessments",
    import_name=__name__,
    url_prefix="/assessments",
    abp_tags=[Tag(name="Assessments", description="")],
)


# /api/assessments [GET]
@api_assessments.get("")
def get_all_assessments():
    """Get all assessments"""
    assessments = crud.read_all(AssessmentOrm)
    return [marshal.marshal(assessment) for assessment in assessments]


# /api/assessments [POST]
@api_assessments.post("")
def create_assessment(body: AssessmentValidator):
    if body.healthcare_worker_id is None:
        body.healthcare_worker_id = get_current_user_from_jwt()["id"]
    assessment = marshal.unmarshal(AssessmentOrm, body.model_dump())
    crud.create(assessment, refresh=True)
    return marshal.marshal(assessment), 201


# /api/assessments/<string:assessment_id> [GET]
@api_assessments.get("/<string:assessment_id>")
def get_assessment(path: AssessmentIdPath):
    assessment = crud.read(AssessmentOrm, id=path.assessment_id)
    if assessment is None:
        return abort(404, description=f"No assessment with ID: {path.assessment_id}")
    return marshal.marshal(assessment)


# /api/assessments/<string:assessment_id> [PUT]
@api_assessments.put("/<string:assessment_id>")
def update_assessment(path: AssessmentIdPath, body: AssessmentValidator):
    if crud.read(AssessmentOrm, id=path.assessment_id) is None:
        return abort(404, description=f"No assessment with id: {path.assessment_id}")
    if body.id is not None:
        if body.id != path.assessment_id:
            return abort(400, description="Cannot change ID.")
    else:
        body.id = path.assessment_id

    """ 
    TODO: We should probably reconsider how we are handling updating assessments.
    Rather than overwriting the old assessment, we should probably be recording 
    in some way that this is a revision?
    """

    update_assessment_dict = body.model_dump()
    crud.update(AssessmentOrm, update_assessment_dict, id=path.assessment_id)

    updated_assessment = crud.read(AssessmentOrm, id=path.assessment_id)
    return marshal.marshal(updated_assessment), 200
