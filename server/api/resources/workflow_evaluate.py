"""
api resource route, handle serialize, deserialize
call `workflow_rule_evaluate.py` with inputs to begin process

single endpoint
/workflow/evaluate

takes input data, instance id/rule group id
returns a result
"""

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from validation.workflow_evaluate import (
    WorkflowEvaluateResponseModel,
    WorkflowEvaluateExamples,
    WorkflowEvaluateRequestModel
)

from service.workflow.workflow_rule_evaluation import WorkflowEvaluationService 

# api blueprint
api_workflow_evaluate = APIBlueprint(
    name="workflow_evaluate",
    import_name=__name__,
    url_prefix="/workflow/evaluate",
    abp_tags=[Tag(name="Workflow Step Evaluation")],
    abp_security=[{"jwt": []}]
)

# /api/workflow/evaluate [POST]
@api_workflow_evaluate.post("", responses={ 200: WorkflowEvaluateResponseModel})
def evaluate_workflow_instance(body: WorkflowEvaluateRequestModel):
    """Evaluate a Workflow Step Instance"""    
    try:
        # Sandboxed data
        if body.id == WorkflowEvaluateExamples.id:
            response = WorkflowEvaluateExamples.example_01
            return response, 200
        
        # TODO look into how flask deals with DI, IOC and scoped sessions
        service = WorkflowEvaluationService()
        (rule_group, datasources) = service.get_data(body.workflow_instance_step_id)
        result = service.evaluate_rule_engine(rule_group, datasources)
    except Exception as e:
        return abort(401, description=e)

    response = { "result" : result }
    return response, 200