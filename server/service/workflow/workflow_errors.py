from typing import Any

from service.workflow.workflow_actions import WorkflowAction


class InvalidWorkflowActionError(Exception):
    def __init__(self, action: Any, available_actions: list[WorkflowAction]):
        self.action = action
        self.available_actions = available_actions

        super().__init__(
            f"Action '{action}' is invalid. Available actions: {available_actions}"
        )
