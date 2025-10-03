from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from common.api_utils import (
    WorkflowTemplateStepIdPath,
    WorkflowTemplateStepListResponse,
    convert_query_parameter_to_bool,
)
from common.commonUtil import get_current_time
from common.workflow_utils import validate_workflow_template_step
from data import marshal
from models import WorkflowTemplateStepOrm
from validation.workflow_objects import WorkflowTemplateStepModel
from validation.workflow_api import WorkflowTemplateStepUploadModel

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
def create_workflow_template_step(body: WorkflowTemplateStepUploadModel):
    """Create Workflow Template Step"""
    template_step = body.model_dump()

    validate_workflow_template_step(template_step)

    template_step_orm = marshal.unmarshal(WorkflowTemplateStepOrm, template_step)

    crud.create(template_step_orm, refresh=True)

    return marshal.marshal(template_step_orm, shallow=True), 201


# /api/workflow/template/steps [GET]
@api_workflow_template_steps.get("", responses={200: WorkflowTemplateStepListResponse})
def get_workflow_template_steps():
    """Get All Workflow Template Steps"""
    template_steps = crud.read_template_steps()
    template_steps = [
        marshal.marshal(template_step) for template_step in template_steps
    ]

    return {"items": template_steps}, 200


# /api/workflow/template/steps/<string:workflow_template_step_id>?with_form=<bool> [GET]
@api_workflow_template_steps.get(
    "/<string:workflow_template_step_id>", responses={200: WorkflowTemplateStepModel}
)
def get_workflow_template_step(path: WorkflowTemplateStepIdPath):
    """Get Workflow Template Step"""
    with_form = request.args.get("with_form", default=False)
    with_form = convert_query_parameter_to_bool(with_form)

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

    workflow_step = marshal.marshal(workflow_step, shallow=False)

    if not with_form:
        del workflow_step["form"]

    return workflow_step, 200


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
    workflow_template_step_changes["last_edited"] = get_current_time()

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


# @api_workflow_template_steps.patch(
#     "/<string:workflow_template_step_id>", responses={204: None}
# )
# def update_workflow_template_step_patch(path: WorkflowTemplateStepIdPath, body):
#     """Update Workflow Template Step with only specific fields"""
#     workflow_template_step = crud.read(WorkflowTemplateStepOrm, id=path.workflow_template_step_id)
#
#     return '', 204


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

    return "", 204
