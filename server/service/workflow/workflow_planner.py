from typing import Optional

from common.commonUtil import get_current_time
from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from service.workflow.evaluate.rule_evaluator import RuleEvaluator
from service.workflow.evaluate.rules_engine import RuleStatus
from service.workflow.workflow_errors import InvalidWorkflowActionError
from service.workflow.workflow_view import WorkflowView
from validation.workflow_models import (
    CompleteStepActionModel,
    CompleteWorkflowActionModel,
    StartStepActionModel,
    StartWorkflowActionModel,
    WorkflowActionModel,
    WorkflowBranchEvaluation,
    WorkflowInstanceStepModel,
    WorkflowStepEvaluation,
    WorkflowTemplateStepBranchModel,
)


class WorkflowPlanner:
    """
    Manages the workflow progression of a workflow instance.

    Responsibilities:
    - Evaluate workflow steps (NOTE: not rules, which are delegated to RuleEvaluator)
    - Determine available actions
    - Apply actions
    - Advance to the next step

    Notes:
    - Workflow state fields related to progression should generally only be
      modified through this class to help ensure predictable behaviour
      (e.g. status fields).

    - An action should generally do one thing. For example, starting a
      workflow does not also start the first step. This keeps progression
      predictable and flexible.

    - Applying an action is separate from advancing. This decoupling allows
      users to choose if and when to advance to the next step or override
      to a different one.

    """

    @staticmethod
    def _select_branch_id(
        branch_evaluations: list[WorkflowBranchEvaluation],
    ) -> Optional[str]:
        """
        A branch selection strategy that selects the first branch whose rule
        evaluated to TRUE.

        :param branch_evaluations: Evaluated branches for a workflow step
        :returns: The selected branch ID, or None if no branch applies
        """
        for branch_evaluation in branch_evaluations:
            if branch_evaluation.rule_status == RuleStatus.TRUE:
                return branch_evaluation.branch_id

        return None

    @staticmethod
    def _evaluate_branch(
        branch: WorkflowTemplateStepBranchModel,
        patient_id: str,
    ) -> WorkflowBranchEvaluation:
        """
        Evaluates a single workflow branch condition.

        :param branch: Workflow template branch to evaluate
        :param patient_id: Patient ID for data resolution
        :returns: Evaluation result for the branch
        """
        rule = branch.condition.rule if branch.condition else None
        evaluator = RuleEvaluator()
        rule_status, var_resolutions = evaluator.evaluate_rule(rule, patient_id)

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
        Evaluates all branches of a workflow step and determines which branch
        (if any) should be selected.

        :param ctx: Workflow view
        :param step: Workflow instance step to evaluate
        :returns: Evaluation result for the step
        """
        branch_evaluations = []
        selected_branch_id = None

        # Get patient_id from the workflow instance
        # TODO: Currently only patient_id is supported for data resolution.
        # Need to decide on ID resolution strategy for other object types.
        patient_id = ctx.instance.patient_id
        if not patient_id:
            raise ValueError(
                "Workflow instance must have a patient_id to evaluate rules"
            )

        branches = ctx.get_template_step(step.workflow_template_step_id).branches

        branch_evaluations = [
            WorkflowPlanner._evaluate_branch(branch, patient_id) for branch in branches
        ]
        selected_branch_id = WorkflowPlanner._select_branch_id(branch_evaluations)

        step_evaluation = WorkflowStepEvaluation(
            branch_evaluations=branch_evaluations, selected_branch_id=selected_branch_id
        )
        return step_evaluation

    @staticmethod
    def _is_terminal_step(ctx: WorkflowView, step: WorkflowInstanceStepModel) -> bool:
        """
        Returns True if the step is terminal (i.e., has no outgoing branches),
        False otherwise.
        """
        branches = ctx.get_template_step(step.workflow_template_step_id).branches
        return branches == []

    @staticmethod
    def _get_immediate_next_step(
        ctx: WorkflowView, step: WorkflowInstanceStepModel
    ) -> Optional[WorkflowInstanceStepModel]:
        """
        Determines the next workflow step after the given step based on step evaluation.
        At most one branch is selected.

        :returns: The next workflow instance step, or None if no transition is possible
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

        Available actions depend on workflow and current step state.
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
    def apply_action(ctx: WorkflowView, action: WorkflowActionModel):
        """
        Apply a single workflow action to the workflow instance.

        This method mutates workflow instance state as required by the action
        (e.g. status, timestamps).

        :param ctx: Workflow view
        :param action: Action to apply
        :raises InvalidWorkflowActionError: if the action is not valid
        """
        valid_actions = WorkflowPlanner.get_available_actions(ctx)

        if action not in valid_actions:
            raise InvalidWorkflowActionError(action, valid_actions)

        if isinstance(action, StartWorkflowActionModel):
            ctx.instance.status = WorkflowStatusEnum.ACTIVE
            ctx.instance.start_date = get_current_time()

        elif isinstance(action, StartStepActionModel):
            step = ctx.get_instance_step(action.step_id)
            step.status = WorkflowStepStatusEnum.ACTIVE
            step.start_date = get_current_time()

        elif isinstance(action, CompleteStepActionModel):
            step = ctx.get_instance_step(action.step_id)
            step.status = WorkflowStepStatusEnum.COMPLETED
            step.completion_date = get_current_time()

        elif isinstance(action, CompleteWorkflowActionModel):
            ctx.instance.status = WorkflowStatusEnum.COMPLETED
            ctx.instance.completion_date = get_current_time()

        else:
            raise ValueError(f"Action '{action}' is not supported")

    @staticmethod
    def _get_next_step_to_advance_to(
        ctx: WorkflowView, step: WorkflowInstanceStepModel
    ) -> WorkflowInstanceStepModel:
        """
        Walk forward from a completed step until an incomplete step is found,
        or no next step is available.

        :param ctx: Workflow view
        :param step: Completed step to advance from
        :returns: The next step to do
        """
        assert step.status == WorkflowStepStatusEnum.COMPLETED
        next_step = WorkflowPlanner._get_immediate_next_step(ctx, step)

        if next_step is None:
            # Reached the end OR no branch was selected
            return step

        if next_step.status != WorkflowStepStatusEnum.COMPLETED:
            return next_step

        return WorkflowPlanner._get_next_step_to_advance_to(ctx, next_step)

    @staticmethod
    def advance(ctx: WorkflowView) -> None:
        """
        Advances the workflow's current step pointer if possible.

        - If the workflow is starting: advances to the first step
        - If the current step is completed: advances until it reaches the next
          incomplete step or until there is no next step
        """
        if (
            ctx.instance.current_step_id is None
            and ctx.instance.status == WorkflowStatusEnum.ACTIVE
        ):
            starting_instance_step = ctx.get_starting_step()
            ctx.instance.current_step_id = starting_instance_step.id

        current_step = ctx.get_current_step()
        if current_step and current_step.status == WorkflowStepStatusEnum.COMPLETED:
            next_step = WorkflowPlanner._get_next_step_to_advance_to(ctx, current_step)
            if next_step.id != current_step.id:
                ctx.instance.current_step_id = next_step.id

    @staticmethod
    def override_current_step(ctx: WorkflowView, step_id: str) -> None:
        """
        Override the workflow's current step.

        :param ctx: Workflow view
        :param step_id: ID of the step to set as current
        """
        assert ctx.has_instance_step(step_id)
        ctx.instance.current_step_id = step_id
