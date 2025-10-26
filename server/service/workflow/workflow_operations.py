from abc import ABC, abstractmethod

from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from service.workflow.workflow_view import WorkflowView


# TODO: Validate status transitions
ALLOWED_WORKFLOW_STATUS_TRANSITIONS = {
    WorkflowStatusEnum.PENDING: [WorkflowStatusEnum.ACTIVE],
    WorkflowStatusEnum.ACTIVE: [WorkflowStatusEnum.COMPLETED],
    WorkflowStatusEnum.COMPLETED: [],
}

ALLOWED_WORKFLOW_STATUS_TRANSITIONS = {
    WorkflowStatusEnum.PENDING: [WorkflowStatusEnum.ACTIVE],
    WorkflowStatusEnum.ACTIVE: [WorkflowStatusEnum.COMPLETED],
    WorkflowStatusEnum.COMPLETED: [],
}

class WorkflowOp(ABC):
    """Base class for workflow operations"""

    def __eq__(self, other):
        if not isinstance(other, type(self)):
            return False
        return self.__dict__ == other.__dict__

    def __repr__(self):
        attrs = ', '.join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{self.__class__.__name__}({attrs})"

    @abstractmethod
    def apply(self, workflow_view: WorkflowView) -> None:
        pass

class StartWorkflowOp(WorkflowOp):
    def apply(self, workflow_view: WorkflowView) -> None:
        workflow_view.instance.status = WorkflowStatusEnum.ACTIVE

class CompleteWorkflowOp(WorkflowOp):
    def apply(self, workflow_view: WorkflowView) -> None:
        workflow_view.instance.status = WorkflowStatusEnum.COMPLETED

class StartStepOp(WorkflowOp):
    def __init__(self, step_id: str):
        self.step_id = step_id

    def apply(self, workflow_view: WorkflowView) -> None:
        step = workflow_view.get_instance_step(self.step_id)
        step.status = WorkflowStepStatusEnum.ACTIVE

class CompleteStepOp(WorkflowOp):
    def __init__(self, step_id: str):
        self.step_id = step_id

    def apply(self, workflow_view: WorkflowView) -> None:
        step = workflow_view.get_instance_step(self.step_id)
        step.status = WorkflowStepStatusEnum.COMPLETED

class TransitionStepOp(WorkflowOp):
    def __init__(self, to_step_id: str):
        self.to_step_id = to_step_id

    def apply(self, workflow_view: WorkflowView) -> None:
        workflow_view.instance.current_step_id = self.to_step_id
