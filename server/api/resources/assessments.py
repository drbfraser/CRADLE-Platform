from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from pydantic import BaseModel, Field

from data import crud, marshal
from models import AssessmentOrm
from validation.assessments import AssessmentValidator

api_assessments = APIBlueprint(
    name="assessments",
    import_name=__name__,
    url_prefix="/assessments",
)


class AssessmentsPath(BaseModel):
    assessment_id: str = Field(..., description="Assessment ID.")


# /api/assessments [GET]
@api_assessments.get("")
def get_all_assessments():
    assessments = crud.read_all(AssessmentOrm)
    return [marshal.marshal(assessment) for assessment in assessments]


# /api/assessments [POST]
@api_assessments.post("")
def create_assessment(body: AssessmentValidator):
    assessment_dict = body.model_dump()
    assessment = marshal.unmarshal(AssessmentOrm, assessment_dict)

    crud.create(assessment)

    return assessment_dict, 201


# /api/assessments/<string:assessment_id> [GET]
@api_assessments.get("/<string:assessment_id>")
def get_assessment(path: AssessmentsPath):
    assessment_id = path.assessment_id
    assessment = crud.read(AssessmentOrm, id=assessment_id)
    if assessment is None:
        return abort(404, message=f"No assessment with id: {id}")

    return marshal.marshal(assessment)


# /api/assessments/<string:assessment_id> [PUT]
@api_assessments.put("/<string:assessment_id>")
def update_assessment(path: AssessmentsPath, body: AssessmentValidator):
    assessment_id = path.assessment_id

    old_assessment = crud.read(AssessmentOrm, id=assessment_id)
    if old_assessment is None:
        return abort(404, message=f"No assessment with id: {assessment_id}")

    """ 
    TODO: We should probably reconsider how we are handling updating assessments.
    Rather than overwriting the old assessment, we should probably be recording 
    in some way that this is a revision?
    """

    update_assessment_dict = body.model_dump()
    update_assessment = marshal.unmarshal(AssessmentOrm, update_assessment_dict)
    crud.update(AssessmentOrm, update_assessment, id=assessment_id)

    return update_assessment_dict, 200
