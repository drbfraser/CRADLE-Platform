from __future__ import annotations

from typing import TYPE_CHECKING, Type

from common.commonUtil import get_uuid
from common.form_utils import assign_form_or_template_ids
from models import (
    FormOrm,
    FormTemplateOrm,
    WorkflowClassificationOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepOrm,
)

if TYPE_CHECKING:
    from data.crud import M


def assign_branch_id(branch: dict, step_id: str, auto_assign_id: bool = False) -> None:
    """
    Assigns an ID and step ID to a workflow step branch if none has been provided, if the branch has a condition that
    will also be assigned an ID

    :param branch: A dictionary containing the branch data to be uploaded to the DB
    :param step_id: The ID of the workflow step to be assigned to the branch
    :param auto_assign_id: If true, the workflow components will always be assigned an ID
    """
    if branch["id"] is None or auto_assign_id:
        branch["id"] = get_uuid()

    branch["step_id"] = step_id

    if branch["condition"] is not None:
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
    if step["id"] is None or auto_assign_id:
        step["id"] = get_uuid()

    # Assign workflow ID to step
    if m is WorkflowTemplateStepOrm:
        step["workflow_template_id"] = workflow_id

    elif m is WorkflowInstanceStepOrm:
        step["workflow_instance_id"] = workflow_id

    step_id = step["id"]

    if step["condition"] is not None:
        if step["condition"]["id"] is None or auto_assign_id:
            step["condition"]["id"] = get_uuid()

        step["condition_id"] = step["condition"]["id"]

    form_model = None

    if m is WorkflowTemplateStepOrm:
        form_model = FormTemplateOrm

    elif m is WorkflowInstanceStepOrm:
        form_model = FormOrm

    # Assign ID to form if provided
    if step["form"] is not None:
        assign_form_or_template_ids(form_model, step["form"])
        step["form_id"] = step["form"]["id"]

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

    if m is WorkflowClassificationOrm:
        return

    workflow_id = workflow["id"]

    # Assign ID to classification if not provided
    if workflow.get("classification") is not None:
        if workflow["classification"]["id"] is None or auto_assign_id:
            workflow["classification"]["id"] = get_uuid()

        workflow["classification_id"] = workflow["classification"]["id"]

    if workflow.get("initial_condition") is not None:
        if workflow["initial_condition"]["id"] is None or auto_assign_id:
            workflow["initial_condition"]["id"] = get_uuid()

        workflow["initial_condition_id"] = workflow["initial_condition"]["id"]

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
