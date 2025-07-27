from typing import Optional

from pydantic import Field, field_validator, model_validator
from typing_extensions import Self

from common.commonUtil import get_current_time
from enums import WorkflowStatusEnum
from validation import CradleBaseModel
from validation.workflow_instance_steps import (
    WorkflowInstanceStepExamples,
    WorkflowInstanceStepModel,
)


class WorkflowInstanceExamples:
    id = "workflow-instance-example-01"
    name = "Workflow Instance Example"
    title = "Workflow Instance Example"
    start_date = get_current_time()
    current_step_id = "workflow-instance-step-example-01"
    last_edited = get_current_time()
    last_edited_by = 1243
    completion_date = get_current_time()
    status = "Active"
    workflow_template_id = "workflow-template-example-01"
    patient_id = "patient-example-01"
    steps = []

    example_01 = {
        "id": id,
        "name": name,
        "title": title,
        "start_date": start_date,
        "current_step_id": current_step_id,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
        "completion_date": completion_date,
        "status": status,
        "workflow_template_id": workflow_template_id,
        "patient_id": patient_id,
        "steps": steps,
    }

    with_steps = {
        "id": id,
        "name": name,
        "title": title,
        "start_date": start_date,
        "current_step_id": current_step_id,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
        "completion_date": completion_date,
        "status": status,
        "workflow_template_id": workflow_template_id,
        "patient_id": patient_id,
        "steps": [
            WorkflowInstanceStepExamples.example_01,
            WorkflowInstanceStepExamples.with_form,
        ],
    }


class WorkflowInstanceModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    title: str
    start_date: int = Field(default_factory=get_current_time)
    current_step_id: Optional[str] = None
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    last_edited_by: Optional[int] = None
    completion_date: Optional[int] = Field(default_factory=get_current_time)
    status: str
    workflow_template_id: Optional[str] = None
    patient_id: str
    steps: list[WorkflowInstanceStepModel]

    @field_validator("status", mode="after")
    @classmethod
    def validate_status(cls, status: str) -> str:
        if status in [
            WorkflowStatusEnum.ACTIVE,
            WorkflowStatusEnum.CANCELLED,
            WorkflowStatusEnum.COMPLETED,
        ]:
            return status

        raise ValueError(f"Invalid step status: {status}")

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.start_date:
            raise ValueError("last_edited cannot be before start_date")

        if self.completion_date is not None and self.completion_date < self.start_date:
            raise ValueError("completion_date cannot be before start_date")

        return self


class WorkflowInstanceUploadModel(WorkflowInstanceModel):
    id: Optional[str] = None
