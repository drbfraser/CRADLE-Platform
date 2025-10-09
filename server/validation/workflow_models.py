import json
from json import JSONDecodeError
from typing import Optional

from pydantic import Field, field_validator, model_validator
from typing_extensions import Self

from common.commonUtil import get_current_time
from enums import WorkflowStatusEnum
from validation import CradleBaseModel
from validation.forms import FormModel
from validation.formTemplates import FormTemplateUpload
from validation.rule_groups import RuleGroupModel


class WorkflowClassificationModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    collection_id: Optional[str] = None


class WorkflowCollectionModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    date_created: int = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.date_created:
            raise ValueError("last_edited cannot be before date_created")
        return self


class WorkflowTemplateStepBranchModel(CradleBaseModel, extra="forbid"):
    id: Optional[str] = None
    target_step_id: Optional[str] = None
    step_id: str
    condition_id: Optional[str] = None
    condition: Optional[RuleGroupModel] = None


class WorkflowTemplateStepModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    description: str
    expected_completion: Optional[int] = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    form_id: Optional[str] = None
    condition_id: Optional[str] = None
    condition: Optional[RuleGroupModel] = None
    workflow_template_id: str
    # TODO: Account for different types of form template validators?
    form: Optional[FormTemplateUpload] = None
    branches: list[WorkflowTemplateStepBranchModel]


class WorkflowTemplateModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    description: str
    archived: bool
    starting_step_id: Optional[str] = None
    date_created: int = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    version: str
    initial_condition_id: Optional[str] = None
    initial_condition: Optional[RuleGroupModel] = None
    classification_id: Optional[str] = None
    classification: Optional[WorkflowClassificationModel] = None
    steps: list[WorkflowTemplateStepModel]

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.date_created:
            raise ValueError("last_edited cannot be before date_created")
        return self


class WorkflowInstanceStepModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    description: str
    start_date: int = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    assigned_to: Optional[int] = None
    completion_date: Optional[int] = Field(default_factory=get_current_time)
    expected_completion: Optional[int] = Field(default_factory=get_current_time)
    status: WorkflowStatusEnum = "Active"
    data: Optional[str] = None
    triggered_by: Optional[str] = None
    form_id: Optional[str] = None
    form: Optional[FormModel] = None
    workflow_instance_id: str
    condition_id: Optional[str] = None
    condition: Optional[RuleGroupModel] = None

    @field_validator("data", mode="after")
    @classmethod
    def validate_data(cls, data: Optional[str]) -> Optional[str]:
        # TODO: Add more answer validation once format is figured out

        if data is not None:
            try:
                json.loads(data)
            except JSONDecodeError:
                raise ValueError("data must be valid JSON")

        return data

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.start_date:
            raise ValueError("last_edited cannot be before start_date")

        if self.completion_date is not None and self.completion_date < self.start_date:
            raise ValueError("completion_date cannot be before start_date")

        if (
            self.expected_completion is not None
            and self.expected_completion < self.start_date
        ):
            raise ValueError("expected_completion cannot be before start_date")

        return self


class WorkflowInstanceModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    description: str
    start_date: int = Field(default_factory=get_current_time)
    current_step_id: Optional[str] = None
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    completion_date: Optional[int] = Field(default_factory=get_current_time)
    status: WorkflowStatusEnum
    workflow_template_id: Optional[str] = None
    patient_id: str
    steps: list[WorkflowInstanceStepModel]

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.start_date:
            raise ValueError("last_edited cannot be before start_date")

        if self.completion_date is not None and self.completion_date < self.start_date:
            raise ValueError("completion_date cannot be before start_date")

        return self
