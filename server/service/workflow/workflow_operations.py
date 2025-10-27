from abc import ABC, abstractmethod

from enums import WorkflowStatusEnum, WorkflowStepStatusEnum
from service.workflow.workflow_view import WorkflowView


# TODO: Validate status updates?
ALLOWED_WORKFLOW_STATUS_TRANSITIONS = {
    WorkflowStatusEnum.PENDING: [WorkflowStatusEnum.ACTIVE],
    WorkflowStatusEnum.ACTIVE: [WorkflowStatusEnum.COMPLETED],
    WorkflowStatusEnum.COMPLETED: [],
}

ALLOWED_WORKFLOW_STEP_STATUS_TRANSITIONS = {
    WorkflowStepStatusEnum.PENDING: [WorkflowStepStatusEnum.ACTIVE],
    WorkflowStepStatusEnum.ACTIVE: [WorkflowStepStatusEnum.COMPLETED],
    WorkflowStepStatusEnum.COMPLETED: [],
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

class UpdateWorkflowStatusOp(WorkflowOp):
    def __init__(self, new_status: WorkflowStatusEnum):
        self.new_status = new_status

    def apply(self, workflow_view: WorkflowView) -> None:
        workflow_view.instance.status = self.new_status

class UpdateStepStatusOp(WorkflowOp):
    def __init__(self, step_id: str, new_status: WorkflowStepStatusEnum):
        self.step_id = step_id
        self.new_status = new_status

    def apply(self, workflow_view: WorkflowView) -> None:
        step = workflow_view.get_instance_step(self.step_id)
        step.status = self.new_status

class UpdateCurrentStepOp(WorkflowOp):
    def __init__(self, new_current_step_id: str):
        self.new_current_step_id = new_current_step_id

    def apply(self, workflow_view: WorkflowView) -> None:
        workflow_view.instance.current_step_id = self.new_current_step_id
