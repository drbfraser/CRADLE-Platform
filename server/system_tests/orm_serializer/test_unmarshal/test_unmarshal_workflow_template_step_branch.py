from __future__ import annotations

from typing import Any

from data.marshal import unmarshal
from models import RuleGroupOrm, WorkflowTemplateStepBranchOrm


def _create_branch(
    *,
    id: str = "wtsb-001",
    step_id: str = "wts-123",
    target_step_id: str | None = "wts-456",
    condition: Any | None = None,
    **extras: Any,
) -> dict:
    d: dict[str, Any] = {"id": id, "step_id": step_id, **extras}
    if target_step_id is not None:
        d["target_step_id"] = target_step_id

    if condition is None:
        pass
    elif isinstance(condition, str):
        d["condition"] = {"id": condition}
    elif isinstance(condition, dict):
        d["condition"] = {"id": condition["id"]} if "id" in condition else {}
    else:
        raise TypeError("condition must be str | dict | None")

    return d


def test_unmarshal_branch_with_condition_str_id_attaches_relation():
    """
    When 'condition' is a string representing a RuleGroupOrm id:
      - unmarshal should load the condition as a RuleGroupOrm object
      - the resulting object should have a condition with the correct id
    """
    payload = _create_branch(
        id="wtsb-B",
        step_id="wts-30",
        target_step_id="wts-40",
        condition="rg-777",
    )

    obj = unmarshal(WorkflowTemplateStepBranchOrm, payload)

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
    payload = _create_branch(
        id="wtsb-C",
        step_id="wts-50",
        target_step_id="wts-60",
        # no condition
    )

    obj = unmarshal(WorkflowTemplateStepBranchOrm, payload)

    assert isinstance(obj, WorkflowTemplateStepBranchOrm)
    assert obj.id == "wtsb-C"
    assert obj.step_id == "wts-50"
    assert obj.target_step_id == "wts-60"
    assert obj.condition is None
