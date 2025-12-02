from typing import Optional

from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from service.workflow.evaluate.integrated_rule_evaluator import IntegratedRuleEvaluator
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
    StartStepActionModel,
    StartWorkflowActionModel,
    VariableResolution,
    WorkflowActionModel,
    WorkflowBranchEvaluation,
    WorkflowInstanceStepModel,
    WorkflowStepEvaluation,
    WorkflowTemplateStepBranchModel,
)



class WorkflowPlanner:
    """
    Stateless planner that decides *what* operations should be performed next on
    a workflow. Doesn't mutate any workflow state.
    """

    @staticmethod
    def _evaluate_branch(
        branch: WorkflowTemplateStepBranchModel,
        patient_id: str,
    ) -> WorkflowBranchEvaluation:
        """
        Evaluates the rule of a workflow step's branch.
        
        :param branch: The branch to evaluate
        :param patient_id: Patient ID for data resolution
        :returns: WorkflowBranchEvaluation with rule status and variable resolutions
        """
        rule = branch.condition.rule if branch.condition else None
        evaluator = IntegratedRuleEvaluator()
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
        Evaluates all branches of a workflow step and determines the selected branch
        based on rule evaluations.
        
        :param ctx: WorkflowView providing access to template and instance
        :param step: The workflow instance step to evaluate
        :returns: WorkflowStepEvaluation with branch evaluations and selected branch
        """
        branch_evaluations = []
        selected_branch_id = None
        
        # Get patient_id from the workflow instance
        # TODO: Currently only patient_id is supported for data resolution.
        # Need to decide on ID resolution strategy for other object types.
        patient_id = ctx.instance.patient_id
        if not patient_id:
            raise ValueError("Workflow instance must have a patient_id to evaluate rules")

        branches = ctx.get_template_step(step.workflow_template_step_id).branches

        for branch in branches:
            branch_evaluation = WorkflowPlanner._evaluate_branch(branch, patient_id)
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
    def _eval_next_step_from_this_step(
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
    def _is_last_step(ctx: WorkflowView, step: WorkflowInstanceStepModel) -> bool:
        next_step = WorkflowPlanner._eval_next_step_from_this_step(ctx, step)
        return next_step is None

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

            if current_step.status == WorkflowStepStatusEnum.COMPLETED:
                next_step = WorkflowPlanner._eval_next_step_from_this_step(
                    ctx=ctx, step=current_step
                )

                if next_step:
                    # Currently, step should always be in PENDING state, so the only available
                    # action is to start it
                    return [StartStepActionModel(step_id=next_step.id)]

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
            starting_step = ctx.get_instance_step_for_template_step(
                ctx.get_starting_step().id
            )

            return [
                UpdateWorkflowStatusOp(WorkflowStatusEnum.ACTIVE),
                UpdateCurrentStepOp(starting_step.id),
                UpdateStepStatusOp(starting_step.id, WorkflowStepStatusEnum.ACTIVE),
                UpdateWorkflowStartDate(),
                UpdateWorkflowStepStartDate(starting_step.id),
            ]

        if isinstance(action, StartStepActionModel):
            return [
                UpdateCurrentStepOp(new_current_step_id=action.step_id),
                UpdateStepStatusOp(action.step_id, WorkflowStepStatusEnum.ACTIVE),
                UpdateWorkflowStepStartDate(action.step_id),
            ]

        if isinstance(action, CompleteStepActionModel):
            ops = [
                UpdateStepStatusOp(action.step_id, WorkflowStepStatusEnum.COMPLETED),
                UpdateWorkflowStepCompletionDate(action.step_id),
            ]

            step = ctx.get_instance_step(action.step_id)

            if WorkflowPlanner._is_last_step(ctx, step):
                ops.extend(
                    [
                        UpdateCurrentStepOp(new_current_step_id=None),
                        UpdateWorkflowStatusOp(WorkflowStatusEnum.COMPLETED),
                        UpdateWorkflowCompletionDate(),
                    ]
                )

            return ops

        raise ValueError(f"Action '{action}' is not supported")
