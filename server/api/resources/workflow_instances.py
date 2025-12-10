from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from common import patient_utils, workflow_utils
from common.api_utils import (
    WorkflowInstanceIdPath,
    convert_query_parameter_to_bool,
)
from service.workflow.workflow_errors import InvalidWorkflowActionError
from service.workflow.workflow_service import WorkflowService, WorkflowView
from validation.workflow_api_models import (
    ApplyActionRequest,
    CreateWorkflowInstanceRequest,
    GetAvailableActionsResponse,
    GetWorkflowInstancesResponse,
    OverrideCurrentStepRequest,
    WorkflowInstancePatchModel,
)
from validation.workflow_models import WorkflowInstanceModel

# /api/workflow/instances
api_workflow_instances = APIBlueprint(
    name="workflow_instances",
    import_name=__name__,
    url_prefix="/workflow/instances",
    abp_tags=[Tag(name="Workflow Instances", description="")],
    abp_security=[{"jwt": []}],
)


# /api/workflow/instances [POST]
@api_workflow_instances.post("", responses={201: WorkflowInstanceModel})
def create_workflow_instance(body: CreateWorkflowInstanceRequest):
    """Create Workflow Instance"""
    workflow_template = workflow_utils.fetch_workflow_template_or_404(
        body.workflow_template_id
    )

    patient_utils.fetch_patient_or_404(body.patient_id)

    workflow_instance = WorkflowService.generate_workflow_instance(workflow_template)
    workflow_instance.patient_id = body.patient_id

    if body.name is not None:
        workflow_instance.name = body.name
    if body.description is not None:
        workflow_instance.description = body.description

    workflow_view = WorkflowView(workflow_template, workflow_instance)

    # Start the workflow immediately to keep things simple
    WorkflowService.start_workflow(workflow_view)

    WorkflowService.upsert_workflow_instance(workflow_instance)

    return workflow_instance.model_dump(), 201


# /api/workflow/instances?patient_id=<str>&status=<str>&workflow_template_id=<str>&with_steps=<bool> [GET]
@api_workflow_instances.get("", responses={200: GetWorkflowInstancesResponse})
def get_workflow_instances():
    """Get All Workflow Instances"""
    # Get query parameters
    patient_id = request.args.get("patient_id", default=None, type=str)
    status = request.args.get("status", default=None, type=str)
    workflow_template_id = request.args.get(
        "workflow_template_id", default=None, type=str
    )
    with_steps = request.args.get("with_steps", default=False)

    workflow_instances = WorkflowService.get_workflow_instances(
        patient_id=patient_id,
        status=status,
        workflow_template_id=workflow_template_id,
    )

    if not with_steps:
        for workflow in workflow_instances:
            workflow.steps = []

    response = GetWorkflowInstancesResponse(items=workflow_instances)
    return response.model_dump(), 200


# /api/workflow/instances/<string:workflow_instance_id>?with_steps=<bool> [GET]
@api_workflow_instances.get(
    "/<string:workflow_instance_id>", responses={200: WorkflowInstanceModel}
)
def get_workflow_instance(path: WorkflowInstanceIdPath):
    """Get Workflow Instance"""
    # Get query parameters
    with_steps = request.args.get("with_steps", default=False)
    with_steps = convert_query_parameter_to_bool(with_steps)

    workflow_instance = workflow_utils.fetch_workflow_instance_or_404(
        path.workflow_instance_id
    )

    if not with_steps:
        workflow_instance.steps = []

    return workflow_instance.model_dump(), 200


# /api/workflow/instances/<string:workflow_instance_id> [PATCH]
@api_workflow_instances.patch(
    "/<string:workflow_instance_id>", responses={200: WorkflowInstanceModel}
)
def patch_workflow_instance(
    path: WorkflowInstanceIdPath, body: WorkflowInstancePatchModel
):
    """Partially (PATCH) Update Workflow Instance"""
    workflow_instance = workflow_utils.fetch_workflow_instance_or_404(
        path.workflow_instance_id
    )

    if body.patient_id is not None and body.patient_id != workflow_instance.patient_id:
        patient_utils.fetch_patient_or_404(body.patient_id)

    WorkflowService.apply_workflow_instance_patch(workflow_instance, body)

    WorkflowService.upsert_workflow_instance(workflow_instance)
    updated_instance = WorkflowService.get_workflow_instance(path.workflow_instance_id)

    return updated_instance.model_dump(), 200


# /api/workflow/instances/<string:workflow_instance_id> [DELETE]
@api_workflow_instances.delete("/<string:workflow_instance_id>", responses={204: None})
def delete_workflow_instance(path: WorkflowInstanceIdPath):
    """Delete Workflow Instance"""
    workflow_utils.fetch_workflow_instance_or_404(path.workflow_instance_id)
    WorkflowService.delete_workflow_instance(path.workflow_instance_id)

    return "", 204


# /api/workflow/instances/<string:workflow_instance_id>/actions [GET]
@api_workflow_instances.get(
    "/<string:workflow_instance_id>/actions",
    responses={200: GetAvailableActionsResponse},
)
def get_available_actions(path: WorkflowInstanceIdPath):
    """Get Available Workflow Actions"""
    workflow_view = workflow_utils.fetch_workflow_view_or_404(path.workflow_instance_id)
    actions = WorkflowService.get_available_workflow_actions(workflow_view)

    response = GetAvailableActionsResponse(actions=actions)
    return response.model_dump(), 200


# /api/workflow/instances/<string:workflow_instance_id>/actions [POST]
@api_workflow_instances.post(
    "/<string:workflow_instance_id>/actions", responses={200: WorkflowInstanceModel}
)
def apply_action(path: WorkflowInstanceIdPath, body: ApplyActionRequest):
    """Apply a Workflow Action"""
    workflow_view = workflow_utils.fetch_workflow_view_or_404(path.workflow_instance_id)

    try:
        WorkflowService.apply_workflow_action(body.action, workflow_view)
    except InvalidWorkflowActionError as e:
        abort(code=400, description=str(e))

    WorkflowService.upsert_workflow_instance(workflow_view.instance)

    return workflow_view.instance.model_dump(), 200


# /api/workflow/instances/<string:workflow_instance_id>/advance [POST]
@api_workflow_instances.post(
    "/<string:workflow_instance_id>/advance",
    responses={200: WorkflowInstanceModel},
)
def advance(path: WorkflowInstanceIdPath):
    """Advance the workflow to the next step, if possible"""
    workflow_view = workflow_utils.fetch_workflow_view_or_404(path.workflow_instance_id)
    WorkflowService.advance_workflow(workflow_view)

    WorkflowService.upsert_workflow_instance(workflow_view.instance)
    updated_instance = WorkflowService.get_workflow_instance(path.workflow_instance_id)

    return updated_instance.model_dump(), 200


# /api/workflow/instances/<string:workflow_instance_id>/override_current_step [POST]
@api_workflow_instances.post(
    "/<string:workflow_instance_id>/override_current_step",
    responses={200: WorkflowInstanceModel},
)
def override_current_step(
    path: WorkflowInstanceIdPath, body: OverrideCurrentStepRequest
):
    """Override the current step of a workflow"""
    workflow_view = workflow_utils.fetch_workflow_view_or_404(path.workflow_instance_id)
    workflow_utils.find_workflow_instance_step_or_404(
        workflow_view.instance, body.workflow_instance_step_id
    )

    WorkflowService.override_current_step(workflow_view, body.workflow_instance_step_id)

    WorkflowService.upsert_workflow_instance(workflow_view.instance)
    updated_instance = WorkflowService.get_workflow_instance(path.workflow_instance_id)

    return updated_instance.model_dump(), 200
