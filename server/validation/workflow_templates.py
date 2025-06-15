from typing import List

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
    WorkflowTemplateStepExampleWithMultipleBranches,
    WorkflowTemplateStepWithSingleBranch,
)
from validation.rule_groups import RuleGroupExample, RuleGroupModel


class WorkflowTemplateExample:
    id = "workflow-template-example-01"
    name = "Workflow Template Model Example"
    description = "Workflow Template Model Example"
    archived = False
    last_edited = get_current_time()
    last_edited_by = "AAAA"
    version = 0

    example_01 = {
        "id": id,
        "name": name,
        "description": description,
        "archived": archived,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
        "version": version,
        "classification_id": WorkflowClassificationExamples.id,
    }

    with_classification = {
        "id": id,
        "name": name,
        "description": description,
        "archived": archived,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
        "version": version,
        "classification_id": WorkflowClassificationExamples.id,
        "classification": WorkflowClassificationExamples.example_01,
    }

    with_step = {
        "id": id,
        "name": name,
        "description": description,
        "archived": archived,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
        "version": version,
        "classification_id": WorkflowClassificationExamples.id,
        "steps": [WorkflowTemplateStepExample.example_01],
    }


class WorkflowTemplateModel(CradleBaseModel):
    id: str
    name: str
    description: str
    archived: bool
    last_edited: Field(default_factory=lambda: get_current_time())
    last_edited_by: str
    version: int


class WorkflowTemplateWithClassification(WorkflowTemplateModel):
    """A workflow template with a workflow classification object"""

    classification: WorkflowClassificationModel


class WorkflowTemplateWithSteps(WorkflowTemplateModel):
    """A workflow template with a workflow template steps"""

    steps = List[WorkflowTemplateStepModel]


class WorkflowTemplateWithStepsAndClassification(WorkflowTemplateWithClassification):
    """A workflow template with a workflow template steps and workflow classification object"""

    steps = List[WorkflowTemplateStepModel]
