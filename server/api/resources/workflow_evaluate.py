"""
api resource route, handle serialize, deserialize
call `workflow_rule_evaluate.py` with inputs to begin process

single endpoint
/workflow/evaluate

takes input data, instance id/rule group id
returns a result
"""

from typing import List

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from common.api_utils import (
    WorkflowEvaluatePath,
)
from validation import CradleBaseModel
from validation.workflow_evaluate import (
    WorkflowEvaluateExample,
    WorkflowEvaluateModel,
    WorkflowEvaluateWithClassification,
    WorkflowEvaluateWithSteps,
    WorkflowEvaluateWithStepsAndClassification
)

from service.workflow.workflow_rule_evaluation import WorkflowRuleEvaluationService 

# response model for evaluation result
class WorkflowEvaluateResponse(CradleBaseModel):
    result: bool
    detail: str

# api blueprint
api_workflow_evaluate = APIBlueprint(
    name="workflow_evaluate",
    import_name=__name__,
    url_prefix="/workflow/evaluate",
    abp_tags=[Tag(name="Workflow Step Evaluation")],
    abp_security=[{"jwt": []}]
)

# /api/workflow/evaluate [POST]
@api_workflow_evaluate.post("", responses={})
def evaluate_workflow_instance(body: WorkflowEvaluateResponse):
    """Evaluate a Workflow Step Instance"""
    # TODO define example data
    #      call WorkflowEvaluationService
    #           - throw error if something wrong
    #   4XX -- something was up
    #   else 2XX
    try:
        service = WorkflowRuleEvaluationService()
        
        args = service.get_data()
        result = service.evaluate_rule_engine()
    except:
        return abort(404, description="")
    
    return {}, 201