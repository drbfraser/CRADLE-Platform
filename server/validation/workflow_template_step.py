from typing import List

from pydantic import Field

from common.commonUtil import get_current_time
from validation import CradleBaseModel
from validation.workflow_template_step_branch import (
    WorkflowTemplateStepBranchExample,
    WorkflowTemplateStepBranchModel,
    WorkflowTemplateStepBranchWithCondition,
)
from validation.formTemplates import FormTemplateExamples
from validation.rule_groups import RuleGroupExample, RuleGroupModel


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
        "workflow_template_id": "TODO",
    }

    with_condition = {
        "id": id,
        "name": name,
        "title": title,
        "expected_completion": expected_completion,
        "last_edited": last_edited,
        "last_edited_by": last_edited_by,
        "form_id": FormTemplateExamples.id,
        "workflow_template_id": "TODO",
        "condition": RuleGroupExample.id,
    }


class WorkflowTemplateStepModel(CradleBaseModel, extra="forbid"):
    id: str
    name: str
    title: str
    expected_completion: Field(default_factory=get_current_time)
    last_edited: Field(default_factory=get_current_time)
    last_edited_by: str


class WorkflowTemplateStepWithCondition(WorkflowTemplateStepModel):
    """A template step that has a condition"""

    condition: RuleGroupModel


class WorkflowTemplateStepExampleWithMultipleBranches(WorkflowTemplateStepModel):
    """A template step that has a branch which can lead to multiple other steps"""

    branches: List[WorkflowTemplateStepBranchWithCondition]


class WorkflowTemplateStepWithSingleBranch(WorkflowTemplateStepModel):
    branch = WorkflowTemplateStepBranchModel
