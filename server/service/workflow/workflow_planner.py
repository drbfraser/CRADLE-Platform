from typing import Optional

from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from service.workflow.workflow_actions import (
    CompleteStepAction,
    StartStepAction,
    StartWorkflowAction,
    WorkflowAction,
)
from service.workflow.workflow_errors import InvalidWorkflowActionError
from service.workflow.workflow_operations import (
    UpdateCurrentStepOp,
    UpdateStepStatusOp,
    UpdateWorkflowStatusOp,
    WorkflowOp,
)
from service.workflow.workflow_view import WorkflowView
from validation.workflow_models import WorkflowInstanceStepModel


class WorkflowPlanner:
    """
    Stateless planner that decides *what* operations should be performed next on
    a workflow. Doesn't mutate any workflow state.
    """

    @staticmethod
    def _eval_next_step_from_this_step(
        ctx: WorkflowView, step: WorkflowInstanceStepModel
    ) -> Optional[WorkflowInstanceStepModel]:
        """
        Evaluate the next step to go to from this step.

        For now, simply pick the target step from the first branch.
        This may be extended in the future to involve the Rule Engine.
        """
        template_step = ctx.get_template_step(step.workflow_template_step_id)

        if template_step.branches:
            next_step = ctx.get_instance_step_for_template_step(
                template_step.branches[0].target_step_id
            )
        else:
            next_step = None

        return next_step

    @staticmethod
    def _is_last_step(ctx: WorkflowView, step: WorkflowInstanceStepModel) -> bool:
        next_step = WorkflowPlanner._eval_next_step_from_this_step(ctx, step)
        return next_step is None

    @staticmethod
    def get_available_actions(ctx: WorkflowView) -> list[WorkflowAction]:
        """
        Returns the actions available to take as the next action in the workflow.
        """
        current_step = ctx.get_current_step()

        if ctx.instance.status == WorkflowStatusEnum.PENDING:
            return [StartWorkflowAction()]

        if current_step:
            if current_step.status == WorkflowStepStatusEnum.PENDING:
                return [StartStepAction(step_id=current_step.id)]

            if current_step.status == WorkflowStepStatusEnum.ACTIVE:
                return [CompleteStepAction(step_id=current_step.id)]

            if current_step.status == WorkflowStepStatusEnum.COMPLETED:
                next_step = WorkflowPlanner._eval_next_step_from_this_step(
                    ctx=ctx, step=current_step
                )

                if next_step:
                    # Currently, step should always be in PENDING state, so the only available
                    # action is to start it
                    return [StartStepAction(step_id=next_step.id)]

        return []

    @staticmethod
    def get_operations(ctx: WorkflowView, action: WorkflowAction) -> list[WorkflowOp]:
        """
        Translate an action into the workflow operations that should all be applied to
        the workflow instance to apply that action.
        """
        valid_actions = WorkflowPlanner.get_available_actions(ctx)

        if action not in valid_actions:
            raise InvalidWorkflowActionError(action, valid_actions)

        if isinstance(action, StartWorkflowAction):
            starting_step = ctx.get_instance_step_for_template_step(
                ctx.get_starting_step().id
            )

            return [
                UpdateWorkflowStatusOp(WorkflowStatusEnum.ACTIVE),
                UpdateCurrentStepOp(starting_step.id),
                UpdateStepStatusOp(starting_step.id, WorkflowStepStatusEnum.ACTIVE),
            ]

        if isinstance(action, StartStepAction):
            ops = []

            if ctx.get_current_step() != action.step_id:
                ops.append(UpdateCurrentStepOp(new_current_step_id=action.step_id))

            ops.append(
                UpdateStepStatusOp(action.step_id, WorkflowStepStatusEnum.ACTIVE)
            )

            return ops

        if isinstance(action, CompleteStepAction):
            ops = [UpdateStepStatusOp(action.step_id, WorkflowStepStatusEnum.COMPLETED)]

            step = ctx.get_instance_step(action.step_id)

            if WorkflowPlanner._is_last_step(ctx, step):
                ops.extend(
                    [
                        UpdateCurrentStepOp(new_current_step_id=None),
                        UpdateWorkflowStatusOp(WorkflowStatusEnum.COMPLETED),
                    ]
                )

            return ops

        raise ValueError(f"Action '{action}' is not supported")
