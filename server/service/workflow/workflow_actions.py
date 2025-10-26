from abc import ABC

class WorkflowAction(ABC):
    """Base class for workflow actions"""

    def __eq__(self, other):
        if not isinstance(other, type(self)):
            return False
        return self.__dict__ == other.__dict__

    def __repr__(self):
        attrs = ', '.join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{self.__class__.__name__}({attrs})"

class StartWorkflowAction(WorkflowAction):
    pass

class StartStepAction(WorkflowAction):
    def __init__(self, step_id: str):
        self.step_id = step_id

class CompleteStepAction(WorkflowAction):
    def __init__(self, step_id: str):
        self.step_id = step_id
