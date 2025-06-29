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
    last_edited_by = "AAAA"
    version = "0"

    example_01 = {
        "id": id,
        "name": name,
        "description": description,
        "archived": archived,
        "initial_condition_id": RuleGroupExample.id,
        "condition": RuleGroupExample.example_01,
        "date_created": date_created,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
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
        "initial_condition_id": RuleGroupExample.id,
        "initial_condition": RuleGroupExample.example_01,
        "date_created": date_created,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
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
        "initial_condition_id": RuleGroupExample.id,
        "initial_condition": RuleGroupExample.example_01,
        "date_created": date_created,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
        "version": version,
        "classification_id": WorkflowClassificationExamples.id,
        "classification": WorkflowClassificationExamples.example_01,
        "steps": [WorkflowTemplateStepExample.example_01],
    }


class WorkflowTemplateModel(CradleBaseModel):
    id: str
    name: str
    description: str
    archived: bool
    date_created: int = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    last_edited_by: Optional[int] = None
    version: str
    initial_condition_id: Optional[str] = None
    initial_condition: Optional[RuleGroupModel] = None
    version: str
    classification_id: Optional[str] = None
    classification: Optional[WorkflowClassificationModel] = None
    steps: list[WorkflowTemplateStepModel]

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.last_edited is not None and self.last_edited < self.date_created:
            raise ValueError("last_edited cannot be before date_created")
        return self
