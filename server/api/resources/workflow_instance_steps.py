from typing import List

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from api.decorator import roles_required
from common import user_utils
from common.api_utils import (
    WorkflowInstanceStepIdPath,
    convert_query_parameter_to_bool,
    get_user_id,
)
from common.commonUtil import get_current_time
from data import orm_serializer
from enums import RoleEnum
from models import (
    FormOrm,
    RuleGroupOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
)
from validation import CradleBaseModel
from validation.workflow_api_models import (
    WorkflowInstanceStepModel,
    WorkflowInstanceStepUpdateModel,
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

workflow_instance_not_found_msg = "Workflow instance with ID: ({}) not found."
workflow_instance_step_not_found_msg = "Workflow instance step with ID: ({}) not found."


# /api/workflow/instance/steps?workflow_instance_id=<str> [GET]
@api_workflow_instance_steps.get("", responses={200: WorkflowInstanceStepListResponse})
def get_workflow_instance_steps():
    """Get All Workflow Instance Steps"""
    # Get query parameters
    workflow_instance_id = request.args.get(
        "workflow_instance_id", default=None, type=str
    )

    instance_steps = crud.read_instance_steps(
        WorkflowInstanceStepOrm, workflow_instance_id=workflow_instance_id
    )

    response_data = [
        orm_serializer.marshal(instance_step, shallow=True)
        for instance_step in instance_steps
    ]

    return {"items": response_data}, 200


# /api/workflow/instance/steps/<string:workflow_instance_step_id>?with_form=<bool> [GET]
@api_workflow_instance_steps.get(
    "/<string:workflow_instance_step_id>", responses={200: WorkflowInstanceStepModel}
)
def get_workflow_instance_step(path: WorkflowInstanceStepIdPath):
    """Get Workflow Instance Step"""
    with_form = request.args.get("with_form", default=False)
    with_form = convert_query_parameter_to_bool(with_form)

    workflow_instance_step = crud.read(
        WorkflowInstanceStepOrm, id=path.workflow_instance_step_id
    )

    if workflow_instance_step is None:
        return abort(
            code=404,
            description=workflow_instance_step_not_found_msg.format(
                path.workflow_instance_step_id
            ),
        )

    response_data = orm_serializer.marshal(workflow_instance_step, shallow=False)

    if not with_form:
        del response_data["form"]

    return response_data, 200


# /api/workflow/instance/steps/<string:workflow_instance_step_id> [PATCH]
@api_workflow_instance_steps.patch(
    "/<string:workflow_instance_step_id>", responses={200: WorkflowInstanceStepModel}
)
def update_workflow_instance_step(
    path: WorkflowInstanceStepIdPath, body: WorkflowInstanceStepUpdateModel
):
    """Update Workflow Instance Step"""
    instance_step = crud.read(
        WorkflowInstanceStepOrm, id=path.workflow_instance_step_id
    )

    if instance_step is None:
        return abort(
            code=404,
            description=workflow_instance_step_not_found_msg.format(
                path.workflow_instance_step_id
            ),
        )

    workflow_instance_step_changes = body.model_dump(exclude_unset=True)
    workflow_instance_step_changes["last_edited"] = get_current_time()

    # Validate that the workflow instance exists (if being updated)
    if workflow_instance_step_changes.get("workflow_instance_id") is not None:
        workflow_instance = crud.read(
            WorkflowInstanceOrm,
            id=workflow_instance_step_changes["workflow_instance_id"],
        )
        if workflow_instance is None:
            return abort(
                code=404,
                description=workflow_instance_not_found_msg.format(
                    workflow_instance_step_changes["workflow_instance_id"]
                ),
            )

    # Validate that the condition exists (if being updated)
    if workflow_instance_step_changes.get("condition_id") is not None:
        condition = crud.read(
            RuleGroupOrm, id=workflow_instance_step_changes["condition_id"]
        )
        if condition is None:
            return abort(
                code=404,
                description=f"Condition with ID: ({workflow_instance_step_changes['condition_id']}) not found.",
            )

    # Validate that the form exists (if being updated)
    if workflow_instance_step_changes.get("form_id") is not None:
        form = crud.read(FormOrm, id=workflow_instance_step_changes["form_id"])
        if form is None:
            return abort(
                code=404,
                description=f"Form with ID: ({workflow_instance_step_changes['form_id']}) not found.",
            )

    # Validate that the assigned user exists (if being updated)
    if workflow_instance_step_changes.get("assigned_to") is not None:
        try:
            user_id = get_user_id(workflow_instance_step_changes, "assigned_to")
            workflow_instance_step_changes["assigned_to"] = user_id
        except ValueError:
            return abort(code=404, description="Assigned user not found.")

    crud.update(
        WorkflowInstanceStepOrm,
        changes=workflow_instance_step_changes,
        id=path.workflow_instance_step_id,
    )

    updated_instance_step_orm = crud.read(
        WorkflowInstanceStepOrm, id=path.workflow_instance_step_id
    )

    updated_instance_step = orm_serializer.marshal(
        updated_instance_step_orm, shallow=True
    )

    return updated_instance_step, 200


# /api/workflow/instance/steps/<string:workflow_instance_step_id>/archive_form [PATCH]
@roles_required([RoleEnum.ADMIN])
@api_workflow_instance_steps.patch("/<string:workflow_instance_step_id>/archive_form")
def archive_form(path: WorkflowInstanceStepIdPath):
    """Archive submitted form associated with workflow instance step"""
    instance_step = crud.read(
        WorkflowInstanceStepOrm, id=path.workflow_instance_step_id
    )

    if instance_step is None:
        return abort(
            code=404,
            description=workflow_instance_step_not_found_msg.format(
                path.workflow_instance_step_id
            ),
        )

    if instance_step.form_id is None:
        return abort(
            code=404, description="Workflow instance step has no associated form."
        )

    form = crud.read(FormOrm, id=instance_step.form_id)

    if form is None:
        return abort(404, description=f"No form with ID: {instance_step.form_id}")

    instance_step.form_id = None
    form.archived = True

    current_user = user_utils.get_current_user_from_jwt()
    user_id = int(current_user["id"])
    form.last_edited_by = user_id
    form.last_edited = get_current_time()

    crud.db_session.commit()
    crud.db_session.refresh(instance_step)
    crud.db_session.refresh(form)

    updated_instance_step = crud.read(
        WorkflowInstanceStepOrm, id=path.workflow_instance_step_id
    )

    updated_instance_step = orm_serializer.marshal(updated_instance_step, shallow=True)

    return updated_instance_step, 200
