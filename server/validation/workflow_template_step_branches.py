from typing import Optional

from validation import CradleBaseModel
from validation.rule_groups import RuleGroupExample, RuleGroupModel


class WorkflowTemplateStepBranchExample:
    id = "branch-example-01"
    target_step_id = "step-example-01"

    example_01 = {
        "id": id,
        "target_step_id": target_step_id,
        "step_id": "step-example-01",
        "condition_id": RuleGroupExample.example_01["id"],
        "condition": RuleGroupExample.example_01,
    }


class WorkflowTemplateStepBranchModel(CradleBaseModel, extra="forbid"):
    id: Optional[str] = None
    target_step_id: Optional[str] = None
    step_id: str
    condition_id: Optional[str] = None
    condition: Optional[RuleGroupModel] = None
