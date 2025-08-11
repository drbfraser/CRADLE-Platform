from typing import Optional

from pydantic import Field, model_validator
from typing_extensions import Self

from common.commonUtil import get_current_time
from validation import CradleBaseModel
from validation.rule_groups import RuleGroupExample, RuleGroupModel
from validation.workflow_classifications import (
    WorkflowClassificationExamples,
    WorkflowClassificationModel,
)
from validation.workflow_template_steps import (
    WorkflowTemplateStepExample,
    WorkflowTemplateStepModel,
)


class WorkflowTemplateExample:
    id = "workflow-template-example-01"
    name = "Workflow Template Model Example"
    description = "Workflow Template Model Example"
    archived = False
    date_created = get_current_time()
    last_edited = get_current_time()
    version = "0"

    example_01 = {
        "id": id,
        "name": name,
        "description": description,
        "archived": archived,
        "starting_step_id": None,
        "initial_condition_id": RuleGroupExample.id,
        "condition": RuleGroupExample.example_01,
        "date_created": date_created,
        "last_edited": last_edited,
        "version": version,
        "classification_id": WorkflowClassificationExamples.id,
        "classification": WorkflowClassificationExamples.example_01,
        "steps": [],
    }

    with_classification = {
        "id": id,
        "name": name,
        "description": description,
        "archived": archived,
        "starting_step_id": None,
        "initial_condition_id": RuleGroupExample.id,
        "initial_condition": RuleGroupExample.example_01,
        "date_created": date_created,
        "last_edited": last_edited,
        "version": version,
        "classification_id": WorkflowClassificationExamples.id,
        "classification": WorkflowClassificationExamples.example_01,
        "steps": [],
    }

    with_step = {
        "id": id,
        "name": name,
        "description": description,
        "archived": archived,
        "starting_step_id": WorkflowTemplateStepExample.example_01["id"],
        "initial_condition_id": RuleGroupExample.id,
        "initial_condition": RuleGroupExample.example_01,
        "date_created": date_created,
        "last_edited": last_edited,
        "version": version,
        "classification_id": WorkflowClassificationExamples.id,
        "classification": WorkflowClassificationExamples.example_01,
        "steps": [WorkflowTemplateStepExample.example_01],
    }


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
    initial_condition_id: Optional[str] = None
    initial_condition: Optional[RuleGroupModel] = None
    classification_id: Optional[str] = None
    classification: Optional[WorkflowClassificationModel] = None
    steps: Optional[list[WorkflowTemplateStepModel]] = None

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.date_created:
            raise ValueError("last_edited cannot be before date_created")
        return self
