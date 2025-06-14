from validation import CradleBaseModel
from validation.rule_groups import RuleGroupExample, RuleGroupModel
from validation.workflow_template_step import WorkflowTemplateStepExample


class WorkflowTemplateStepBranchExample:
    id = "branch-example-01"
    target_step_id = "step-example-01"

    example_01 = {
        "id": id,
        "target_step_id": target_step_id,
        "step_id": WorkflowTemplateStepExample.id,
    }

    with_condition = {
        "id": id,
        "target_step_id": target_step_id,
        "step_id": WorkflowTemplateStepExample.id,
        "condition": RuleGroupExample.id,
    }


class WorkflowTemplateStepBranchModel(CradleBaseModel, extra="forbid"):
    id: str
    target_step_id: str
    step_id: str


class WorkflowTemplateStepBranchWithCondition(WorkflowTemplateStepBranchModel):
    """A workflow template step with a condition (branching logic)"""

    condition: RuleGroupModel
