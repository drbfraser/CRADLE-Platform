from flask import request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from api.decorator import roles_required
from common import form_utils, user_utils, workflow_utils
from common.api_utils import WorkflowInstanceStepIdPath, convert_query_parameter_to_bool
from enums import RoleEnum
from service.workflow.workflow_service import WorkflowService
from validation.workflow_api_models import (
    GetWorkflowInstanceStepsRequest,
    GetWorkflowInstanceStepsResponse,
    WorkflowInstanceStepPatchModel,
)
from validation.workflow_models import WorkflowInstanceStepModel, WorkflowStepEvaluation

# /api/workflow/instance/steps
api_workflow_instance_steps = APIBlueprint(
    name="workflow_instance_steps",
    import_name=__name__,
    url_prefix="/workflow/instance/steps",
    abp_tags=[Tag(name="Workflow Instance Steps", description="")],
    abp_security=[{"jwt": []}],
)


# /api/workflow/instance/steps [GET]
@api_workflow_instance_steps.get("", responses={200: GetWorkflowInstanceStepsResponse})
def get_workflow_instance_steps(body: GetWorkflowInstanceStepsRequest):
    """Get All Workflow Instance Steps"""
    workflow_instance = workflow_utils.fetch_workflow_instance_or_404(
        body.workflow_instance_id
    )

    response = GetWorkflowInstanceStepsResponse(
        items=[step.model_dump() for step in workflow_instance.steps]
    )

    return response.model_dump(), 200


# /api/workflow/instance/steps/<string:workflow_instance_step_id>?with_form=<bool> [GET]
@api_workflow_instance_steps.get(
    "/<string:workflow_instance_step_id>", responses={200: WorkflowInstanceStepModel}
)
def get_workflow_instance_step(path: WorkflowInstanceStepIdPath):
    """Get Workflow Instance Step"""
    with_form = request.args.get("with_form", default=False)
    with_form = convert_query_parameter_to_bool(with_form)

    step = workflow_utils.fetch_workflow_instance_step_or_404(
        path.workflow_instance_step_id
    )

    if not with_form:
        step.form = None

    return step.model_dump(), 200


# /api/workflow/instance/steps/<string:workflow_instance_step_id> [PATCH]
@api_workflow_instance_steps.patch(
    "/<string:workflow_instance_step_id>", responses={200: WorkflowInstanceStepModel}
)
def update_workflow_instance_step(
    path: WorkflowInstanceStepIdPath, body: WorkflowInstanceStepPatchModel
):
    """Update Workflow Instance Step"""
    step = workflow_utils.fetch_workflow_instance_step_or_404(
        path.workflow_instance_step_id
    )

    if body.form_id is not None and body.form_id != step.form_id:
        form_utils.fetch_form_or_404(body.form_id)

    if body.assigned_to is not None and body.assigned_to != step.assigned_to:
        user_utils.fetch_user_or_404(body.assigned_to)

    WorkflowService.apply_workflow_instance_step_patch(step, body)
    WorkflowService.upsert_workflow_instance_step(step)

    updated_step = WorkflowService.get_workflow_instance_step(
        path.workflow_instance_step_id
    )
    return updated_step.model_dump(), 200


# /api/workflow/instance/steps/<string:workflow_instance_step_id>/archive_form [PATCH]
@roles_required([RoleEnum.ADMIN])
@api_workflow_instance_steps.patch("/<string:workflow_instance_step_id>/archive_form")
def archive_form(path: WorkflowInstanceStepIdPath):
    """Archive submitted form associated with workflow instance step"""
    step = workflow_utils.fetch_workflow_instance_step_or_404(
        path.workflow_instance_step_id
    )

    form_utils.fetch_form_or_404(step.form_id)

    current_user = user_utils.get_current_user_from_jwt()
    user_id = int(current_user["id"])

    WorkflowService.archive_form(step, user_id)

    updated_step = WorkflowService.get_workflow_instance_step(
        path.workflow_instance_step_id
    )
    return updated_step.model_dump(), 200


# /api/workflow/instance/steps/<string:workflow_instance_step_id>/evaluate [GET]
@api_workflow_instance_steps.get(
    "<string:workflow_instance_step_id>/evaluate",
    responses={200: WorkflowStepEvaluation},
)
def evaluate_step(path: WorkflowInstanceStepIdPath):
    """Evaluate a Workflow Instance Step"""
    step = workflow_utils.fetch_workflow_instance_step_or_404(
        path.workflow_instance_step_id
    )
    workflow_view = workflow_utils.fetch_workflow_view_or_404(step.workflow_instance_id)

    step_evaluation = WorkflowService.evaluate_workflow_step(
        workflow_view, path.workflow_instance_step_id
    )

    return step_evaluation.model_dump(), 200
