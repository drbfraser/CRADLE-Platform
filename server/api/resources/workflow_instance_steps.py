from typing import List

from flask import abort, request
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

import data.db_operations as crud
from api.decorator import roles_required
from common import form_utils as form_api_utils
from common import form_utils as workflow_api_utils
from common import user_utils as user_api_utils
from common.api_utils import WorkflowInstanceStepIdPath, convert_query_parameter_to_bool
from common.commonUtil import get_current_time
from data import orm_serializer
from enums import RoleEnum
from models import (
    FormOrm,
    WorkflowInstanceStepOrm,
)
from validation import CradleBaseModel
from validation.workflow_api_models import WorkflowInstanceStepPatchModel
from validation.workflow_models import WorkflowInstanceStepModel


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
            description=workflow_api_utils.WORKFLOW_INSTANCE_STEP_NOT_FOUND.format(
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
    path: WorkflowInstanceStepIdPath, body: WorkflowInstanceStepPatchModel
):
    """Update Workflow Instance Step"""
    instance_step = crud.read(
        WorkflowInstanceStepOrm, id=path.workflow_instance_step_id
    )

    if instance_step is None:
        return abort(
            code=404,
            description=workflow_api_utils.WORKFLOW_INSTANCE_STEP_NOT_FOUND.format(
                path.workflow_instance_step_id
            ),
        )

    if body.form_id is not None and body.form_id != instance_step.form_id:
        form_api_utils.check_form_exists(body.form_id)
        instance_step.form_id = body.form_id

    if body.assigned_to is not None and body.assigned_to != instance_step.assigned_to:
        user_api_utils.check_user_exists(body.assigned_to)
        instance_step.assigned_to = body.assigned_to

    crud.common_crud.merge(instance_step)

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
            description=workflow_api_utils.WORKFLOW_INSTANCE_STEP_NOT_FOUND.format(
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

    current_user = user_api_utils.get_current_user_from_jwt()
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
