from dataclasses import dataclass
from typing import Optional

from enums import StrEnum, WorkflowStatusEnum, WorkflowStepStatusEnum
from validation.workflow_models import (
    WorkflowInstanceModel,
    WorkflowInstanceStepModel,
    WorkflowTemplateModel,
    WorkflowTemplateStepModel,
)


class WorkflowOpName(StrEnum):
    START_WORKFLOW = "start_workflow"
    COMPLETE_WORKFLOW = "complete_workflow"
    START_STEP = "start_step"
    COMPLETE_STEP = "complete_step"
    TRANSITION_TO_STEP = "transition_to_step"


@dataclass
class WorkflowOp:
    name: WorkflowOpName
    params: dict = None

    def __repr__(self):
        params_str = f", params={self.params}" if self.params else ""
        return f"WorkflowOp(name='{self.name}'{params_str})"


class WorkflowView:
    """
    A read-only view over a workflow instance and its template that provides
    convenient access to workflow steps.

    Should be stable because:
        - It holds references to the workflow models, so changes to state made
          externally are reflected automatically
        - Step ID mappings should be fixed for a given template-instance pair
    """

    def __init__(
        self, template: WorkflowTemplateModel, instance: WorkflowInstanceModel
    ):
        self.template = template
        self.instance = instance

        self._instance_steps_by_id = {step.id: step for step in instance.steps}
        self._template_steps_by_id = {step.id: step for step in template.steps}
        self._template_step_id_to_instance_step_id = {
            step.workflow_template_step_id: step.id for step in instance.steps
        }

    def get_instance_step(self, step_id: str) -> WorkflowInstanceStepModel:
        return self._instance_steps_by_id[step_id]

    def get_template_step(self, step_id: str) -> WorkflowTemplateStepModel:
        return self._template_steps_by_id[step_id]

    def get_instance_step_for_template_step(
        self, template_step_id: str
    ) -> WorkflowInstanceStepModel:
        return self.get_instance_step(
            self._template_step_id_to_instance_step_id[template_step_id]
        )

    def get_starting_step(self) -> WorkflowTemplateStepModel:
        return self._template_steps_by_id[self.template.starting_step_id]

    def get_current_step(self) -> Optional[WorkflowInstanceStepModel]:
        if self.instance.current_step_id:
            return self._instance_steps_by_id[self.instance.current_step_id]
        return None


class WorkflowPlanner:
    """
    Stateless planner that decides *what* operations should be performed next on
    a workflow. Doesn't mutate any workflow state.
    """

    def _eval_next_step_from_this_step(
        self, ctx: WorkflowView, step: WorkflowInstanceStepModel
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

    def _plan_start_workflow(self, ctx: WorkflowView) -> list[WorkflowOp]:
        assert ctx.instance.status == WorkflowStatusEnum.PENDING
        assert ctx.get_current_step() is None

        start_step = ctx.get_instance_step_for_template_step(ctx.get_starting_step().id)
        assert start_step.status == WorkflowStepStatusEnum.PENDING

        return [
            WorkflowOp(name=WorkflowOpName.START_WORKFLOW),
            WorkflowOp(
                name=WorkflowOpName.TRANSITION_TO_STEP,
                params={"from_step_id": None, "to_step_id": start_step.id},
            ),
            WorkflowOp(
                name=WorkflowOpName.START_STEP, params={"step_id": start_step.id}
            ),
        ]

    def _plan_complete_step(self, ctx: WorkflowView, step_id: str) -> list[WorkflowOp]:
        current_step = ctx.get_current_step()
        assert (
            current_step and current_step.id == step_id
        ), "Step ID must be the current step"

        ops = [
            WorkflowOp(
                name=WorkflowOpName.COMPLETE_STEP, params={"step_id": current_step.id}
            ),
        ]

        # Determine the next step
        next_step = self._eval_next_step_from_this_step(ctx, current_step)

        ops.append(
            WorkflowOp(
                name=WorkflowOpName.TRANSITION_TO_STEP,
                params={
                    "from_step_id": current_step.id,
                    "to_step_id": next_step.id if next_step else None,
                },
            )
        )

        if next_step:
            ops.append(
                WorkflowOp(
                    name=WorkflowOpName.START_STEP, params={"step_id": next_step.id}
                )
            )

        return ops

    def plan(
        self,
        ctx: WorkflowView,
        operation: Optional[WorkflowOp],
    ) -> list[WorkflowOp]:
        ops = []

        if operation:
            if operation.name == WorkflowOpName.START_WORKFLOW:
                ops.extend(self._plan_start_workflow(ctx))
            elif operation.name == WorkflowOpName.COMPLETE_STEP:
                step_id = operation.params.get("step_id")
                ops.extend(self._plan_complete_step(ctx, step_id))
            else:
                raise NotImplementedError(
                    f"Operation '{operation}' not supported by planner"
                )

        all_steps_completed = all(
            step.status == WorkflowStepStatusEnum.COMPLETED
            for step in ctx.instance.steps
        )
        if all_steps_completed and ctx.instance.status != WorkflowStatusEnum.COMPLETED:
            ops.append(WorkflowOp(name=WorkflowOpName.COMPLETE_WORKFLOW))

        return ops
