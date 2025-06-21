from typing import List

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from common.api_utils import (
    WorkflowInstanceIdPath,
    WorkflowInstanceStepIdPath,
)
from validation import CradleBaseModel
from validation.workflow_instance_steps import (
    WorkflowInstanceStepExamples,
    WorkflowInstanceStepModel,
)


# Create a response model for the list endpoints
class WorkflowInstanceStepListResponse(CradleBaseModel):
    items: List[WorkflowInstanceStepModel]


# /api/workflow/instance/steps
api_workflow_instance_steps = APIBlueprint(
    name="workflow_instance_steps",
    import_name=__name__,
    url_prefix="/workflow/instance/steps",
    abp_tags=[Tag(name="Workflow Instance Steps", description="")],
    abp_security=[{"jwt": []}],
)


# /api/workflow/instance/steps [POST]
@api_workflow_instance_steps.post("", responses={201: WorkflowInstanceStepModel})
def create_workflow_instance_step(body: WorkflowInstanceStepModel):
    """Create Workflow Instance Step"""
    # For now, return the example data
    return WorkflowInstanceStepExamples.example_01, 201


# /api/workflow/instance/steps [GET]
@api_workflow_instance_steps.get("", responses={200: WorkflowInstanceStepListResponse})
def get_workflow_instance_steps():
    """Get All Workflow Instance Steps"""
    # For now, return list with example data wrapped in the response model
    return {"items": [WorkflowInstanceStepExamples.example_01]}, 200


# /api/workflow/instance/steps/<string:step_id> [GET]
@api_workflow_instance_steps.get(
    "/<string:step_id>", responses={200: WorkflowInstanceStepModel}
)
def get_workflow_instance_step(path: WorkflowInstanceStepIdPath):
    """Get Workflow Instance Step"""
    # For now, return the example data if ID matches
    if path.step_id == WorkflowInstanceStepExamples.id:
        return WorkflowInstanceStepExamples.example_01, 200
    return abort(404, description=f"No workflow instance step with ID: {path.step_id}.")


# /api/workflow/instance/steps/<string:step_id>/with-form [GET]
@api_workflow_instance_steps.get(
    "/<string:step_id>/with-form", responses={200: WorkflowInstanceStepModel}
)
def get_workflow_instance_step_with_form(path: WorkflowInstanceStepIdPath):
    """Get Workflow Instance Step with Form"""
    # For now, return the example data with form if ID matches
    if path.step_id == WorkflowInstanceStepExamples.id:
        return WorkflowInstanceStepExamples.with_form, 200
    return abort(404, description=f"No workflow instance step with ID: {path.step_id}.")


# /api/workflow/instance/steps/by-instance/<string:instance_id> [GET]
@api_workflow_instance_steps.get(
    "/by-instance/<string:instance_id>",
    responses={200: WorkflowInstanceStepListResponse},
)
def get_workflow_instance_steps_by_instance(path: WorkflowInstanceIdPath):
    """Get Workflow Instance Steps by Instance ID"""
    # For now, return list with example data if instance ID matches
    if path.instance_id == "workflow-instance-example-01":
        return {"items": [WorkflowInstanceStepExamples.example_01]}, 200
    return {"items": []}, 200


# /api/workflow/instance/steps/by-user/<int:user_id> [GET]
@api_workflow_instance_steps.get(
    "/by-user/<int:user_id>", responses={200: WorkflowInstanceStepListResponse}
)
def get_workflow_instance_steps_by_user(path):
    """Get Workflow Instance Steps by User ID"""
    # For now, return list with example data if user ID matches
    if path.get("user_id") == 1232:
        return {"items": [WorkflowInstanceStepExamples.example_01]}, 200
    return {"items": []}, 200


# /api/workflow/instance/steps/<string:step_id> [PUT]
@api_workflow_instance_steps.put(
    "/<string:step_id>", responses={200: WorkflowInstanceStepModel}
)
def update_workflow_instance_step(
    path: WorkflowInstanceStepIdPath, body: WorkflowInstanceStepModel
):
    """Update Workflow Instance Step"""
    # For now, return the updated body data if ID matches
    if path.step_id == WorkflowInstanceStepExamples.id:
        updated_data = body.model_dump()
        updated_data["id"] = path.step_id
        return updated_data, 200
    return abort(404, description=f"No workflow instance step with ID: {path.step_id}.")


# /api/workflow/instance/steps/<string:step_id>/complete [PUT]
@api_workflow_instance_steps.put(
    "/<string:step_id>/complete", responses={200: WorkflowInstanceStepModel}
)
def complete_workflow_instance_step(path: WorkflowInstanceStepIdPath):
    """Complete Workflow Instance Step"""
    # For now, return the completed step data if ID matches
    if path.step_id == WorkflowInstanceStepExamples.id:
        completed_step = WorkflowInstanceStepExamples.example_01.copy()
        completed_step["status"] = "Completed"
        return completed_step, 200
    return abort(404, description=f"No workflow instance step with ID: {path.step_id}.")


# /api/workflow/instance/steps/<string:step_id> [DELETE]
@api_workflow_instance_steps.delete("/<string:step_id>", responses={204: None})
def delete_workflow_instance_step(path: WorkflowInstanceStepIdPath):
    """Delete Workflow Instance Step"""
    # For now, return success if ID matches
    if path.step_id == WorkflowInstanceStepExamples.id:
        return "", 204
    return abort(404, description=f"No workflow instance step with ID: {path.step_id}.")
