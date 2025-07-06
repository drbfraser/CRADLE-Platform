from typing import List

from flask import abort
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from api.resources.form_templates import handle_form_template_upload
from common.api_utils import (
    WorkflowTemplateIdPath,
    WorkflowTemplateStepIdPath,
    get_user_id,
)
from common.workflow_utils import assign_step_ids
from data import crud, marshal
from models import (
    WorkflowTemplateOrm,
    WorkflowTemplateStepOrm,
)
from validation import CradleBaseModel
from validation.formTemplates import FormTemplateUpload
from validation.workflow_template_steps import (
    WorkflowTemplateStepExample,
    WorkflowTemplateStepModel,
)


# Create a response model for the list endpoints
class WorkflowTemplateStepListResponse(CradleBaseModel):
    items: List[WorkflowTemplateStepModel]


workflow_template_not_found_msg = "Workflow template with ID: ({}) not found."
workflow_template_step_not_found_msg = "Workflow template step with ID: ({}) not found."

# /api/workflow/template/steps
api_workflow_template_steps = APIBlueprint(
    name="workflow_template_steps",
    import_name=__name__,
    url_prefix="/workflow/template/steps",
    abp_tags=[Tag(name="Workflow Template Steps", description="")],
    abp_security=[{"jwt": []}],
)


# /api/workflow/template/steps [POST]
@api_workflow_template_steps.post("", responses={201: WorkflowTemplateStepModel})
def create_workflow_template_step(body: WorkflowTemplateStepModel):
    """Create Workflow Template Step"""
    template_step = body.model_dump()

    try:
        user_id = get_user_id(template_step, "last_edited_by")
        template_step["last_edited_by"] = user_id

    except ValueError:
        return abort(code=404, description="User not found.")

    # This endpoint assumes that the step has a workflow ID assigned to it already
    workflow_template = crud.read(
        WorkflowTemplateOrm, id=template_step["workflow_template_id"]
    )

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_msg.format(
                template_step["workflow_template_id"]
            ),
        )

    assign_step_ids(WorkflowTemplateStepOrm, template_step, workflow_template.id)

    try:
        form_template = FormTemplateUpload(**template_step["form"])

        # Process and upload the form template, if there is an issue, an exception is thrown
        form_template = handle_form_template_upload(form_template)

        template_step["form"] = form_template

        template_step_orm = marshal.unmarshal(WorkflowTemplateStepOrm, template_step)

        crud.create(template_step_orm, refresh=True)

        return marshal.marshal(template_step_orm, shallow=True), 201

    except ValueError as err:
        return abort(code=409, description=str(err))


# /api/workflow/template/steps [GET]
@api_workflow_template_steps.get("", responses={200: WorkflowTemplateStepListResponse})
def get_workflow_template_steps():
    """Get All Workflow Template Steps"""
    # For now, return list with example data wrapped in the response model
    return {"items": [WorkflowTemplateStepExample.example_01]}, 200


# /api/workflow/template/steps/<string:step_id> [GET]
@api_workflow_template_steps.get(
    "/<string:step_id>", responses={200: WorkflowTemplateStepModel}
)
def get_workflow_template_step(path: WorkflowTemplateStepIdPath):
    """Get Workflow Template Step"""
    # For now, return the example data if ID matches
    if path.step_id == WorkflowTemplateStepExample.id:
        return WorkflowTemplateStepExample.example_01, 200
    return abort(404, description=f"No workflow template step with ID: {path.step_id}.")


# /api/workflow/template/steps/<string:step_id>/with-form [GET]
@api_workflow_template_steps.get(
    "/<string:step_id>/with-form", responses={200: WorkflowTemplateStepModel}
)
def get_workflow_template_step_with_form(path: WorkflowTemplateStepIdPath):
    """Get Workflow Template Step with Form"""
    # For now, return the example data with form if ID matches
    if path.step_id == WorkflowTemplateStepExample.id:
        return WorkflowTemplateStepExample.with_form, 200
    return abort(404, description=f"No workflow template step with ID: {path.step_id}.")


# /api/workflow/template/steps/by-template/<string:template_id> [GET]
@api_workflow_template_steps.get(
    "/by-template/<string:template_id>",
    responses={200: WorkflowTemplateStepListResponse},
)
def get_workflow_template_steps_by_template(path: WorkflowTemplateIdPath):
    """Get Workflow Template Steps by Template ID"""
    # For now, return list with example data if template ID matches
    if path.template_id == "workflow-template-example-01":
        return {"items": [WorkflowTemplateStepExample.example_01]}, 200
    return {"items": []}, 200


# /api/workflow/template/steps/<string:step_id> [PUT]
@api_workflow_template_steps.put(
    "/<string:step_id>", responses={200: WorkflowTemplateStepModel}
)
def update_workflow_template_step(
    path: WorkflowTemplateStepIdPath, body: WorkflowTemplateStepModel
):
    """Update Workflow Template Step"""
    # For now, return the updated body data if ID matches
    if path.step_id == WorkflowTemplateStepExample.id:
        updated_data = body.model_dump()
        updated_data["id"] = path.step_id
        return updated_data, 200
    return abort(404, description=f"No workflow template step with ID: {path.step_id}.")


# /api/workflow/template/steps/<string:step_id> [DELETE]
@api_workflow_template_steps.delete("/<string:step_id>", responses={204: None})
def delete_workflow_template_step(path: WorkflowTemplateStepIdPath):
    """Delete Workflow Template Step"""
    # For now, return success if ID matches
    if path.step_id == WorkflowTemplateStepExample.id:
        return "", 204
    return abort(404, description=f"No workflow template step with ID: {path.step_id}.")
