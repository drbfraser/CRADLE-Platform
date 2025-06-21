import json

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data  # Used later for crud, marshal, etc. (also remember models)
from common import user_utils
from common.api_utils import (
    WorkflowTemplateIdPath,
)

from validation.workflow_templates import (
    WorkflowTemplateExample,
    WorkflowTemplateModel,
    WorkflowTemplateWithClassification,
    WorkflowTemplateWithSteps,
    WorkflowTemplateWithStepsAndClassification,
)

from typing import List
from validation import CradleBaseModel


# Create a response model for the list endpoints
class WorkflowTemplateListResponse(CradleBaseModel):
    items: List[WorkflowTemplateModel]


# /api/workflow/templates
api_workflow_templates = APIBlueprint(
    name="workflow_templates",
    import_name=__name__,
    url_prefix="/workflow/templates",
    abp_tags=[Tag(name="Workflow Templates", description="")],
    abp_security=[{"jwt": []}],
)


# /api/workflow/templates [POST]
@api_workflow_templates.post("", responses={201: WorkflowTemplateModel})
def create_workflow_template(body: WorkflowTemplateModel):
    """Create Workflow Template"""
    # For now, return the example data
    return WorkflowTemplateExample.example_01, 201


# /api/workflow/templates [GET]
@api_workflow_templates.get("", responses={200: WorkflowTemplateListResponse})
def get_workflow_templates():
    """Get All Workflow Templates"""
    # For now, return list with example data wrapped in the response model
    return {"items": [WorkflowTemplateExample.example_01]}, 200


# /api/workflow/templates/<string:template_id> [GET]
@api_workflow_templates.get(
    "/<string:template_id>", responses={200: WorkflowTemplateModel}
)
def get_workflow_template(path: WorkflowTemplateIdPath):
    """Get Workflow Template"""
    # For now, return the example data if ID matches
    if path.template_id == WorkflowTemplateExample.id:
        return WorkflowTemplateExample.example_01, 200
    else:
        return abort(
            404, description=f"No workflow template with ID: {path.template_id}."
        )


# /api/workflow/templates/<string:template_id>/with-classification [GET]
@api_workflow_templates.get(
    "/<string:template_id>/with-classification",
    responses={200: WorkflowTemplateWithClassification},
)
def get_workflow_template_with_classification(path: WorkflowTemplateIdPath):
    """Get Workflow Template with Classification"""
    # For now, return the example data if ID matches
    if path.template_id == WorkflowTemplateExample.id:
        return WorkflowTemplateExample.with_classification, 200
    else:
        return abort(
            404, description=f"No workflow template with ID: {path.template_id}."
        )


# /api/workflow/templates/<string:template_id>/with-steps [GET]
@api_workflow_templates.get(
    "/<string:template_id>/with-steps", responses={200: WorkflowTemplateWithSteps}
)
def get_workflow_template_with_steps(path: WorkflowTemplateIdPath):
    """Get Workflow Template with Steps"""
    # For now, return the example data if ID matches
    if path.template_id == WorkflowTemplateExample.id:
        return WorkflowTemplateExample.with_step, 200
    else:
        return abort(
            404, description=f"No workflow template with ID: {path.template_id}."
        )


# /api/workflow/templates/<string:template_id>/with-steps-and-classification [GET]
@api_workflow_templates.get(
    "/<string:template_id>/with-steps-and-classification",
    responses={200: WorkflowTemplateWithStepsAndClassification},
)
def get_workflow_template_with_steps_and_classification(path: WorkflowTemplateIdPath):
    """Get Workflow Template with Steps and Classification"""
    # For now, return the example data if ID matches
    if path.template_id == WorkflowTemplateExample.id:
        return WorkflowTemplateExample.with_step, 200
    else:
        return abort(
            404, description=f"No workflow template with ID: {path.template_id}."
        )


# /api/workflow/templates/<string:template_id> [PUT]
@api_workflow_templates.put(
    "/<string:template_id>", responses={200: WorkflowTemplateModel}
)
def update_workflow_template(path: WorkflowTemplateIdPath, body: WorkflowTemplateModel):
    """Update Workflow Template"""
    # For now, return the updated body data if ID matches
    if path.template_id == WorkflowTemplateExample.id:
        updated_data = body.model_dump()
        updated_data["id"] = path.template_id
        return updated_data, 200
    else:
        return abort(
            404, description=f"No workflow template with ID: {path.template_id}."
        )


# /api/workflow/templates/<string:template_id> [DELETE]
@api_workflow_templates.delete("/<string:template_id>", responses={204: None})
def delete_workflow_template(path: WorkflowTemplateIdPath):
    """Delete Workflow Template"""
    # For now, return success if ID matches
    if path.template_id == WorkflowTemplateExample.id:
        return "", 204
    else:
        return abort(
            404, description=f"No workflow template with ID: {path.template_id}."
        )
