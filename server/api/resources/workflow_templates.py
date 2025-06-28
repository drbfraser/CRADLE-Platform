from typing import List

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from werkzeug.exceptions import HTTPException

from common.api_utils import (
    WorkflowTemplateIdPath,
    get_user_id,
)
from common.commonUtil import get_current_time
from data import crud, marshal
from models import (
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
)
from validation import CradleBaseModel
from validation.workflow_templates import WorkflowTemplateExample, WorkflowTemplateModel


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
# TODO: @roles_required([RoleEnum.ADMIN]) For testing purposes, this is commented out
def create_workflow_template(body: WorkflowTemplateModel):
    """
    Upload a Workflow Template
    """
    workflow_template_dict = body.model_dump()

    user_id = get_user_id(workflow_template_dict, "last_edited_by")

    if isinstance(user_id, HTTPException):
        return user_id

    workflow_template_dict["last_edited_by"] = user_id

    workflow_classification_dict = workflow_template_dict["classification"]
    del workflow_template_dict["classification"]

    # Find workflow classification in DB

    workflow_classification_orm = None

    if workflow_classification_dict is not None:
        workflow_classification_orm = crud.read(
            WorkflowClassificationOrm, id=workflow_classification_dict["id"]
        )

    if workflow_classification_orm is None and workflow_classification_dict is not None:
        # If this workflow classification is completely new, then it will be added to the DB
        workflow_classification_orm = marshal.unmarshal(
            WorkflowClassificationOrm, workflow_classification_dict
        )

    elif workflow_classification_orm is not None:
        # Check if this template version already exists
        existing_template_version = crud.read(
            WorkflowTemplateOrm,
            classification_id=workflow_classification_orm.id,
            version=workflow_template_dict["version"],
        )

        if existing_template_version is not None:
            return abort(
                code=409,
                description="Workflow template with same version still exists - Change version before upload.",
            )

        # Check if a previously existing version of this template exists, if it does, archive it
        previous_template = crud.read(
            WorkflowTemplateOrm,
            classification_id=workflow_classification_orm.id,
            archived=False,
        )

        if previous_template:
            # Update the existing template
            changes = {
                "archived": True,
                "last_edited": get_current_time(),
                "last_edited_by": workflow_template_dict["last_edited_by"],
            }
            crud.update(
                m=WorkflowTemplateOrm,
                changes=changes,
                id=previous_template.id,
                classification_id=workflow_classification_orm.id,
            )

        workflow_template_dict["classification_id"] = workflow_classification_orm.id

    workflow_template_orm = marshal.unmarshal(
        WorkflowTemplateOrm, workflow_template_dict
    )
    workflow_template_orm.classification = workflow_classification_orm

    crud.create(model=workflow_template_orm, refresh=True)

    return marshal.marshal(obj=workflow_template_orm, shallow=True), 201

    # For now, return the example data
    # return WorkflowTemplateExample.example_01, 201


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
    return abort(404, description=f"No workflow template with ID: {path.template_id}.")


# /api/workflow/templates/<string:template_id>/with-classification [GET]
@api_workflow_templates.get(
    "/<string:template_id>/with-classification",
    responses={200: WorkflowTemplateModel},
)
def get_workflow_template_with_classification(path: WorkflowTemplateIdPath):
    """Get Workflow Template with Classification"""
    # For now, return the example data if ID matches
    if path.template_id == WorkflowTemplateExample.id:
        return WorkflowTemplateExample.with_classification, 200
    return abort(404, description=f"No workflow template with ID: {path.template_id}.")


# /api/workflow/templates/<string:template_id>/with-steps [GET]
@api_workflow_templates.get(
    "/<string:template_id>/with-steps", responses={200: WorkflowTemplateModel}
)
def get_workflow_template_with_steps(path: WorkflowTemplateIdPath):
    """Get Workflow Template with Steps"""
    # For now, return the example data if ID matches
    if path.template_id == WorkflowTemplateExample.id:
        return WorkflowTemplateExample.with_step, 200
    return abort(404, description=f"No workflow template with ID: {path.template_id}.")


# /api/workflow/templates/<string:template_id>/with-steps-and-classification [GET]
@api_workflow_templates.get(
    "/<string:template_id>/with-steps-and-classification",
    responses={200: WorkflowTemplateModel},
)
def get_workflow_template_with_steps_and_classification(path: WorkflowTemplateIdPath):
    """Get Workflow Template with Steps and Classification"""
    # For now, return the example data if ID matches
    if path.template_id == WorkflowTemplateExample.id:
        return WorkflowTemplateExample.with_step, 200
    return abort(404, description=f"No workflow template with ID: {path.template_id}.")


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
    return abort(404, description=f"No workflow template with ID: {path.template_id}.")


# /api/workflow/templates/<string:template_id> [DELETE]
@api_workflow_templates.delete("/<string:template_id>", responses={204: None})
def delete_workflow_template(path: WorkflowTemplateIdPath):
    """Delete Workflow Template"""
    # For now, return success if ID matches
    if path.template_id == WorkflowTemplateExample.id:
        return "", 204
    return abort(404, description=f"No workflow template with ID: {path.template_id}.")
