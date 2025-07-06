from typing import Optional

from pydantic import Field

from common.commonUtil import get_current_time
from validation import CradleBaseModel
from validation.formTemplates import FormTemplateExamples, FormTemplateWithQuestions
from validation.rule_groups import RuleGroupExample, RuleGroupModel
from validation.workflow_template_step_branches import (
    WorkflowTemplateStepBranchExample,
    WorkflowTemplateStepBranchModel,
)


class WorkflowTemplateStepExample:
    id = "step_example-01"
    name = "heart_rate_check"
    title = "Heart Rate Check"
    expected_completion = get_current_time()
    last_edited = get_current_time()
    last_edited_by = 1234

    example_01 = {
        "id": id,
        "name": name,
        "title": title,
        "expected_completion": expected_completion,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
        "form_id": FormTemplateExamples.id_01,
        "workflow_template_id": "workflow-template-example-01",
        "condition_id": RuleGroupExample.id,
        "condition": RuleGroupExample.example_01,
        "branches": [WorkflowTemplateStepBranchExample.example_01],
    }

    with_form = {
        "id": id,
        "name": name,
        "title": title,
        "expected_completion": expected_completion,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
        "form_id": FormTemplateExamples.id_01,
        "form": FormTemplateExamples.example_01,
        "workflow_template_id": "workflow-template-example-01",
        "condition_id": RuleGroupExample.id,
        "condition": RuleGroupExample.example_01,
        "branches": [WorkflowTemplateStepBranchExample.example_01],
    }


class WorkflowTemplateStepModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    title: str
    expected_completion: int = Field(default_factory=get_current_time)
    last_edited: Optional[int] = Field(default_factory=get_current_time)
    last_edited_by: Optional[int] = None
    form_id: str
    condition_id: str
    condition: RuleGroupModel
    workflow_template_id: str
    # TODO: Account for different types of form template validators?
    form: Optional[FormTemplateWithQuestions] = None
    branches: list[WorkflowTemplateStepBranchModel]


class WorkflowTemplateStepUploadModel(WorkflowTemplateStepModel):
    id: Optional[str] = None
