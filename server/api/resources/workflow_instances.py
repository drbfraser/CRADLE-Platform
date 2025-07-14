from typing import List

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from common.api_utils import (
    WorkflowInstanceIdPath,
    get_user_id,
)
from common.commonUtil import get_current_time
from data import crud, marshal
from models import (
    WorkflowInstanceOrm,
    WorkflowTemplateOrm,
    PatientOrm,
)
from validation import CradleBaseModel
from validation.workflow_instances import (
    WorkflowInstanceModel,
    WorkflowInstanceUploadModel,
)


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

workflow_instance_not_found_message = "Workflow instance with ID: ({}) not found."


# /api/workflow/instances [POST]
@api_workflow_instances.post("", responses={201: WorkflowInstanceModel})
def create_workflow_instance(body: WorkflowInstanceUploadModel):
    """Create Workflow Instance"""
    workflow_instance_dict = body.model_dump()

    # Get ID of user
    try:
        user_id = get_user_id(workflow_instance_dict, "last_edited_by")
        workflow_instance_dict["last_edited_by"] = user_id

    except ValueError:
        return abort(code=404, description="User not found.")

    # Validate that the workflow template exists (if provided)
    if workflow_instance_dict.get("workflow_template_id") is not None:
        workflow_template = crud.read(
            WorkflowTemplateOrm, id=workflow_instance_dict["workflow_template_id"]
        )
        if workflow_template is None:
            return abort(
                code=404,
                description=f"Workflow template with ID: ({workflow_instance_dict['workflow_template_id']}) not found.",
            )

    # Validate that the patient exists
    patient = crud.read(PatientOrm, id=workflow_instance_dict["patient_id"])
    if patient is None:
        return abort(
            code=404,
            description=f"Patient with ID: ({workflow_instance_dict['patient_id']}) not found.",
        )

    workflow_instance_orm = marshal.unmarshal(
        WorkflowInstanceOrm, workflow_instance_dict
    )

    crud.create(model=workflow_instance_orm, refresh=True)

    return marshal.marshal(obj=workflow_instance_orm, shallow=True), 201


# /api/workflow/instances?patient_id=<str>&status=<str>&workflow_template_id=<str> [GET]
@api_workflow_instances.get("", responses={200: WorkflowInstanceListResponse})
def get_workflow_instances():
    """Get All Workflow Instances"""
    # Get query parameters
    patient_id = request.args.get("patient_id", default=None, type=str)
    status = request.args.get("status", default=None, type=str)
    workflow_template_id = request.args.get("workflow_template_id", default=None, type=str)

    workflow_instances = crud.read_workflow_instances(
        model=WorkflowInstanceOrm,
        patient_id=patient_id,
        status=status,
        workflow_template_id=workflow_template_id,
    )

    response_data = [
        marshal.marshal(instance, shallow=True) for instance in workflow_instances
    ]

    return {"items": response_data}, 200


# /api/workflow/instances/<string:workflow_instance_id>?with_steps=<bool> [GET]
@api_workflow_instances.get(
    "/<string:workflow_instance_id>", responses={200: WorkflowInstanceModel}
)
def get_workflow_instance(path: WorkflowInstanceIdPath):
    """Get Workflow Instance"""
    # Get query parameters
    with_steps = request.args.get("with_steps", default=False, type=bool)

    workflow_instance = crud.read(WorkflowInstanceOrm, id=path.workflow_instance_id)

    if workflow_instance is None:
        return abort(
            code=404,
            description=workflow_instance_not_found_message.format(path.workflow_instance_id),
        )

    response_data = marshal.marshal(obj=workflow_instance, shallow=False)

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
            description=workflow_instance_not_found_message.format(path.workflow_instance_id),
        )

    workflow_instance_changes = body.model_dump()

    # Get ID of the user who's updating this instance
    try:
        user_id = get_user_id(workflow_instance_changes, "last_edited_by")
        workflow_instance_changes["last_edited_by"] = user_id
        workflow_instance_changes["last_edited"] = get_current_time()

    except ValueError:
        return abort(code=404, description="User not found.")

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
    response_data = marshal.marshal(response_data, shallow=True)

    return response_data, 200


# /api/workflow/instances/<string:workflow_instance_id> [DELETE]
@api_workflow_instances.delete("/<string:workflow_instance_id>", responses={204: None})
def delete_workflow_instance(path: WorkflowInstanceIdPath):
    """Delete Workflow Instance"""
    workflow_instance = crud.read(WorkflowInstanceOrm, id=path.workflow_instance_id)

    if workflow_instance is None:
        return abort(
            code=404,
            description=workflow_instance_not_found_message.format(path.workflow_instance_id),
        )

    crud.delete_workflow(WorkflowInstanceOrm, id=path.workflow_instance_id)

    return None, 204