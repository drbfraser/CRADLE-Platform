from typing import List

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from api.resources.form_templates import handle_form_template_upload
from common.api_utils import (
    WorkflowTemplateIdPath,
    WorkflowTemplateStepIdPath,
    get_user_id,
)
from common.commonUtil import get_current_time
from common.workflow_utils import assign_step_ids
from data import crud, marshal
from models import (
    WorkflowTemplateOrm,
    WorkflowTemplateStepOrm,
)
from validation import CradleBaseModel
from validation.formTemplates import FormTemplateUpload
from validation.workflow_template_steps import (
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
    template_steps = crud.read_template_steps()
    template_steps = [
        marshal.marshal(template_step) for template_step in template_steps
    ]

    return {"items": template_steps}, 200


# /api/workflow/template/steps/<string:workflow_template_step_id>?with_form=<bool>&with_branches=<bool> [GET]
@api_workflow_template_steps.get(
    "/<string:workflow_template_step_id>", responses={200: WorkflowTemplateStepModel}
)
def get_workflow_template_step(path: WorkflowTemplateStepIdPath):
    """Get Workflow Template Step"""
    with_form = request.args.get("with_form", default=False, type=bool)
    with_branches = request.args.get("with_branches", default=False, type=bool)

    workflow_step = crud.read(
        WorkflowTemplateStepOrm, id=path.workflow_template_step_id
    )

    if workflow_step is None:
        return abort(
            code=404,
            description=workflow_template_step_not_found_msg.format(
                path.workflow_template_step_id
            ),
        )

    workflow_step = marshal.marshal(workflow_step, shallow=with_branches)

    if not with_form:
        del workflow_step["form"]

    return workflow_step, 200


# /api/workflow/template/<string:workflow_template_id>/steps/ [GET]
@api_workflow_template_steps.get(
    "<string:workflow_template_id>/steps/",
    responses={200: WorkflowTemplateStepListResponse},
)
def get_workflow_template_steps_by_template(path: WorkflowTemplateIdPath):
    """Get Workflow Template Steps by Template ID"""
    workflow_template = crud.read(WorkflowTemplateOrm, id=path.workflow_template_id)

    if workflow_template is None:
        return abort(
            code=404,
            description=workflow_template_not_found_msg.format(
                path.workflow_template_id
            ),
        )

    template_steps = crud.read_template_steps(
        workflow_template_id=path.workflow_template_id
    )
    template_steps = [
        marshal.marshal(template_step) for template_step in template_steps
    ]

    return {"items": template_steps}, 200


# /api/workflow/template/steps/<string:step_id> [PUT]
@api_workflow_template_steps.put(
    "/<string:workflow_template_step_id>", responses={200: WorkflowTemplateStepModel}
)
def update_workflow_template_step(
    path: WorkflowTemplateStepIdPath, body: WorkflowTemplateStepModel
):
    """Update Workflow Template Step"""
    template_step = crud.read(
        WorkflowTemplateStepOrm, id=path.workflow_template_step_id
    )

    if template_step is None:
        return abort(
            code=404,
            description=workflow_template_step_not_found_msg.format(
                path.workflow_template_step_id
            ),
        )

    workflow_template_step_changes = body.model_dump()

    # Get ID of the user who's updating this template
    try:
        user_id = get_user_id(workflow_template_step_changes, "last_edited_by")
        workflow_template_step_changes["last_edited_by"] = user_id
        workflow_template_step_changes["last_edited"] = get_current_time()

    except ValueError:
        return abort(code=404, description="User not found.")

    crud.update(
        WorkflowTemplateStepOrm,
        changes=workflow_template_step_changes,
        id=path.workflow_template_step_id,
    )

    updated_template_step = crud.read(
        WorkflowTemplateStepOrm, id=path.workflow_template_step_id
    )

    updated_template_step = marshal.marshal(updated_template_step, shallow=True)

    return updated_template_step, 200


# /api/workflow/template/steps/<string:step_id> [DELETE]
@api_workflow_template_steps.delete(
    "/<string:workflow_template_step_id>", responses={204: None}
)
def delete_workflow_template_step(path: WorkflowTemplateStepIdPath):
    """Delete Workflow Template Step"""
    # For now, return success if ID matches

    template_step = crud.read(
        WorkflowTemplateStepOrm, id=path.workflow_template_step_id
    )

    if template_step is None:
        return abort(
            code=404,
            description=workflow_template_step_not_found_msg.format(
                path.workflow_template_step_id
            ),
        )

    crud.delete_workflow_step(
        WorkflowTemplateStepOrm, id=path.workflow_template_step_id
    )

    return None, 204
