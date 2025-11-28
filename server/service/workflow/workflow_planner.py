from typing import Optional

from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from service.workflow.evaluate.rules_engine import RuleStatus
from service.workflow.workflow_errors import InvalidWorkflowActionError
from service.workflow.workflow_operations import (
    UpdateCurrentStepOp,
    UpdateStepStatusOp,
    UpdateWorkflowCompletionDate,
    UpdateWorkflowStartDate,
    UpdateWorkflowStatusOp,
    UpdateWorkflowStepCompletionDate,
    UpdateWorkflowStepStartDate,
    WorkflowOp,
)
from service.workflow.workflow_view import WorkflowView
from validation.workflow_models import (
    CompleteStepActionModel,
    CompleteWorkflowActionModel,
    StartStepActionModel,
    StartWorkflowActionModel,
    VariableResolution,
    WorkflowActionModel,
    WorkflowBranchEvaluation,
    WorkflowInstanceStepModel,
    WorkflowStepEvaluation,
    WorkflowTemplateStepBranchModel,
)


# NOTE: This class may not belong here since it's not inherently workflow-specific.
# Once implemented, it could be moved to service/evaluate or a more relevant location.
class RuleEvaluator:
    """
    Evaluates a rule.

    For now, this is a stub that always returns TRUE and an empty list for variable resolutions.
    TODO: Implement evaluate_rule by integrating the variable resolver and rule engine.
    """

    @staticmethod
    def evaluate_rule(
        rule: Optional[str],  # noqa: ARG004
    ) -> tuple[RuleStatus, list[VariableResolution]]:
        return (RuleStatus.TRUE, [])


class WorkflowPlanner:
    """
    Stateless planner that decides *what* operations should be performed next on
    a workflow. Doesn't mutate any workflow state.
    """

    @staticmethod
    def _evaluate_branch(
        branch: WorkflowTemplateStepBranchModel,
    ) -> WorkflowBranchEvaluation:
        """
        Evaluates the rule of a workflow step's branch.
        """
        rule = branch.condition.rule if branch.condition else None
        rule_status, var_resolutions = RuleEvaluator.evaluate_rule(rule)

        branch_evaluation = WorkflowBranchEvaluation(
            branch_id=branch.id,
            rule=rule,
            var_resolutions=var_resolutions,
            rule_status=rule_status,
        )

        return branch_evaluation

    @staticmethod
    def evaluate_step(
        ctx: WorkflowView, step: WorkflowInstanceStepModel
    ) -> WorkflowStepEvaluation:
        """
        Evaluates all branches of a workflow step and determines the selected branch
        based on rule evaluations.
        """
        branch_evaluations = []
        selected_branch_id = None

        branches = ctx.get_template_step(step.workflow_template_step_id).branches

        for branch in branches:
            branch_evaluation = WorkflowPlanner._evaluate_branch(branch)
            branch_evaluations.append(branch_evaluation)

            if (
                not selected_branch_id
                and branch_evaluation.rule_status == RuleStatus.TRUE
            ):
                selected_branch_id = branch.id

        step_evaluation = WorkflowStepEvaluation(
            branch_evaluations=branch_evaluations, selected_branch_id=selected_branch_id
        )
        return step_evaluation

    @staticmethod
    def _is_terminal_step(ctx: WorkflowView, step: WorkflowInstanceStepModel):
        branches = ctx.get_template_step(step.workflow_template_step_id).branches
        return branches == [] # A terminal step should not have any branches.

    @staticmethod
    def _get_next_step(
        ctx: WorkflowView, step: WorkflowInstanceStepModel
    ) -> Optional[WorkflowInstanceStepModel]:
        """
        Evaluate the next step to go to from this step.
        """
        step_evaluation = WorkflowPlanner.evaluate_step(ctx, step)

        if step_evaluation.selected_branch_id is not None:
            branch = ctx.get_template_step_branch(
                ctx.get_template_step(step.workflow_template_step_id),
                step_evaluation.selected_branch_id,
            )
            next_step = ctx.get_instance_step_for_template_step(branch.target_step_id)
        else:
            next_step = None

        return next_step

    @staticmethod
    def get_available_actions(ctx: WorkflowView) -> list[WorkflowActionModel]:
        """
        Returns the actions available to take as the next action in the workflow.
        """
        current_step = ctx.get_current_step()

        if ctx.instance.status == WorkflowStatusEnum.PENDING:
            return [StartWorkflowActionModel()]

        if current_step:
            if current_step.status == WorkflowStepStatusEnum.PENDING:
                return [StartStepActionModel(step_id=current_step.id)]

            if current_step.status == WorkflowStepStatusEnum.ACTIVE:
                return [CompleteStepActionModel(step_id=current_step.id)]

            if (
                ctx.instance.status != WorkflowStatusEnum.COMPLETED
                and WorkflowPlanner._is_terminal_step(ctx, current_step)
            ):
                return [CompleteWorkflowActionModel()]

        return []

    @staticmethod
    def get_operations(
        ctx: WorkflowView, action: WorkflowActionModel
    ) -> list[WorkflowOp]:
        """
        Translate an action into the workflow operations that should all be applied to
        the workflow instance to apply that action.
        """
        valid_actions = WorkflowPlanner.get_available_actions(ctx)

        if action not in valid_actions:
            raise InvalidWorkflowActionError(action, valid_actions)

        if isinstance(action, StartWorkflowActionModel):
            return [
                UpdateWorkflowStatusOp(WorkflowStatusEnum.ACTIVE),
                UpdateWorkflowStartDate(),
            ]

        if isinstance(action, StartStepActionModel):
            return [
                UpdateStepStatusOp(action.step_id, WorkflowStepStatusEnum.ACTIVE),
                UpdateWorkflowStepStartDate(action.step_id),
            ]

        if isinstance(action, CompleteStepActionModel):
            return [
                UpdateStepStatusOp(action.step_id, WorkflowStepStatusEnum.COMPLETED),
                UpdateWorkflowStepCompletionDate(action.step_id),
            ]

        if isinstance(action, CompleteWorkflowActionModel):
            return [
                UpdateWorkflowStatusOp(WorkflowStatusEnum.COMPLETED),
                UpdateWorkflowCompletionDate(),
            ]

        raise ValueError(f"Action '{action}' is not supported")

    @staticmethod
    def _find_next_step(
        ctx: WorkflowView, step: WorkflowInstanceStepModel
    ) -> WorkflowInstanceStepModel:
        """
        Walk forward from `step` until we find an incomplete step, or the next step is None.
        """
        assert step.status == WorkflowStepStatusEnum.COMPLETED
        next_step = WorkflowPlanner._get_next_step(ctx, step)

        if next_step is None:
            # Reached the end OR no branch was selected
            return step

        if next_step.status != WorkflowStepStatusEnum.COMPLETED:
            return next_step

        return WorkflowPlanner._find_next_step(ctx, next_step)

    @staticmethod
    def advance(ctx: WorkflowView) -> list[WorkflowOp]:
        if (
            ctx.instance.current_step_id is None
            and ctx.instance.status == WorkflowStepStatusEnum.ACTIVE
        ):
            starting_step = ctx.get_starting_step()
            return [UpdateCurrentStepOp(starting_step.id)]

        current_step = ctx.get_current_step()
        if current_step and current_step.status == WorkflowStepStatusEnum.COMPLETED:
            next_step = WorkflowPlanner._find_next_step(ctx, current_step)
            if next_step.id != current_step.id:
                return [UpdateCurrentStepOp(next_step.id)]

        return []

    @staticmethod
    def override_current_step(ctx: WorkflowView, step_id: str) -> list[WorkflowOp]:
        """
        Override the workflow's current step.
        """
        assert ctx.has_instance_step(step_id)
        return [UpdateCurrentStepOp(step_id)]
