from typing import List

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from common.api_utils import (
    PatientIdPath,
    WorkflowInstanceIdPath,
)
from validation import CradleBaseModel
from validation.workflow_instances import (
    WorkflowInstanceExamples,
    WorkflowInstanceModel,
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


# /api/workflow/instances [POST]
@api_workflow_instances.post("", responses={201: WorkflowInstanceModel})
def create_workflow_instance(body: WorkflowInstanceModel):
    """Create Workflow Instance"""
    # For now, return the example data
    return WorkflowInstanceExamples.example_01, 201


# /api/workflow/instances [GET]
@api_workflow_instances.get("", responses={200: WorkflowInstanceListResponse})
def get_workflow_instances():
    """Get All Workflow Instances"""
    # For now, return list with example data wrapped in the response model
    return {"items": [WorkflowInstanceExamples.example_01]}, 200


# /api/workflow/instances/<string:instance_id> [GET]
@api_workflow_instances.get(
    "/<string:instance_id>", responses={200: WorkflowInstanceModel}
)
def get_workflow_instance(path: WorkflowInstanceIdPath):
    """Get Workflow Instance"""
    # For now, return the example data if ID matches
    if path.instance_id == WorkflowInstanceExamples.id:
        return WorkflowInstanceExamples.example_01, 200
    return abort(404, description=f"No workflow instance with ID: {path.instance_id}.")


# /api/workflow/instances/<string:instance_id>/with-steps [GET]
@api_workflow_instances.get(
    "/<string:instance_id>/with-steps", responses={200: WorkflowInstanceModel}
)
def get_workflow_instance_with_steps(path: WorkflowInstanceIdPath):
    """Get Workflow Instance with Steps"""
    # For now, return the example data with steps if ID matches
    if path.instance_id == WorkflowInstanceExamples.id:
        return WorkflowInstanceExamples.with_steps, 200
    return abort(404, description=f"No workflow instance with ID: {path.instance_id}.")


# /api/workflow/instances/by-patient/<string:patient_id> [GET]
@api_workflow_instances.get(
    "/by-patient/<string:patient_id>", responses={200: WorkflowInstanceListResponse}
)
def get_workflow_instances_by_patient(path: PatientIdPath):
    """Get Workflow Instances by Patient ID"""
    # For now, return list with example data if patient ID matches
    if path.patient_id == "patient-example-01":
        return {"items": [WorkflowInstanceExamples.example_01]}, 200
    return {"items": []}, 200


# /api/workflow/instances/by-template/<string:template_id> [GET]
@api_workflow_instances.get(
    "/by-template/<string:template_id>", responses={200: WorkflowInstanceListResponse}
)
def get_workflow_instances_by_template(path):
    """Get Workflow Instances by Template ID"""
    # For now, return list with example data if template ID matches
    if path.get("template_id") == "workflow-template-example-01":
        return {"items": [WorkflowInstanceExamples.example_01]}, 200
    return {"items": []}, 200


# /api/workflow/instances/<string:instance_id> [PUT]
@api_workflow_instances.put(
    "/<string:instance_id>", responses={200: WorkflowInstanceModel}
)
def update_workflow_instance(path: WorkflowInstanceIdPath, body: WorkflowInstanceModel):
    """Update Workflow Instance"""
    # For now, return the updated body data if ID matches
    if path.instance_id == WorkflowInstanceExamples.id:
        updated_data = body.model_dump()
        updated_data["id"] = path.instance_id
        return updated_data, 200
    return abort(404, description=f"No workflow instance with ID: {path.instance_id}.")


# /api/workflow/instances/<string:instance_id> [DELETE]
@api_workflow_instances.delete("/<string:instance_id>", responses={204: None})
def delete_workflow_instance(path: WorkflowInstanceIdPath):
    """Delete Workflow Instance"""
    # For now, return success if ID matches
    if path.instance_id == WorkflowInstanceExamples.id:
        return "", 204
    return abort(404, description=f"No workflow instance with ID: {path.instance_id}.")
