from typing import Optional

import data.db_operations as crud
from common.commonUtil import get_current_time, get_uuid
from data import orm_serializer
from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from models.workflows import (
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
)
from service.workflow.workflow_planner import WorkflowPlanner
from service.workflow.workflow_view import WorkflowView
from validation.workflow_api_models import (
    WorkflowInstancePatchModel,
    WorkflowInstanceStepPatchModel,
)
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
    @staticmethod
    def generate_workflow_instance(
        workflow_template: WorkflowTemplateModel,
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
            WorkflowService._generate_workflow_instance_step(
                step_template, workflow_instance["id"]
            )
            for step_template in workflow_template.steps
        ]

        workflow_instance["steps"] = step

        return WorkflowInstanceModel(**workflow_instance)

    @staticmethod
    def _generate_workflow_instance_step(
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

    @staticmethod
    def upsert_workflow_instance(workflow_instance: WorkflowInstanceModel):
        """
        Insert or update a workflow instance in the database.
        """
        workflow_instance.last_edited = get_current_time()

        for instance_step in workflow_instance.steps:
            instance_step.last_edited = get_current_time()

        WorkflowService._validate_workflow_instance_dates(workflow_instance)

        workflow_instance_orm = orm_serializer.unmarshal(
            WorkflowInstanceOrm, workflow_instance.model_dump()
        )

        crud.common_crud.merge(workflow_instance_orm)

    @staticmethod
    def upsert_workflow_instance_step(
        workflow_instance_step: WorkflowInstanceStepModel,
    ):
        """
        Insert or update a workflow instance step in the database.
        """
        workflow_instance_step.last_edited = get_current_time()

        WorkflowService._validate_start_date_and_last_edited(
            workflow_instance_step.start_date, workflow_instance_step.last_edited
        )

        workflow_instance_step_orm = orm_serializer.unmarshal(
            WorkflowInstanceStepOrm, workflow_instance_step.model_dump()
        )

        crud.common_crud.merge(workflow_instance_step_orm)

    @staticmethod
    def upsert_workflow_template(workflow_template: WorkflowTemplateModel):
        """
        Insert or update a workflow template in the database.
        """
        workflow_template.last_edited = get_current_time()

        for template_step in workflow_template.steps:
            template_step.last_edited = get_current_time()

        workflow_template_orm = orm_serializer.unmarshal(
            WorkflowTemplateOrm, workflow_template.model_dump()
        )

        crud.common_crud.merge(workflow_template_orm)

    @staticmethod
    def get_workflow_instance(
        workflow_instance_id: str,
    ) -> Optional[WorkflowInstanceModel]:
        """
        Fetch a workflow instance by ID, returning None if it does not exist.
        """
        workflow_instance_orm = crud.read(WorkflowInstanceOrm, id=workflow_instance_id)

        if not workflow_instance_orm:
            return None

        workflow_instance_dict = orm_serializer.marshal(workflow_instance_orm)
        workflow_instance = WorkflowInstanceModel(**workflow_instance_dict)
        return workflow_instance

    @staticmethod
    def get_workflow_instances(
        user_id: Optional[int] = None,
        patient_id: Optional[str] = None,
        status: Optional[WorkflowStatusEnum] = None,
        workflow_template_id: Optional[str] = None,
    ) -> list[WorkflowInstanceModel]:
        """
        Fetch a list of workflow instances, optionally filtered by user, patient, status
        or workflow template.
        """
        workflow_instance_orms = crud.read_workflow_instances(
            user_id, patient_id, status, workflow_template_id
        )

        workflow_instance_dicts = [
            orm_serializer.marshal(workflow_instance_orm)
            for workflow_instance_orm in workflow_instance_orms
        ]

        return [
            WorkflowInstanceModel(**workflow_instance_dict)
            for workflow_instance_dict in workflow_instance_dicts
        ]

    @staticmethod
    def get_workflow_instance_step(
        workflow_instance_step_id: str,
    ) -> Optional[WorkflowInstanceModel]:
        """
        Fetch a workflow instance step by ID, returning None if it does not exist.
        """
        workflow_instance_step_orm = crud.read(
            WorkflowInstanceStepOrm, id=workflow_instance_step_id
        )

        if not workflow_instance_step_orm:
            return None

        workflow_instance_step_dict = orm_serializer.marshal(workflow_instance_step_orm)
        workflow_instance_step = WorkflowInstanceStepModel(
            **workflow_instance_step_dict
        )
        return workflow_instance_step

    @staticmethod
    def get_workflow_template(
        workflow_template_id: str,
    ) -> Optional[WorkflowTemplateModel]:
        """
        Fetch a workflow template by ID, returning None if it does not exist.
        """
        workflow_template_orm = crud.read(WorkflowTemplateOrm, id=workflow_template_id)

        if not workflow_template_orm:
            return None

        workflow_template_dict = orm_serializer.marshal(workflow_template_orm)
        workflow_template = WorkflowTemplateModel(**workflow_template_dict)
        return workflow_template

    @staticmethod
    def delete_workflow_instance(workflow_instance_id: str) -> None:
        """
        Delete a workflow instance from the database by its ID.
        """
        crud.delete_workflow(WorkflowInstanceOrm, id=workflow_instance_id)

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
        WorkflowPlanner.apply_action(ctx=workflow_view, action=action)

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
        WorkflowPlanner.advance(ctx=workflow_view)

    @staticmethod
    def override_current_step(
        workflow_view: WorkflowView, instance_step_id: str
    ) -> None:
        assert workflow_view.has_instance_step(instance_step_id)
        WorkflowPlanner.override_current_step(
            ctx=workflow_view, step_id=instance_step_id
        )

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
    def apply_workflow_instance_patch(
        workflow_instance: WorkflowInstanceModel, patch: WorkflowInstancePatchModel
    ) -> None:
        """
        Apply a PATCH to a workflow instance.
        """
        if patch.name is not None:
            workflow_instance.name = patch.name

        if patch.description is not None:
            workflow_instance.description = patch.description

        if patch.patient_id is not None:
            workflow_instance.patient_id = patch.patient_id

    @staticmethod
    def apply_workflow_instance_step_patch(
        workflow_instance_step: WorkflowInstanceStepModel,
        patch: WorkflowInstanceStepPatchModel,
    ) -> None:
        """
        Apply a PATCH to a workflow instance step.
        """
        if patch.form_id is not None:
            workflow_instance_step.form_id = patch.form_id

        if patch.assigned_to is not None:
            workflow_instance_step.assigned_to = patch.assigned_to

    @staticmethod
    def archive_form(
        workflow_instance_step: WorkflowInstanceStepModel, editor_user_id: int
    ) -> None:
        """
        Archive the form associated with a workflow instance step and persist
        the update.

        :param workflow_instance_step: The workflow step whose form should be archived.
        :param editor_user_id: The ID of the user performing the archive.
        """
        assert workflow_instance_step.form

        # NOTE: Perhaps use Pydantic form model to improve type safety and correctness
        workflow_instance_step.form["archived"] = True
        workflow_instance_step.form["last_edited_by"] = editor_user_id
        workflow_instance_step.form["last_edited"] = get_current_time()
        workflow_instance_step.form_id = None

        WorkflowService.upsert_workflow_instance_step(workflow_instance_step)

    @staticmethod
    def _validate_start_date_and_last_edited(
        start_date: Optional[int], last_edited: Optional[int]
    ) -> None:
        """
        Validate that last_edited >= start_date.
        """
        if (
            last_edited is not None
            and start_date is not None
            and last_edited < start_date
        ):
            raise ValueError("last_edited cannot be before start_date")

    @staticmethod
    def _validate_workflow_instance_dates(
        workflow_instance: WorkflowInstanceModel,
    ) -> None:
        """
        Validate that last_edited >= start_date for the workflow instance and its steps.

        This check isn't enforced at the model level to allow us to set start_date to
        the current time, otherwise last_edited becomes < start_date.

        If this error is thrown, it indicates a programming error on the backend.
        """
        WorkflowService._validate_start_date_and_last_edited(
            workflow_instance.start_date, workflow_instance.last_edited
        )

        for step in workflow_instance.steps:
            WorkflowService._validate_start_date_and_last_edited(
                step.start_date, step.last_edited
            )
