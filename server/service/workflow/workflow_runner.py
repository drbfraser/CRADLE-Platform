from typing import Union

from common.commonUtil import get_current_time
from enums import StrEnum


# TODO: Temporary enum for the runner. The existing WorkflowStatus from the REST API
# doesn't fully align yet — will consolidate during integration.
class WorkflowStatus(StrEnum):
    NOT_STARTED = "not_started"
    STARTED = "started"
    COMPLETED = "completed"


class WorkflowEventType(StrEnum):
    WORKFLOW_STARTED = "workflow_started"
    WORKFLOW_COMPLETED = "workflow_completed"
    STEP_STARTED = "step_started"
    STEP_COMPLETED = "step_completed"
    STEP_TRANSITION = "step_transition"


class WorkflowRunner:
    """
    WIP class that runs a workflow instance.

    It can a sequential workflow, where each step is completed in order.
    It also records "events" to provide an auditable history of the user's actions.
    """

    def __init__(
        self, template: dict, instance: dict, record_timestamps_for_events: bool = True
    ):
        """
        `template` must contain this structure:
        {
            "start_step_id": <string>,
            "steps": {
                <string>: {
                    "next_step_id": <string|None>,
                },
            },
        }
        Where the keys of "steps" are step IDs. "next_step_id" must be a valid step ID,
        (a key in "steps"), or None, which means there is no next step.

        `instance` must contain this structure:
        {
            "status": <WorkflowStatus>,
            "current_step_id": <string|None>,
            "steps": {
                <string>: {
                    "status": <WorkflowStatus>,
                },
            },
        }
        Where the keys of "steps" in `instance` must match the keys in `template`.
        "current_step_id" is the ID of the current step, or None if the workflow
        has not started or the workflow has already completed.

        WorkflowRunner will not modify `template`, but it will modify `instance`.
        To ensure correctness, WorkflowRunner should be the ONLY entity that can
        modify `instance`'s "status", "current_step_id", and step "status".
        """
        self.template = template
        self.instance = instance
        self.events = []
        self.record_timestamps_for_events = record_timestamps_for_events

    def _record_event(self, type_: WorkflowEventType, **kwargs):
        """
        Record a workflow event.
        """
        event = {"type": type_, **kwargs}
        if self.record_timestamps_for_events:
            event["timestamp"] = get_current_time()

        self.events.append(event)

    def _set_workflow_status(self, new_status: WorkflowStatus) -> None:
        """
        Set a new status for the workflow.
        """
        if self.instance["status"] != new_status:
            old_status = self.instance["status"]
            self.instance["status"] = new_status

            if new_status == WorkflowStatus.STARTED:
                self._record_event(
                    type_=WorkflowEventType.WORKFLOW_STARTED,
                    old_status=old_status,
                    new_status=new_status,
                )
            elif new_status == WorkflowStatus.COMPLETED:
                self._record_event(
                    type_=WorkflowEventType.WORKFLOW_COMPLETED,
                    old_status=old_status,
                    new_status=new_status,
                )

    def _set_step_status(self, step_id: str, new_status: WorkflowStatus) -> None:
        """
        Set a new status for a step.
        """
        assert step_id in self.instance["steps"]

        step_instance = self.instance["steps"][step_id]

        if step_instance["status"] != new_status:
            old_status = step_instance["status"]
            step_instance["status"] = new_status

            if new_status == WorkflowStatus.STARTED:
                self._record_event(
                    type_=WorkflowEventType.STEP_STARTED,
                    step_id=step_id,
                    old_status=old_status,
                    new_status=new_status,
                )
            elif new_status == WorkflowStatus.COMPLETED:
                self._record_event(
                    type_=WorkflowEventType.STEP_COMPLETED,
                    step_id=step_id,
                    old_status=old_status,
                    new_status=new_status,
                )

    def _set_current_step(self, step_id: Union[str, None]) -> None:
        """
        Set the current step of the workflow.
        """
        assert step_id is None or step_id in self.instance["steps"]

        if self.instance["current_step_id"] != step_id:
            previous_step_id = self.instance["current_step_id"]
            self.instance["current_step_id"] = step_id

            self._record_event(
                type_=WorkflowEventType.STEP_TRANSITION,
                from_step=previous_step_id,
                to_step=step_id,
            )

    def start_workflow(self) -> None:
        """
        Mark the workflow and the first step as started.
        """
        assert (
            self.instance["status"] == WorkflowStatus.NOT_STARTED
        ), "Workflow can only be started once"

        assert self.instance["current_step_id"] is None

        start_step_id = self.template["start_step_id"]

        self._set_workflow_status(new_status=WorkflowStatus.STARTED)
        self._set_current_step(step_id=start_step_id)
        self._set_step_status(step_id=start_step_id, new_status=WorkflowStatus.STARTED)

    def complete_current_step(self):
        """
        Mark the current step as completed and the next step as started.
        If there are no steps left, mark the workflow as completed.
        """
        assert self.instance["current_step_id"] is not None, (
            "Cannot complete step, current_step_id is None. "
            + "The workflow may not have started or may already be completed."
        )
        step_id = self.instance["current_step_id"]

        self._set_step_status(step_id=step_id, new_status=WorkflowStatus.COMPLETED)

        next_step_id = self.template["steps"][step_id]["next_step_id"]
        self._set_current_step(step_id=next_step_id)

        if next_step_id is not None:
            self._set_step_status(
                step_id=next_step_id, new_status=WorkflowStatus.STARTED
            )

        if all(
            step_instance["status"] == WorkflowStatus.COMPLETED
            for step_instance in self.instance["steps"].values()
        ):
            self._set_workflow_status(new_status=WorkflowStatus.COMPLETED)

    def override_current_step(self, step_id: str):
        raise NotImplementedError("Overriding steps is not supported yet")
