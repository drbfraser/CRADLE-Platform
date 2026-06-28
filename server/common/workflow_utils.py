from __future__ import annotations

import re
from typing import TYPE_CHECKING, Optional

from flask import abort
from sqlalchemy.exc import IntegrityError

import data.db_operations as crud
from common.commonUtil import abort_not_found, get_uuid
from common.form_utils import assign_form_or_template_ids
from data import orm_serializer
from models import (
    FormSubmissionOrmV2,
    FormTemplateOrmV2,
    RuleGroupOrm,
    WorkflowClassificationOrm,
    WorkflowCollectionOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepOrm,
)
from service.workflow.workflow_service import WorkflowService, WorkflowView
from validation.formsV2_models import FormTemplateUploadRequest

if TYPE_CHECKING:
    from data.crud import M
    from validation.workflow_models import (
        WorkflowInstanceModel,
        WorkflowInstanceStepModel,
        WorkflowTemplateModel,
        WorkflowTemplateStepModel,
    )


WORKFLOW_INSTANCE_NOT_FOUND_MSG = "Workflow instance with ID: ({}) not found."
WORKFLOW_TEMPLATE_NOT_FOUND_MSG = "Workflow template with ID: ({}) not found."
WORKFLOW_INSTANCE_STEP_NOT_FOUND_MSG = "Workflow instance step with ID: ({}) not found."
WORKFLOW_TEMPLATE_STEP_NOT_FOUND_MSG = "Workflow template step with ID: ({}) not found."

# NOTE: Consider moving workflow mutation and validation logic
#       (e.g., assign_*_ids, generate_updated_workflow_template)
#       into WorkflowService.
#       Pros:
#         - This file could focus purely on REST concerns
#           (request validation, 404 handling, response shaping).
#         - Decoupling from Flask and ORM interfaces could simplify
#           usage and testing.
#         - Operating on Pydantic models may improve clarity and type safety.
#       Cons:
#         - Non-trivial refactor with risk of subtle bugs.
#           Mitigated by adding isolated unit tests around these operations.


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
    m: type[M], step: dict, workflow_id: str, auto_assign_id: bool = False
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

    # may no longer need this after complete migration from v1 -> v2 forms
    # ==========================================================
    form_model = None

    if m is WorkflowTemplateStepOrm:
        form_model = FormTemplateOrmV2

    elif m is WorkflowInstanceStepOrm:
        form_model = FormSubmissionOrmV2  # unsure if this is correct

    # Assign ID to form if provided
    if step.get("form") is not None:
        assign_form_or_template_ids(form_model, step["form"])  # refactor?
        step["form_id"] = step["form"]["id"]
    # ==========================================================

    if m is WorkflowTemplateStepOrm:
        for branch in step["branches"]:
            assign_branch_id(branch, step_id, auto_assign_id)


# NOTE: It may not make sense anymore to handle assigning instance IDs, as the
#       IDs are generated once in WorkflowService.generate_workflow_instance
def assign_workflow_template_or_instance_ids(
    m: type[M], workflow: dict, auto_assign_id: bool = False
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


def apply_changes_to_model(model: type[M], changes: dict) -> None:
    """
    Similar to crud.update(), but only applies the changes to the model, does not add to the DB

    :param model: The model to be updated
    :param changes: A dictionary mapping columns to new values
    """
    for k, v in changes.items():
        setattr(model, k, v)


def check_branch_conditions(template_step: dict) -> None:
    """Abort with 404 if any branch references a condition ID that doesn't exist in the DB."""
    for branch in template_step["branches"]:
        if branch.get("condition") is None and branch.get("condition_id") is not None:
            branch_condition = crud.read(RuleGroupOrm, id=branch.get("condition_id"))

            if branch_condition is None:
                return abort(
                    code=404,
                    description=f"Branch condition with ID: ({branch.get('condition_id')}) not found.",
                )


def validate_workflow_template_step(
    workflow_template_step: dict, allow_missing_template: bool = False
):
    """Validate a workflow template step dict, assigning IDs and checking branch conditions and form references."""
    workflow_template_id = workflow_template_step["workflow_template_id"]
    workflow_template = crud.read(WorkflowTemplateOrm, id=workflow_template_id)

    if workflow_template is None and not allow_missing_template:
        return abort(
            code=404,
            description=WORKFLOW_TEMPLATE_NOT_FOUND_MSG.format(workflow_template_id),
        )

    assign_step_ids(
        WorkflowTemplateStepOrm,
        workflow_template_step,
        workflow_template.id if workflow_template else workflow_template_id,
    )

    form_id = workflow_template_step.get("form_id")
    if form_id is not None:
        form_template = crud.read(FormTemplateOrmV2, id=form_id)
        if form_template is None:
            return abort(
                code=404,
                description=f"Form template with ID: ({form_id}) not found.",
            )

    check_branch_conditions(workflow_template_step)

    try:
        if workflow_template_step.get("form") is not None:
            from api.resources.form_templates_v2 import handle_form_template_upload

            form_template = FormTemplateUploadRequest(**workflow_template_step["form"])

            # Process and upload the form template, if there is an issue, an exception is thrown
            form_template = handle_form_template_upload(form_template)

            workflow_template_step["form"] = form_template
            workflow_template_step["form_id"] = form_template["id"]

    except ValueError as err:
        return abort(code=409, description=str(err))


def _build_step_id_mapping(
    steps: list[dict], workflow_template_id: str, auto_assign_id: bool = True
) -> dict[str, str]:
    """Assign new IDs to each step and return a mapping of old step ID to new step ID."""
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
    """Update branch target_step_id references in steps using the provided old-to-new ID map."""
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


workflow_template_version_regex = re.compile(r"^v(?P<number>\d+)$", re.IGNORECASE)


def parse_workflow_template_version(version: Optional[str]) -> Optional[int]:
    """Return numeric part for versions in the form V<number>, else None."""
    if version is None:
        return None

    normalized_version = version.strip()
    version_match = workflow_template_version_regex.match(normalized_version)
    if version_match is None:
        return None

    return int(version_match.group("number"))


def get_next_workflow_template_version(
    workflow_classification_id: Optional[str],
) -> str:
    """
    Compute the next template version for a classification.

    - New classification starts at V1.
    - Existing classification increments the max known V<number>.
    """
    if workflow_classification_id is None:
        return "V1"

    existing_templates = (
        crud.db_session.query(WorkflowTemplateOrm)
        .filter(WorkflowTemplateOrm.classification_id == workflow_classification_id)
        .all()
    )

    max_version_number = 0
    for existing_template in existing_templates:
        parsed_version = parse_workflow_template_version(existing_template.version)
        if parsed_version is not None:
            max_version_number = max(max_version_number, parsed_version)

    return f"V{max_version_number + 1}"


def lock_workflow_classification_for_update(
    workflow_classification_id: Optional[str],
) -> Optional[WorkflowClassificationOrm]:
    """Acquire a row lock for classification-scoped version sequencing."""
    if workflow_classification_id is None:
        return None

    return (
        crud.db_session.query(WorkflowClassificationOrm)
        .filter(WorkflowClassificationOrm.id == workflow_classification_id)
        .with_for_update()
        .one_or_none()
    )


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

    existing_classification = copy_workflow_template_dict.pop("classification", None)
    if (
        copy_workflow_template_dict.get("classification_id") is None
        and existing_classification is not None
    ):
        copy_workflow_template_dict["classification_id"] = existing_classification.get(
            "id"
        )

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


def fetch_workflow_instance_or_404(workflow_instance_id: str) -> WorkflowInstanceModel:
    """
    Fetch a workflow instance or raise a 404 if not found.
    Intended for use inside Flask endpoint handlers.
    """
    workflow_instance = WorkflowService.get_workflow_instance(workflow_instance_id)
    if workflow_instance is None:
        abort_not_found(WORKFLOW_INSTANCE_NOT_FOUND_MSG.format(workflow_instance_id))

    return workflow_instance


def fetch_workflow_instance_step_or_404(
    workflow_instance_step_id: str,
) -> WorkflowInstanceStepModel:
    """
    Fetch a workflow instance step or raise a 404 if not found.
    Intended for use inside Flask endpoint handlers.
    """
    workflow_instance_step = WorkflowService.get_workflow_instance_step(
        workflow_instance_step_id
    )
    if workflow_instance_step is None:
        abort_not_found(
            WORKFLOW_INSTANCE_STEP_NOT_FOUND_MSG.format(workflow_instance_step_id)
        )

    return workflow_instance_step


def fetch_workflow_template_or_404(workflow_template_id: str) -> WorkflowTemplateModel:
    """
    Fetch a workflow template or raise a 404 if not found.
    Intended for use inside Flask endpoint handlers.
    """
    workflow_template = WorkflowService.get_workflow_template(workflow_template_id)
    if workflow_template is None:
        abort_not_found(WORKFLOW_TEMPLATE_NOT_FOUND_MSG.format(workflow_template_id))

    return workflow_template


def fetch_workflow_template_step_or_404(
    workflow_template_step_id: str,
) -> WorkflowTemplateStepModel:
    """
    Fetch a workflow template step or raise a 404 if not found.
    Intended for use inside Flask endpoint handlers.
    """
    workflow_template_step = WorkflowService.get_workflow_template_step(
        workflow_template_step_id
    )
    if workflow_template_step is None:
        abort_not_found(
            WORKFLOW_TEMPLATE_STEP_NOT_FOUND_MSG.format(workflow_template_step_id)
        )

    return workflow_template_step


def fetch_workflow_view_or_404(workflow_instance_id: str) -> WorkflowView:
    """
    Fetch a workflow instance and its template or raise a 404 if either aren't found.
    Intended for use inside Flask endpoint handlers.
    """
    workflow_instance = fetch_workflow_instance_or_404(workflow_instance_id)
    workflow_template = fetch_workflow_template_or_404(
        workflow_instance.workflow_template_id
    )

    return WorkflowView(workflow_template, workflow_instance)


def find_workflow_instance_step_or_404(
    workflow_instance: WorkflowInstanceModel, workflow_instance_step_id: str
) -> WorkflowInstanceStepModel:
    """
    Find a workflow instance step or raise a 404 error if not found.
    Intended for use inside Flask endpoint handlers.
    """
    step = workflow_instance.get_instance_step(workflow_instance_step_id)
    if step is None:
        abort_not_found(
            WORKFLOW_INSTANCE_STEP_NOT_FOUND_MSG.format(workflow_instance_step_id),
        )
    return step


# function to update the workflows after form changes
def update_workflow_version_with_new_form(old_form_id: str, new_form_id: str):
    """
    This function is called everytime a form is updated. It finds all the templates and their steps that link
    to the older form and replaces it with the new version, generating a new workflow template version in the process.
    """
    # find all existing, non-archived workflows with steps that link to old_form_id
    steps_to_update = crud.db_session.query(WorkflowTemplateStepOrm).join(WorkflowTemplateOrm).filter(WorkflowTemplateStepOrm.form_id == old_form_id).filter(WorkflowTemplateOrm.archived == False).all()
    target_workflows_ids = {step.workflow_template_id for step in steps_to_update}

    # go through the each workflow and update relevant steps
    for workflow_template_id in target_workflows_ids:
        workflow_orm = crud.read(WorkflowTemplateOrm, id=workflow_template_id, archived=False)
        if not workflow_orm:
            continue

        template_dict = orm_serializer.marshal(workflow_orm)
        for workflow_step in template_dict["steps"]:
            # update_step if linked to older workflow
            current_id = workflow_step.get("form_id")
            if current_id == old_form_id:
                workflow_step["form_id"] = new_form_id
            workflow_step.pop("form", None)
        # update workflow version and push new details

        # get classification id and lock
        classification_id  = workflow_orm.classification_id
        lock_workflow_classification_for_update(classification_id)

        # create new patch_body and update version
        patch_body = {}
        patch_body["version"] = get_next_workflow_template_version(classification_id)
        patch_body["steps"] = template_dict["steps"]
        patch_body["starting_step_id"] = workflow_orm.starting_step_id

        updated_workflow_template = generate_updated_workflow_template(workflow_orm, patch_body, auto_assign_id=True)
        workflow_orm.archived = True

        try:
            crud.create(model=updated_workflow_template, refresh=True)
        except IntegrityError:
            crud.db_session.rollback()
            return abort(
                code=409,
                description=f"Error updating workflow with id {classification_id}.",
            )


