from typing import Any

from validation.workflow_models import WorkflowActionModel


class InvalidWorkflowActionError(Exception):
    def __init__(self, action: Any, available_actions: list[WorkflowActionModel]):
        """Raise when an action is not in the list of currently available workflow actions."""
        self.action = action
        self.available_actions = available_actions

        super().__init__(
            f"Action '{action}' is invalid. Available actions: {available_actions}"
        )
