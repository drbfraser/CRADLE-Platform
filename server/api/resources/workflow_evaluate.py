from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from service.workflow.rules_engine import RulesEngineFacade
from service.workflow.workflow_datasources import WorkflowDatasourcing
from service.workflow.workflow_rule_evaluation import WorkflowEvaluationService
from validation.workflow_evaluate import (
    WorkflowEvaluateExamples,
    WorkflowEvaluateRequestModel,
    WorkflowEvaluateResponseModel,
)

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
    """
    request = body.model_dump()

    try:
        # NOTE: Temporary sandboxed data
        if request["id"] == WorkflowEvaluateExamples.id:
            response = WorkflowEvaluateExamples.example_01
            return response, 200

        # constructor injection done at controller level (i.e. api blueprint)
        # should move to config.py
        service = WorkflowEvaluationService(WorkflowDatasourcing, RulesEngineFacade)

        (rule, datasources) = service.get_data(request["id"])

        result = service.evaluate_rule_engine(rule, datasources)
    except Exception as e:
        return abort(400, description=f"Evaluation occured with exception: {e}")

    return result, 200
