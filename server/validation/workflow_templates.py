from typing import Optional

from pydantic import Field, field_validator

from common.commonUtil import get_current_time
from validation import CradleBaseModel
from validation.workflow_classifications import (
    WorkflowClassificationExamples,
    WorkflowClassificationModel,
)
from validation.workflow_template_steps import (
    WorkflowTemplateStepExample,
    WorkflowTemplateStepModel,
)
from validation.rule_groups import RuleGroupExample, RuleGroupModel


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
        "steps": [],
    }

    with_classification = {
        "id": id,
        "name": name,
        "description": description,
        "archived": archived,
        "initial_condition_id": RuleGroupExample.id,
        "condition": RuleGroupExample.example_01,
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
        "condition": RuleGroupExample.example_01,
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
    condition: Optional[RuleGroupModel] = None
    version: str


class WorkflowTemplateWithClassification(WorkflowTemplateModel):
    """A workflow template with a workflow classification object"""

    classification: Optional[WorkflowClassificationModel] = None


class WorkflowTemplateWithSteps(WorkflowTemplateModel):
    """A workflow template with a workflow template steps"""

    steps: list[WorkflowTemplateStepModel]


class WorkflowTemplateWithStepsAndClassification(WorkflowTemplateWithClassification):
    """A workflow template with a workflow template steps and workflow classification object"""

    steps: list[WorkflowTemplateStepModel]
