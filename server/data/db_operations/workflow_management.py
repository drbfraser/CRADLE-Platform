"""
common_crud.py
--------------

Purpose
    This module provides helpers for deleting and reading workflow entities.

What this module provides
    - Deletion helpers for workflow structures:
        * delete_workflow_step_branch(...)
        * delete_workflow_step(...)
        * delete_workflow(...)
        * delete_workflow_classification(...)
    - Read helpers for workflow structures:
        * read_instance_steps(...)
        * read_workflow_instances(...)
        * read_workflow_templates(...)
        * read_workflow_classifications(...)
        * read_template_steps(...)
        * read_workflows_in_collection(...)
        * read_rule_group(...)
"""


from data.db_operations import db_session, M
from typing import List, Optional, Type
from data.db_operations.common_crud import read, delete, delete_by, delete_all

from data import db_session
from enums import WorkflowStatusEnum
from models import (
    FormClassificationOrm,
    FormOrm,
    FormTemplateOrm,
    RuleGroupOrm,
    WorkflowClassificationOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
)

def delete_workflow_step_branch(**kwargs):
    """
    Deletes a branch from a workflow step including all associated rule groups

    :param kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``id="abc"``)
    """
    branch = read(WorkflowTemplateStepBranchOrm, **kwargs)

    if branch:
        delete_by(RuleGroupOrm, id=branch.condition_id)

        delete(branch)


def delete_workflow_step(m: Type[M], **kwargs) -> None:
    """
    Deletes a step from a workflow template or instance including all associated branches, forms, and rule groups

    :param m: Type of the model to delete (WorkflowTemplateStepOrm or WorkflowInstanceStepOrm)
    :param kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``id="abc"``)
    """
    step = read(m, **kwargs)

    if step is None:
        return

    if isinstance(step, WorkflowTemplateStepOrm):
        # Delete each branch in the step
        for branch in step.branches:
            delete_workflow_step_branch(id=branch.id)

        # TODO: Should the form template and classification associated also be deleted when the template step is deleted?

        form_template = read(FormTemplateOrm, id=step.form_id)

        if form_template:
            delete_by(FormClassificationOrm, id=form_template.form_classification_id)

        delete_by(FormTemplateOrm, id=step.form_id)

    elif isinstance(step, WorkflowInstanceStepOrm):
        delete_by(FormOrm, id=step.form_id)

    delete_all(RuleGroupOrm, id=step.condition_id)

    delete(step)


def delete_workflow(m: Type[M], delete_classification: bool = False, **kwargs) -> None:
    """
    Deletes a workflow instance or template including all associated steps and rule groups

    :param m: Type of the model to delete (WorkflowTemplateOrm or WorkflowInstanceOrm)
    :param delete_classification: If true, deletes the workflow classification associated (only for templates)
    :params kwargs: Keyword arguments mapping column names to values to parameterize the
                   query (e.g., ``id="abc"``)
    """
    workflow = read(m, **kwargs)

    if workflow is None:
        return

    if isinstance(workflow, WorkflowTemplateOrm):
        delete_by(RuleGroupOrm, id=workflow.initial_condition_id)

        if delete_classification:
            delete_by(m=WorkflowClassificationOrm, id=workflow.classification_id)
            db_session.commit()

    for step in workflow.steps:
        delete_workflow_step(m=type(step), id=step.id)

    delete(workflow)


def delete_workflow_classification(delete_templates: bool = False, **kwargs) -> None:
    """
    Deletes a workflow classification and optionally its associated templates

    :param delete_templates: If true, deletes all workflow templates associated with this classification
    :param kwargs: Keyword arguments mapping column names to values to parameterize the query
    """
    classification = read(WorkflowClassificationOrm, **kwargs)

    if classification is None:
        return

    if delete_templates:
        # Delete all workflow templates associated with this classification
        templates = read_workflow_templates(
            workflow_classification_id=classification.id
        )
        for template in templates:
            delete_workflow(
                WorkflowTemplateOrm, delete_classification=False, id=template.id
            )

    delete(classification)


def read_instance_steps(
    model: WorkflowInstanceStepOrm, workflow_instance_id: Optional[str] = None
) -> List[WorkflowInstanceStepOrm]:
    """
    Queries the database for all instance steps from either a specific workflow instance or the entire DB

    :param model: Workflow instance model (here we assume the step is valid)

    :param workflow_instance_id: ID of workflow instance; by default this filter is not applied (query all instance steps in the DB)

    :return: A list of instance steps
    """
    query = db_session.query(model)

    if workflow_instance_id:
        query = query.filter(model.workflow_instance_id == workflow_instance_id)

    return query.all()


def read_workflow_instances(
    model: WorkflowInstanceOrm,
    user_id: Optional[int] = None,
    patient_id: Optional[str] = None,
    status: Optional[WorkflowStatusEnum] = None,
    workflow_template_id: Optional[str] = None,
) -> List[WorkflowInstanceOrm]:
    """
    Queries the database for all workflow instances that have either been assigned by a specific user or all instances in total

    :param model: Workflow instance model (here we assume the instance is valid)

    :param user_id: ID of the user which assigned the workflows

    :param patient_id: ID of the patient which the workflows were assigned to

    :param status: Query for workflows based on status

    :param workflow_template_id: ID of workflow template the instances are based on

    :return: A list of workflow instances
    """
    query = db_session.query(model)

    if user_id:
        query = query.filter(model.last_edited_by == user_id)

    if patient_id:
        query = query.filter(model.patient_id == patient_id)

    if status is not None:
        query = query.filter(model.status == status)

    if workflow_template_id:
        query = query.filter(model.workflow_template_id == workflow_template_id)

    return query.all()


def read_workflow_templates(
    workflow_classification_id: Optional[str] = None,
    is_archived: bool = False,
) -> List[WorkflowTemplateOrm]:
    """
    Queries the database for all workflow templates that either belong to a classification or in total

    :param workflow_classification_id: The ID of a workflow classification

    :param is_archived: Query for archived workflows

    :return: A list of workflow templates
    """
    query = db_session.query(WorkflowTemplateOrm)

    if workflow_classification_id is not None:
        query = query.filter(
            WorkflowTemplateOrm.classification_id == workflow_classification_id
        )

    query = query.filter(WorkflowTemplateOrm.archived == is_archived)

    return query.all()


def read_workflow_classifications(
    is_archived: bool = False,
) -> List[WorkflowClassificationOrm]:
    """
    Queries the database for all workflow classifications

    :param is_archived: Query for archived workflow classifications; defaults to False

    :return: A list of workflow classifications
    """
    query = db_session.query(WorkflowClassificationOrm)

    return query.all()


def read_template_steps(
    workflow_template_id: Optional[str] = None,
) -> List[WorkflowTemplateStepOrm]:
    """
    Queries the database for all template steps from either a specific workflow template or the entire DB

    :param model: Workflow template step model (here we assume the step is valid)

    :param workflow_template_id: ID of workflow template; by default this filter is not applied (query all instance steps in the DB)

    :return: A list of template steps
    """
    query = db_session.query(WorkflowTemplateStepOrm)

    if workflow_template_id:
        query = query.filter(
            WorkflowTemplateStepOrm.workflow_template_id == workflow_template_id
        )

    return query.all()


def read_workflows_in_collection(
    workflow_collection_id: str,
) -> List[WorkflowClassificationOrm]:
    """
    Queries the database for all workflows that belong in a specific collection

    :param workflow_collection_id: ID of workflow collection

    :return: A list of workflow classifications
    """
    query = db_session.query(WorkflowClassificationOrm)

    query = query.filter(
        WorkflowClassificationOrm.collection_id == workflow_collection_id
    )

    return query.all()


def read_rule_group(rule_group_id: str) -> RuleGroupOrm:
    """
    Queries the database for a specified rule group

    :param rule_group_id: ID of the rule group to retrieve
    :return: a Rule Group object
    """
    if rule_group_id:
        query = db_session.query(RuleGroupOrm).filter(RuleGroupOrm.id == rule_group_id)
        return query.one_or_none()

    return None