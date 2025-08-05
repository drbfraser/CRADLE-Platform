from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from validation.workflow_evaluate import (
    WorkflowEvaluateResponseModel,
    WorkflowEvaluateExamples,
    WorkflowEvaluateRequestModel,
)

from service.workflow.workflow_rule_evaluation import WorkflowEvaluationService
from service.workflow.rules_engine import RulesEngineFacade
from service.workflow.workflow_datasources import WorkflowDatasourcing

# api blueprint
api_workflow_evaluate = APIBlueprint(
    name="workflow_evaluate",
    import_name=__name__,
    url_prefix="/workflow/evaluate",
    abp_tags=[Tag(name="Workflow Instance Step Evaluation")],
    abp_security=[{"jwt": []}],
)


# /api/workflow/evaluate [POST]
@api_workflow_evaluate.post("", responses={200: WorkflowEvaluateResponseModel})
def evaluate_workflow_instance(body: WorkflowEvaluateRequestModel):
    """
    Evaluate a Workflow Step Instance
    - a readonly operation that does not update the database
    """
    request = body.model_dump()
    
    try:
        # NOTE: Temporary sandboxed data
        if request["id"] == WorkflowEvaluateExamples.id:
            response = WorkflowEvaluateExamples.example_01
            return response, 200

        service = WorkflowEvaluationService(WorkflowDatasourcing, RulesEngineFacade)
        
        (rule, datasources) = service.get_data(request["id"])
        
        result = service.evaluate_rule_engine(rule, datasources)
    except Exception as e:
        return abort(400, description=e)
    
    return {"result": result}, 200
