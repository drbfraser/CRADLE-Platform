from typing import Optional

import data.db_operations as crud
from common.commonUtil import get_current_time, get_uuid
from data import marshal
from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from models.workflows import WorkflowInstanceOrm, WorkflowTemplateOrm
from service.workflow.workflow_planner import WorkflowPlanner
from service.workflow.workflow_view import WorkflowView
from validation.workflow_models import (
    StartStepActionModel,
    StartWorkflowActionModel,
    WorkflowActionModel,
    WorkflowInstanceModel,
    WorkflowInstanceStepModel,
    WorkflowStepEvaluation,
    WorkflowTemplateModel,
    WorkflowTemplateStepModel,
)


class WorkflowService:
    # TODO: make these staticmethods
    @classmethod
    def generate_workflow_instance(
        cls, workflow_template: WorkflowTemplateModel
    ) -> WorkflowInstanceModel:
        workflow_instance = {}

        workflow_instance["id"] = get_uuid()
        workflow_instance["name"] = workflow_template.name
        workflow_instance["description"] = workflow_template.description
        workflow_instance["start_date"] = None
        workflow_instance["current_step_id"] = None
        workflow_instance["last_edited"] = None
        workflow_instance["completion_date"] = None
        workflow_instance["status"] = WorkflowStatusEnum.PENDING
        workflow_instance["workflow_template_id"] = workflow_template.id
        workflow_instance["patient_id"] = None

        step = [
            cls._generate_workflow_instance_step(step_template, workflow_instance["id"])
            for step_template in workflow_template.steps
        ]

        workflow_instance["steps"] = step

        return WorkflowInstanceModel(**workflow_instance)

    @classmethod
    def _generate_workflow_instance_step(
        cls,
        workflow_template_step: WorkflowTemplateStepModel,
        workflow_instance_id: str,
    ) -> WorkflowInstanceStepModel:
        step = {}

        step["id"] = get_uuid()
        step["name"] = workflow_template_step.name
        step["description"] = workflow_template_step.description
        step["start_date"] = None
        step["last_edited"] = None
        step["assigned_to"] = None
        step["completion_date"] = None
        step["expected_completion"] = None
        step["status"] = WorkflowStepStatusEnum.PENDING
        step["data"] = None
        step["workflow_instance_id"] = workflow_instance_id
        step["workflow_template_step_id"] = workflow_template_step.id
        step["triggered_by"] = None
        step["form_id"] = None
        step["form"] = None

        return step

    @classmethod
    def upsert_workflow_instance(cls, workflow_instance: WorkflowInstanceModel):
        workflow_instance.last_edited = get_current_time()

        for instance_step in workflow_instance.steps:
            instance_step.last_edited = get_current_time()

        workflow_instance_orm = marshal.unmarshal(
            WorkflowInstanceOrm, workflow_instance.model_dump()
        )

        cls._check_last_edited_and_start_date(workflow_instance)

        crud.common_crud.merge(workflow_instance_orm)

    @classmethod
    def upsert_workflow_template(cls, workflow_template: WorkflowTemplateModel):
        workflow_template.last_edited = get_current_time()

        for template_step in workflow_template.steps:
            template_step.last_edited = get_current_time()

        workflow_template_orm = marshal.unmarshal(
            WorkflowTemplateOrm, workflow_template.model_dump()
        )

        crud.common_crud.merge(workflow_template_orm)

    @classmethod
    def get_workflow_instance(
        cls, workflow_instance_id: str
    ) -> Optional[WorkflowInstanceModel]:
        workflow_instance_orm = crud.read(WorkflowInstanceOrm, id=workflow_instance_id)

        if not workflow_instance_orm:
            return None

        workflow_instance_dict = marshal.marshal(workflow_instance_orm)
        workflow_instance = WorkflowInstanceModel(**workflow_instance_dict)
        return workflow_instance

    @classmethod
    def get_workflow_template(
        cls, workflow_template_id: str
    ) -> Optional[WorkflowTemplateModel]:
        workflow_template_orm = crud.read(WorkflowTemplateOrm, id=workflow_template_id)

        if not workflow_template_orm:
            return None

        workflow_template_dict = marshal.marshal(workflow_template_orm)

        workflow_template = WorkflowTemplateModel(**workflow_template_dict)
        return workflow_template

    @staticmethod
    def get_available_workflow_actions(
        workflow_view: WorkflowView,
    ) -> list[WorkflowActionModel]:
        available_actions = WorkflowPlanner.get_available_actions(ctx=workflow_view)
        return available_actions

    @staticmethod
    def apply_workflow_action(
        action: WorkflowActionModel, workflow_view: WorkflowView
    ) -> None:
        ops = WorkflowPlanner.get_operations(ctx=workflow_view, action=action)
        for op in ops:
            op.apply(workflow_view)

    @staticmethod
    def evaluate_workflow_step(
        workflow_view: WorkflowView, instance_step_id: str
    ) -> WorkflowStepEvaluation:
        assert workflow_view.has_instance_step(instance_step_id)

        step_evaluation = WorkflowPlanner.evaluate_step(
            ctx=workflow_view, step=workflow_view.get_instance_step(instance_step_id)
        )
        return step_evaluation

    @staticmethod
    def advance_workflow(workflow_view: WorkflowView) -> None:
        ops = WorkflowPlanner.advance(ctx=workflow_view)
        for op in ops:
            op.apply(workflow_view)

    @staticmethod
    def override_current_step(
        workflow_view: WorkflowView, instance_step_id: str
    ) -> None:
        assert workflow_view.has_instance_step(instance_step_id)
        ops = WorkflowPlanner.override_current_step(
            ctx=workflow_view, step_id=instance_step_id
        )
        for op in ops:
            op.apply(workflow_view)

    @staticmethod
    def start_workflow(workflow_view: WorkflowView) -> None:
        """
        Starting the workflow is a special case. Start the workflow, advance to
        the first step, and start the first step.
        """
        actions = WorkflowService.get_available_workflow_actions(workflow_view)

        assert actions and isinstance(actions[0], StartWorkflowActionModel)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)

        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        assert not actions
        WorkflowService.advance_workflow(workflow_view)

        actions = WorkflowService.get_available_workflow_actions(workflow_view)
        assert actions and isinstance(actions[0], StartStepActionModel)
        WorkflowService.apply_workflow_action(actions[0], workflow_view)

    @staticmethod
    def _check_last_edited_and_start_date(
        workflow_instance: WorkflowInstanceModel,
    ) -> None:
        """
        Validate that last_edited >= start_date for the workflow instance and its steps.

        This check isn't enforced at the model level to allow us to set start_date to
        the current time, otherwise last_edited becomes < start_date.

        If this error is thrown, it indicates a programming error on the backend.
        """
        if (
            workflow_instance.last_edited is not None
            and workflow_instance.start_date is not None
            and workflow_instance.last_edited < workflow_instance.start_date
        ):
            raise ValueError("last_edited cannot be before start_date")

        if any(
            instance_step.last_edited is not None
            and instance_step.start_date is not None
            and instance_step.last_edited < instance_step.start_date
            for instance_step in workflow_instance.steps
        ):
            raise ValueError("last_edited cannot be before start_date")
