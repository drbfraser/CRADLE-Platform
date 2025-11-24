from typing import List

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common.api_utils import (
    WorkflowInstanceIdPath,
    convert_query_parameter_to_bool,
)
from common.commonUtil import get_current_time
from data import orm_serializer
from models import (
    PatientOrm,
    WorkflowInstanceOrm,
    WorkflowTemplateOrm,
)
from service.workflow.workflow_errors import InvalidWorkflowActionError
from service.workflow.workflow_service import WorkflowService
from validation import CradleBaseModel
from validation.workflow_api_models import (
    ApplyActionRequest,
    GetAvailableActionsResponse,
    WorkflowInstancePatchModel,
)
from validation.workflow_models import StartWorkflowActionModel, WorkflowInstanceModel


# Create a response model for the list endpoints
class WorkflowInstanceListResponse(CradleBaseModel):
    items: List[WorkflowInstanceModel]


# /api/workflow/instances
api_workflow_instances = APIBlueprint(
    name="workflow_instances",
    import_name=__name__,
    url_prefix="/workflow/instances",
    abp_tags=[Tag(name="Workflow Instances", description="")],
    abp_security=[{"jwt": []}],
)

WORKFLOW_INSTANCE_NOT_FOUND_MSG = "Workflow instance with ID: ({}) not found."
WORKFLOW_TEMPLATE_NOT_FOUND_MSG = "Workflow template with ID: ({}) not found."


class CreateWorkflowInstanceRequest(CradleBaseModel):
    workflow_template_id: str
    patient_id: str


# /api/workflow/instances [POST]
@api_workflow_instances.post("", responses={201: WorkflowInstanceModel})
def create_workflow_instance(body: CreateWorkflowInstanceRequest):
    """Create Workflow Instance"""
    workflow_template = WorkflowService.get_workflow_template(body.workflow_template_id)
    if workflow_template is None:
        return abort(
            code=404,
            description=f"Workflow template with ID '{body.workflow_template_id}' not found.",
        )

    patient = crud.read(PatientOrm, id=body.patient_id)
    if patient is None:
        return abort(
            code=404,
            description=f"Patient with ID '{body.patient_id}' not found.",
        )

    workflow_instance = WorkflowService.generate_workflow_instance(workflow_template)

    workflow_instance.patient_id = body.patient_id

    actions = WorkflowService.get_available_workflow_actions(
        workflow_instance, workflow_template
    )

    if StartWorkflowActionModel() in actions:
        # Start workflow immediately to keep things simple
        WorkflowService.apply_workflow_action(
            StartWorkflowActionModel(), workflow_instance, workflow_template
        )

    WorkflowService.upsert_workflow_instance(workflow_instance)

    return workflow_instance.model_dump(), 201


# /api/workflow/instances?patient_id=<str>&status=<str>&workflow_template_id=<str> [GET]
@api_workflow_instances.get("", responses={200: WorkflowInstanceListResponse})
def get_workflow_instances():
    """Get All Workflow Instances"""
    # Get query parameters
    patient_id = request.args.get("patient_id", default=None, type=str)
    status = request.args.get("status", default=None, type=str)
    workflow_template_id = request.args.get(
        "workflow_template_id", default=None, type=str
    )

    workflow_instances = crud.read_workflow_instances(
        patient_id=patient_id,
        status=status,
        workflow_template_id=workflow_template_id,
    )

    response_data = [
        orm_serializer.marshal(instance, shallow=True)
        for instance in workflow_instances
    ]

    return {"items": response_data}, 200


# /api/workflow/instances/<string:workflow_instance_id>?with_steps=<bool> [GET]
@api_workflow_instances.get(
    "/<string:workflow_instance_id>", responses={200: WorkflowInstanceModel}
)
def get_workflow_instance(path: WorkflowInstanceIdPath):
    """Get Workflow Instance"""
    # Get query parameters
    with_steps = request.args.get("with_steps", default=False)
    with_steps = convert_query_parameter_to_bool(with_steps)

    workflow_instance = crud.read(WorkflowInstanceOrm, id=path.workflow_instance_id)

    if workflow_instance is None:
        return abort(
            code=404,
            description=WORKFLOW_INSTANCE_NOT_FOUND_MSG.format(
                path.workflow_instance_id
            ),
        )

    response_data = orm_serializer.marshal(obj=workflow_instance, shallow=False)

    if not with_steps:
        del response_data["steps"]

    return response_data, 200


# /api/workflow/instances/<string:workflow_instance_id> [PUT]
@api_workflow_instances.put(
    "/<string:workflow_instance_id>", responses={200: WorkflowInstanceModel}
)
def update_workflow_instance(path: WorkflowInstanceIdPath, body: WorkflowInstanceModel):
    """Update Workflow Instance"""
    workflow_instance = crud.read(WorkflowInstanceOrm, id=path.workflow_instance_id)

    if workflow_instance is None:
        return abort(
            code=404,
            description=WORKFLOW_INSTANCE_NOT_FOUND_MSG.format(
                path.workflow_instance_id
            ),
        )

    workflow_instance_changes = body.model_dump()

    # Auto-update last_edited if not explicitly provided
    if "last_edited" not in workflow_instance_changes:
        workflow_instance_changes["last_edited"] = get_current_time()

    # Validate that the workflow template exists (if being updated)
    if workflow_instance_changes.get("workflow_template_id") is not None:
        workflow_template = crud.read(
            WorkflowTemplateOrm, id=workflow_instance_changes["workflow_template_id"]
        )
        if workflow_template is None:
            return abort(
                code=404,
                description=f"Workflow template with ID: ({workflow_instance_changes['workflow_template_id']}) not found.",
            )

    # Validate that the patient exists (if being updated)
    if workflow_instance_changes.get("patient_id") is not None:
        patient = crud.read(PatientOrm, id=workflow_instance_changes["patient_id"])
        if patient is None:
            return abort(
                code=404,
                description=f"Patient with ID: ({workflow_instance_changes['patient_id']}) not found.",
            )

    crud.update(
        WorkflowInstanceOrm,
        changes=workflow_instance_changes,
        id=path.workflow_instance_id,
    )

    response_data = crud.read(WorkflowInstanceOrm, id=path.workflow_instance_id)
    response_data = orm_serializer.marshal(response_data, shallow=True)

    return response_data, 200


# /api/workflow/instances/<string:workflow_instance_id> [PATCH]
@api_workflow_instances.patch(
    "/<string:workflow_instance_id>", responses={200: WorkflowInstanceModel}
)
def patch_workflow_instance(
    path: WorkflowInstanceIdPath, body: WorkflowInstancePatchModel
):
    """Partially (PATCH) Update Workflow Instance"""
    workflow_instance = crud.read(WorkflowInstanceOrm, id=path.workflow_instance_id)

    if workflow_instance is None:
        return abort(
            code=404,
            description=WORKFLOW_INSTANCE_NOT_FOUND_MSG.format(
                path.workflow_instance_id
            ),
        )

    # Get only the fields that were provided (exclude None values)
    workflow_instance_changes = body.model_dump(exclude_none=True)

    # If no changes were provided, return the current instance
    if not workflow_instance_changes:
        response_data = orm_serializer.marshal(workflow_instance, shallow=True)
        return response_data, 200

    # Auto-update last_edited if not explicitly provided
    if "last_edited" not in workflow_instance_changes:
        workflow_instance_changes["last_edited"] = get_current_time()

    # Validate that the workflow template exists (if being updated)
    if workflow_instance_changes.get("workflow_template_id") is not None:
        workflow_template = crud.read(
            WorkflowTemplateOrm, id=workflow_instance_changes["workflow_template_id"]
        )
        if workflow_template is None:
            return abort(
                code=404,
                description=f"Workflow template with ID: ({workflow_instance_changes['workflow_template_id']}) not found.",
            )

    # Validate that the patient exists (if being updated)
    if workflow_instance_changes.get("patient_id") is not None:
        patient = crud.read(PatientOrm, id=workflow_instance_changes["patient_id"])
        if patient is None:
            return abort(
                code=404,
                description=f"Patient with ID: ({workflow_instance_changes['patient_id']}) not found.",
            )

    # Apply the partial update
    crud.update(
        WorkflowInstanceOrm,
        changes=workflow_instance_changes,
        id=path.workflow_instance_id,
    )

    # Return the updated instance
    response_data = crud.read(WorkflowInstanceOrm, id=path.workflow_instance_id)
    response_data = orm_serializer.marshal(response_data, shallow=True)

    return response_data, 200


# /api/workflow/instances/<string:workflow_instance_id> [DELETE]
@api_workflow_instances.delete("/<string:workflow_instance_id>", responses={204: None})
def delete_workflow_instance(path: WorkflowInstanceIdPath):
    """Delete Workflow Instance"""
    workflow_instance = crud.read(WorkflowInstanceOrm, id=path.workflow_instance_id)

    if workflow_instance is None:
        return abort(
            code=404,
            description=WORKFLOW_INSTANCE_NOT_FOUND_MSG.format(
                path.workflow_instance_id
            ),
        )

    crud.delete_workflow(WorkflowInstanceOrm, id=path.workflow_instance_id)

    return "", 204


# /api/workflow/instances/<string:workflow_instance_id>/actions [GET]
@api_workflow_instances.get(
    "/<string:workflow_instance_id>/actions",
    responses={200: GetAvailableActionsResponse},
)
def get_available_actions(path: WorkflowInstanceIdPath):
    """Get Available Workflow Actions"""
    workflow_instance = WorkflowService.get_workflow_instance(path.workflow_instance_id)

    if workflow_instance is None:
        abort(
            code=404,
            description=WORKFLOW_INSTANCE_NOT_FOUND_MSG.format(
                path.workflow_instance_id
            ),
        )

    workflow_template = WorkflowService.get_workflow_template(
        workflow_instance.workflow_template_id
    )

    if workflow_template is None:
        abort(
            code=404,
            description=WORKFLOW_TEMPLATE_NOT_FOUND_MSG.format(
                workflow_template.workflow_template_id
            ),
        )

    actions = WorkflowService.get_available_workflow_actions(
        workflow_instance, workflow_template
    )

    response = GetAvailableActionsResponse(actions=actions)

    return response.model_dump(), 200


# /api/workflow/instances/<string:workflow_instance_id>/actions [POST]
@api_workflow_instances.post(
    "/<string:workflow_instance_id>/actions", responses={200: WorkflowInstanceModel}
)
def apply_action(path: WorkflowInstanceIdPath, body: ApplyActionRequest):
    """Apply a Workflow Action"""
    workflow_instance = WorkflowService.get_workflow_instance(path.workflow_instance_id)

    if workflow_instance is None:
        abort(
            code=404,
            description=WORKFLOW_INSTANCE_NOT_FOUND_MSG.format(
                path.workflow_instance_id
            ),
        )

    workflow_template = WorkflowService.get_workflow_template(
        workflow_instance.workflow_template_id
    )

    if workflow_template is None:
        abort(
            code=404,
            description=WORKFLOW_TEMPLATE_NOT_FOUND_MSG.format(
                workflow_template.workflow_template_id
            ),
        )

    try:
        WorkflowService.apply_workflow_action(
            body.action, workflow_instance, workflow_template
        )
    except InvalidWorkflowActionError as e:
        abort(code=400, description=str(e))

    WorkflowService.upsert_workflow_instance(workflow_instance)

    return workflow_instance.model_dump(), 200
