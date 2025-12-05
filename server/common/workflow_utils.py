from __future__ import annotations

from typing import TYPE_CHECKING, Type

from flask import abort

import data.db_operations as crud
from api.resources.form_templates import handle_form_template_upload
from common.commonUtil import get_uuid
from common.form_utils import assign_form_or_template_ids
from data import orm_serializer
from models import (
    FormOrm,
    FormTemplateOrm,
    RuleGroupOrm,
    WorkflowClassificationOrm,
    WorkflowCollectionOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepOrm,
)
from service.workflow.workflow_service import WorkflowService, WorkflowView
from validation.formTemplates import FormTemplateUpload

if TYPE_CHECKING:
    from data.crud import M
    from validation.workflow_models import (
        WorkflowInstanceModel,
        WorkflowTemplateModel,
    )


WORKFLOW_INSTANCE_NOT_FOUND_MSG = "Workflow instance with ID: ({}) not found."
WORKFLOW_TEMPLATE_NOT_FOUND_MSG = "Workflow template with ID: ({}) not found."
WORKFLOW_INSTANCE_STEP_NOT_FOUND_MSG = "Workflow instance step with ID: ({}) not found."


def assign_branch_id(branch: dict, step_id: str, auto_assign_id: bool = False) -> None:
    """
    Assigns an ID and step ID to a workflow step branch if none has been provided, if the branch has a condition that
    will also be assigned an ID

    :param branch: A dictionary containing the branch data to be uploaded to the DB
    :param step_id: The ID of the workflow step to be assigned to the branch
    :param auto_assign_id: If true, the workflow components will always be assigned an ID
    """
    if branch.get("id") is None or auto_assign_id:
        branch["id"] = get_uuid()

    branch["step_id"] = step_id

    if branch.get("condition") is not None:
        if branch["condition"]["id"] is None or auto_assign_id:
            branch["condition"]["id"] = get_uuid()

        branch["condition_id"] = branch["condition"]["id"]


def assign_step_ids(
    m: Type[M], step: dict, workflow_id: str, auto_assign_id: bool = False
) -> None:
    """
    Assigns an ID and workflow ID to a workflow template or instance step if none has been provided, if the step has
    branches, conditions, or forms, those will also be assigned an ID and/or be updated to contain the new step ID

    :param m: The model of the dict to be uploaded to the DB (WorkflowTemplateStepOrm or WorkflowInstanceStepOrm)
    :param step: A dictionary containing the step data to be uploaded to the DB
    :param workflow_id: The ID of the workflow template or instance to be assigned to the step
    :param auto_assign_id: If true, the workflow components will always be assigned an ID
    """
    if step.get("id") is None or auto_assign_id:
        step["id"] = get_uuid()

    # Assign workflow ID to step
    if m is WorkflowTemplateStepOrm:
        step["workflow_template_id"] = workflow_id

    elif m is WorkflowInstanceStepOrm:
        step["workflow_instance_id"] = workflow_id

    step_id = step["id"]

    form_model = None

    if m is WorkflowTemplateStepOrm:
        form_model = FormTemplateOrm

    elif m is WorkflowInstanceStepOrm:
        form_model = FormOrm

    # Assign ID to form if provided
    if step.get("form") is not None:
        assign_form_or_template_ids(form_model, step["form"])
        step["form_id"] = step["form"]["id"]

    if m is WorkflowTemplateStepOrm:
        for branch in step["branches"]:
            assign_branch_id(branch, step_id, auto_assign_id)


def assign_workflow_template_or_instance_ids(
    m: Type[M], workflow: dict, auto_assign_id: bool = False
) -> None:
    """
    Assigns an ID to a workflow template, instance, or classification if none has been provided, if the workflow
    already has steps or classification provided, those will also be assigned an ID and be updated to contain the
    new workflow ID

    :param m: The model of the dict to be uploaded to the DB (WorkflowTemplateOrm, WorkflowInstanceOrm,
    or WorkflowClassificationOrm)
    :param workflow: A dictionary containing the workflow data to be uploaded to the DB
    :param auto_assign_id: If true, the workflow components will always be assigned an ID
    """
    if workflow.get("id") is None or auto_assign_id:
        workflow["id"] = get_uuid()

    if m is WorkflowClassificationOrm or m is WorkflowCollectionOrm:
        return

    workflow_id = workflow["id"]

    # Assign ID to classification if not provided
    if workflow.get("classification") is not None:
        if workflow["classification"]["id"] is None or auto_assign_id:
            workflow["classification"]["id"] = get_uuid()

        workflow["classification_id"] = workflow["classification"]["id"]

    # Assign IDs and workflow ID to steps

    for step in workflow["steps"]:
        if m is WorkflowTemplateOrm:
            assign_step_ids(WorkflowTemplateStepOrm, step, workflow_id, auto_assign_id)

        elif m is WorkflowInstanceOrm:
            assign_step_ids(WorkflowInstanceStepOrm, step, workflow_id, auto_assign_id)


def apply_changes_to_model(model: Type[M], changes: dict) -> None:
    """
    Similar to crud.update(), but only applies the changes to the model, does not add to the DB

    :param model: The model to be updated
    :param changes: A dictionary mapping columns to new values
    """
    for k, v in changes.items():
        setattr(model, k, v)


def check_branch_conditions(template_step: dict) -> None:
    for branch in template_step["branches"]:
        if branch.get("condition") is None and branch.get("condition_id") is not None:
            branch_condition = crud.read(RuleGroupOrm, id=branch.get("condition_id"))

            if branch_condition is None:
                return abort(
                    code=404,
                    description=f"Branch condition with ID: ({branch.get('condition_id')}) not found.",
                )


def validate_workflow_template_step(workflow_template_step: dict):
    # This endpoint assumes that the step has a workflow ID assigned to it already
    workflow_template = crud.read(
        WorkflowTemplateOrm, id=workflow_template_step["workflow_template_id"]
    )

    if workflow_template is None:
        return abort(
            code=404,
            description=WORKFLOW_TEMPLATE_NOT_FOUND_MSG.format(
                workflow_template_step["workflow_template_id"]
            ),
        )

    assign_step_ids(
        WorkflowTemplateStepOrm, workflow_template_step, workflow_template.id
    )

    check_branch_conditions(workflow_template_step)

    try:
        if workflow_template_step.get("form") is not None:
            form_template = FormTemplateUpload(**workflow_template_step["form"])

            # Process and upload the form template, if there is an issue, an exception is thrown
            form_template = handle_form_template_upload(form_template)

            workflow_template_step["form"] = form_template

    except ValueError as err:
        return abort(code=409, description=str(err))


def _build_step_id_mapping(
    steps: list[dict], workflow_template_id: str, auto_assign_id: bool = True
) -> dict[str, str]:
    old_to_new_step_id_map = {}

    for step in steps:
        old_step_id = step["id"]
        form_id = step.get("form_id")

        check_branch_conditions(step)

        assign_step_ids(
            WorkflowTemplateStepOrm,
            step,
            workflow_template_id,
            auto_assign_id=auto_assign_id,
        )

        if form_id:
            step["form_id"] = form_id

        new_step_id = step["id"]
        old_to_new_step_id_map[old_step_id] = new_step_id

    return old_to_new_step_id_map


def _update_step_references(steps: list[dict], id_map: dict[str, str]) -> list[dict]:
    updated_steps = []

    for step in steps:
        updated_step = step.copy()

        if updated_step.get("branches"):
            updated_branches = []
            for branch in updated_step["branches"]:
                updated_branch = branch.copy()
                old_target_id = updated_branch.get("target_step_id")

                if old_target_id and old_target_id in id_map:
                    updated_branch["target_step_id"] = id_map[old_target_id]

                updated_branches.append(updated_branch)

            updated_step["branches"] = updated_branches

        updated_steps.append(updated_step)

    return updated_steps


# Helper function to generate an updated workflow template from a patch body
def generate_updated_workflow_template(
    existing_template: WorkflowTemplateOrm,
    patch_body: dict,
    auto_assign_id: bool = True,
) -> WorkflowTemplateOrm:
    """
    Generates an updated workflow template from a patch body

    :param existing_template: The existing workflow template to be updated
    :param patch_body: The patch body to be applied to the workflow template
    :param auto_assign_id: Whether to auto-assign IDs to the workflow template and steps
    :return: The updated workflow template
    """
    copy_workflow_template_dict = orm_serializer.marshal(existing_template)

    copy_workflow_template_dict.pop("steps", None)
    copy_workflow_template_dict["steps"] = []

    assign_workflow_template_or_instance_ids(
        m=WorkflowTemplateOrm,
        workflow=copy_workflow_template_dict,
        auto_assign_id=auto_assign_id,
    )

    new_workflow_template = orm_serializer.unmarshal(
        WorkflowTemplateOrm, copy_workflow_template_dict
    )

    new_workflow_template.steps = []
    new_workflow_template_id = copy_workflow_template_dict["id"]

    if patch_body.get("classification"):
        assign_workflow_template_or_instance_ids(
            m=WorkflowTemplateOrm, workflow=patch_body["classification"]
        )

    template_changes = {
        key: value for key, value in patch_body.items() if key != "steps"
    }

    if patch_body.get("steps"):
        old_to_new_step_id_map = _build_step_id_mapping(
            patch_body["steps"], new_workflow_template_id, auto_assign_id
        )

        updated_steps = _update_step_references(
            patch_body["steps"], old_to_new_step_id_map
        )

        if (
            patch_body.get("starting_step_id")
            and patch_body["starting_step_id"] in old_to_new_step_id_map
        ):
            template_changes["starting_step_id"] = old_to_new_step_id_map[
                patch_body["starting_step_id"]
            ]

        template_changes["steps"] = [
            orm_serializer.unmarshal(WorkflowTemplateStepOrm, step)
            for step in updated_steps
        ]

    apply_changes_to_model(new_workflow_template, template_changes)

    return new_workflow_template
def fetch_workflow_instance(workflow_instance_id: str) -> WorkflowInstanceModel:
    """
    Fetches a workflow instance.
    Raises a 404 error (via Flask's `abort`) if the workflow instance is not found.

    Intended as a helper function used within Flask API endpoint functions.
    """
    workflow_instance = WorkflowService.get_workflow_instance(workflow_instance_id)
    if workflow_instance is None:
        abort(
            code=404,
            description=WORKFLOW_INSTANCE_NOT_FOUND_MSG.format(workflow_instance_id),
        )
    return workflow_instance


def fetch_workflow_template(workflow_template_id: str) -> WorkflowTemplateModel:
    """
    Fetches a workflow template.
    Raises a 404 error (via Flask's `abort`) if the workflow template is not found.

    Intended as a helper function used within Flask API endpoint functions.
    """
    workflow_template = WorkflowService.get_workflow_template(workflow_template_id)
    if workflow_template is None:
        abort(
            code=404,
            description=WORKFLOW_TEMPLATE_NOT_FOUND_MSG.format(workflow_template_id),
        )
    return workflow_template


def get_workflow_view(workflow_instance_id: str) -> WorkflowView:
    """
    Fetches a workflow instance and its template.
    Raises a 404 error (via Flask's `abort`) if either the workflow instance or
    workflow instance isn't found.

    Intended as a helper function used within Flask API endpoint functions.
    """
    workflow_instance = fetch_workflow_instance(workflow_instance_id)
    workflow_template = fetch_workflow_template(workflow_instance.workflow_template_id)

    return WorkflowView(workflow_template, workflow_instance)


def check_workflow_instance_step_exists(
    workflow_instance: WorkflowInstanceModel, workflow_instance_step_id: str
) -> None:
    """
    Checks if the workflow instance has an instance step with this step ID.
    Raises a 404 error (via Flask's `abort`) if the workflow instance step
    is not found.

    Intended as a helper function used within Flask API endpoint functions.
    """
    if not workflow_instance.get_instance_step(workflow_instance_step_id):
        abort(
            code=404,
            description=WORKFLOW_INSTANCE_STEP_NOT_FOUND_MSG.format(
                workflow_instance_step_id
            ),
        )


def check_workflow_instance_exists(workflow_instance_id: str) -> None:
    """
    Checks if a workflow instance exists.
    Raises a 404 error (via Flask's `abort`) if the workflow instance is not found.

    Intended as a helper function used within Flask API endpoint functions.
    """
    fetch_workflow_instance(workflow_instance_id)
