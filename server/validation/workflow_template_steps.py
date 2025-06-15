from typing import List

from pydantic import Field

from common.commonUtil import get_current_time
from validation import CradleBaseModel
from validation.workflow_template_step_branch import (
    WorkflowTemplateStepBranchExample,
    WorkflowTemplateStepBranchModel,
    WorkflowTemplateStepBranchWithCondition,
)
from validation.formTemplates import FormTemplateExamples, FormTemplateWithQuestions
from validation.rule_groups import RuleGroupExample, RuleGroupModel
from validation.workflow_templates import WorkflowTemplateExample


class WorkflowTemplateStepExample:
    id = "step_example-01"
    name = "heart_rate_check"
    title = "Heart Rate Check"
    expected_completion = get_current_time()
    last_edited = get_current_time()
    last_edited_by = "AAAA"

    example_01 = {
        "id": id,
        "name": name,
        "title": title,
        "expected_completion": expected_completion,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
        "form_id": FormTemplateExamples.id,
        "workflow_template_id": WorkflowTemplateExample.id,
        "conditions": RuleGroupExample.id,
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
        "form_id": FormTemplateExamples.id,
        "form": FormTemplateExamples.example_01,
        "workflow_template_id": WorkflowTemplateExample.id,
        "conditions": RuleGroupExample.id,
        "condition": RuleGroupExample.example_01,
        "branches": [WorkflowTemplateStepBranchExample.example_01],
    }


class WorkflowTemplateStepModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    title: str
    expected_completion: Field(default_factory=get_current_time)
    last_edited: Field(default_factory=get_current_time)
    last_edited_by: str
    condition: RuleGroupModel

    # TODO: Account for different types of form template validators?
    form: FormTemplateWithQuestions


class WorkflowTemplateStepExampleWithMultipleBranches(WorkflowTemplateStepModel):
    """A template step that has a branch which can lead to multiple other steps"""

    branches: List[WorkflowTemplateStepBranchWithCondition]


class WorkflowTemplateStepWithSingleBranch(WorkflowTemplateStepModel):
    """A template step that only has 1 branch"""

    branches = List[WorkflowTemplateStepBranchModel]
