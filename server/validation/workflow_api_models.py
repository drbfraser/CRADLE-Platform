import json
from json import JSONDecodeError
from typing import Optional

from pydantic import Field, field_validator, model_validator
from typing_extensions import Self

from common.commonUtil import get_current_time
from enums import WorkflowStatusEnum
from validation import CradleBaseModel
from validation.workflow_models import (
    WorkflowActionModel,
    WorkflowClassificationModel,
    WorkflowCollectionModel,
    WorkflowInstanceModel,
    WorkflowInstanceStepModel,
    WorkflowTemplateModel,
    WorkflowTemplateStepModel,
)


class WorkflowClassificationUploadModel(WorkflowClassificationModel):
    id: Optional[str] = None


class WorkflowClassificationPatchModel(CradleBaseModel, extra="forbid"):
    id: Optional[str] = None
    name: Optional[str] = None


class WorkflowCollectionUploadModel(WorkflowCollectionModel):
    id: Optional[str] = None


class WorkflowTemplateUploadModel(WorkflowTemplateModel):
    id: Optional[str] = None


class WorkflowTemplatePatchBody(CradleBaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    archived: Optional[bool] = None
    starting_step_id: Optional[str] = None
    date_created: int = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    version: str  # A new version is required
    classification_id: Optional[str] = None
    classification: Optional[WorkflowClassificationModel] = None
    steps: Optional[list[WorkflowTemplateStepModel]] = None

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.date_created:
            raise ValueError("last_edited cannot be before date_created")
        return self


class WorkflowTemplateStepUploadModel(WorkflowTemplateStepModel):
    id: Optional[str] = None


class WorkflowInstanceUploadModel(WorkflowInstanceModel):
    id: Optional[str] = None


class WorkflowInstancePatchModel(CradleBaseModel, extra="forbid"):
    id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[int] = None
    current_step_id: Optional[str] = None
    last_edited: Optional[int] = None
    completion_date: Optional[int] = None
    status: Optional[WorkflowStatusEnum] = None
    workflow_template_id: Optional[str] = None
    patient_id: Optional[str] = None
    steps: Optional[list[WorkflowInstanceStepModel]] = None

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if (
            self.last_edited is not None
            and self.start_date is not None
            and self.last_edited < self.start_date
        ):
            raise ValueError("last_edited cannot be before start_date")

        if (
            self.completion_date is not None
            and self.start_date is not None
            and self.completion_date < self.start_date
        ):
            raise ValueError("completion_date cannot be before start_date")

        return self


class WorkflowInstanceStepUploadModel(WorkflowInstanceStepModel):
    id: Optional[str] = None


class WorkflowInstanceStepUpdateModel(CradleBaseModel, extra="forbid"):
    status: Optional[str] = None
    completion_date: Optional[str] = None
    assigned_to: Optional[str] = None
    data: Optional[dict] = None
    last_updated_by: Optional[str] = None
    form_id: Optional[str] = None


class WorkflowEvaluateResponseModel(CradleBaseModel):
    result: dict


class WorkflowEvaluateRequestModel(CradleBaseModel):
    id: str
    input_data: dict

    @field_validator("id", mode="before")
    @classmethod
    def validate_id(cls, id: str) -> str:
        if id == "":
            raise ValueError("missing id")
        return id

    @field_validator("input_data", mode="before")
    @classmethod
    def validate_data(cls, input_data: str) -> dict:
        try:
            obj = json.loads(input_data)
        except JSONDecodeError:
            raise ValueError("input_data must be valid JSON")
        return obj


class GetAvailableActionsResponse(CradleBaseModel):
    actions: list[WorkflowActionModel]


class ApplyActionRequest(CradleBaseModel):
    action: WorkflowActionModel
