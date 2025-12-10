from __future__ import annotations

from data import orm_serializer
from models import RuleGroupOrm, WorkflowTemplateStepBranchOrm
from tests.helpers import make_workflow_template_branch


def test_unmarshal_branch_with_condition_str_id_attaches_relation():
    """
    When 'condition' is a string representing a RuleGroupOrm id:
      - unmarshal should load the condition as a RuleGroupOrm object
      - the resulting object should have a condition with the correct id
    """
    payload = make_workflow_template_branch(
        id="wtsb-B",
        step_id="wts-30",
        target_step_id="wts-40",
        condition={"id": "rg-777"},
    )

    obj = orm_serializer.unmarshal(WorkflowTemplateStepBranchOrm, payload)

    assert isinstance(obj, WorkflowTemplateStepBranchOrm)
    assert obj.id == "wtsb-B"
    assert obj.step_id == "wts-30"
    assert obj.target_step_id == "wts-40"

    assert obj.condition is not None
    assert isinstance(obj.condition, RuleGroupOrm)
    assert obj.condition.id == "rg-777"


def test_unmarshal_branch_without_condition_leaves_relation_none():
    """
    When 'condition' is omitted from the payload:
      - unmarshal should set condition=None
      - the resulting object should have condition=None
      - no RuleGroupOrm loads should occur
    """
    payload = make_workflow_template_branch(
        id="wtsb-C",
        step_id="wts-50",
        target_step_id="wts-60",
        # no condition
    )

    obj = orm_serializer.unmarshal(WorkflowTemplateStepBranchOrm, payload)

    assert isinstance(obj, WorkflowTemplateStepBranchOrm)
    assert obj.id == "wtsb-C"
    assert obj.step_id == "wts-50"
    assert obj.target_step_id == "wts-60"
    assert obj.condition is None
