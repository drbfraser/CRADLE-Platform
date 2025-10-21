from typing import Optional, Union

from common.commonUtil import get_current_time
from enums import StrEnum, WorkflowStatusEnum, WorkflowStepStatusEnum
from validation.workflow_models import (
    WorkflowInstanceModel,
    WorkflowInstanceStepModel,
    WorkflowTemplateModel,
    WorkflowTemplateStepModel,
)


class WorkflowEventType(StrEnum):
    """
    Enum for different types of workflow-related events emitted by the runner
    """
    WORKFLOW_STARTED = "workflow_started"
    WORKFLOW_COMPLETED = "workflow_completed"
    STEP_STARTED = "step_started"
    STEP_COMPLETED = "step_completed"
    STEP_TRANSITION = "step_transition"


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


class WorkflowRunner:
    """
    A stateless runner that produces workflow events based on the current workflow state.

    - Does not mutate the workflow instance directly
    - Returns events to be applied externally
    - Currently supports simple sequential workflows

    Decoupling workflow runner logic from state mutation should make the runner less
    error-prone and easier to reason about.
    """

    def __init__(self, record_timestamps: bool):
        """
        :param record_timestamps: If True, adds timestamps to emitted events
        """
        self.record_timestamps = record_timestamps

    def _create_workflow_status_change_event(
        self, old_status: WorkflowStatusEnum, new_status: WorkflowStatusEnum
    ) -> dict:
        """
        Create an event when the overall workflow status changes.
        """
        if old_status == new_status:
            return {}

        if new_status == WorkflowStatusEnum.ACTIVE:
            return {
                "type": WorkflowEventType.WORKFLOW_STARTED,
                "old_status": old_status,
                "new_status": new_status,
                "timestamp": get_current_time() if self.record_timestamps else None,
            }
        if new_status == WorkflowStatusEnum.COMPLETED:
            return {
                "type": WorkflowEventType.WORKFLOW_COMPLETED,
                "old_status": old_status,
                "new_status": new_status,
                "timestamp": get_current_time() if self.record_timestamps else None,
            }
        return {}

    def _create_step_status_change_event(
        self,
        step_id: str,
        old_status: WorkflowStepStatusEnum,
        new_status: WorkflowStepStatusEnum,
    ) -> dict:
        """
        Create an event when the status of a step changes.
        """
        if old_status == new_status:
            return {}

        if new_status == WorkflowStepStatusEnum.ACTIVE:
            return {
                "type": WorkflowEventType.STEP_STARTED,
                "step_id": step_id,
                "old_status": old_status,
                "new_status": new_status,
                "timestamp": get_current_time() if self.record_timestamps else None,
            }
        if new_status == WorkflowStepStatusEnum.COMPLETED:
            return {
                "type": WorkflowEventType.STEP_COMPLETED,
                "step_id": step_id,
                "old_status": old_status,
                "new_status": new_status,
                "timestamp": get_current_time() if self.record_timestamps else None,
            }
        return {}

    def _create_step_transition_event(
        self,
        from_step_id: Union[str, None],
        to_step_id: Union[str, None],
    ) -> dict:
        """
        Create an event for transitioning from one step to another.
        """
        return {
            "type": WorkflowEventType.STEP_TRANSITION,
            "from_step": from_step_id,
            "to_step": to_step_id,
            "timestamp": get_current_time() if self.record_timestamps else None,
        }

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

    def _start_workflow(self, ctx: WorkflowView) -> list[dict]:
        """
        "Start" the workflow and "start" the first step.

        Preconditions:
            - Workflow must be in PENDING state
            - Current step must be None

        Returns a list of events.
        """
        assert ctx.instance.status == WorkflowStatusEnum.PENDING
        assert ctx.get_current_step() is None

        start_step = ctx.get_instance_step_for_template_step(ctx.get_starting_step().id)

        assert start_step.status == WorkflowStepStatusEnum.PENDING

        events = []

        events.append(
            self._create_workflow_status_change_event(
                old_status=ctx.instance.status, new_status=WorkflowStatusEnum.ACTIVE
            )
        )

        events.append(
            self._create_step_transition_event(
                from_step_id=None, to_step_id=start_step.id
            )
        )

        events.append(
            self._create_step_status_change_event(
                step_id=start_step.id,
                old_status=start_step.status,
                new_status=WorkflowStepStatusEnum.ACTIVE,
            )
        )

        return events

    def complete_current_step(self, ctx: WorkflowView) -> list[dict]:
        """
        "Complete" the current step.

        Preconditions:
            - The current step must not be None
            - The step must not already be completed

        Returns a list of events.
        """
        current_step = ctx.get_current_step()

        assert (
            current_step is not None
        ), "current_step_id is None. The workflow may not have started or may already be completed."

        assert (
            current_step.status != WorkflowStatusEnum.COMPLETED
        ), "Step cannot be completed more than once."

        events = []

        events.append(
            self._create_step_status_change_event(
                step_id=current_step.id,
                old_status=current_step.status,
                new_status=WorkflowStepStatusEnum.COMPLETED,
            )
        )

        return events

    def advance(self, ctx: WorkflowView) -> list[dict]:
        """
        "Advance" the workflow forward if applicable.

        This may:
            - "Start" the workflow (if pending)
            - "Start" the next step (if current is completed)
            - "Complete" the workflow (if all steps are completed)

        Returns a list of events.
        """
        events = []

        if ctx.instance.status == WorkflowStatusEnum.PENDING:
            events.extend(self._start_workflow(ctx))

        elif current_step := ctx.get_current_step():
            # If step is completed, go to the next step
            if current_step.status == WorkflowStepStatusEnum.COMPLETED:
                next_step = self._eval_next_step_from_this_step(ctx, current_step)

                events.append(
                    self._create_step_transition_event(
                        from_step_id=current_step.id,
                        to_step_id=next_step.id if next_step else None,
                    )
                )

                if next_step:
                    events.append(
                        self._create_step_status_change_event(
                            step_id=next_step.id,
                            old_status=next_step.status,
                            new_status=WorkflowStepStatusEnum.ACTIVE,
                        )
                    )

        all_completed = all(
            step.status == WorkflowStepStatusEnum.COMPLETED
            for step in ctx.instance.steps
        )

        if all_completed:
            events.append(
                self._create_workflow_status_change_event(
                    old_status=ctx.instance.status,
                    new_status=WorkflowStatusEnum.COMPLETED,
                )
            )

        return events

    def override_current_step(self, step_id: str):
        """
        Placeholder for overriding the current step manually.
        """
        raise NotImplementedError("Overriding steps is not supported yet")
