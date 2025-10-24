from __future__ import annotations

import types
from typing import Any

from data.marshal import unmarshal
from models import WorkflowTemplateStepBranchOrm


def _create_branch(
    *,
    id: str = "wtsb-001",
    step_id: str = "wts-123",
    target_step_id: str | None = "wts-456",
    condition: dict[str, Any] | None = None,
    **extras: Any,
) -> dict:
    """
    Helper function to construct a minimal WorkflowTemplateStepBranchOrm payload dictionary.

    :param id: ID of the WorkflowTemplateStepBranchOrm to create.
    :param step_id: ID of the WorkflowTemplateStepOrm associated with the branch.
    :param target_step_id: ID of the WorkflowTemplateStepOrm to go to next if the condition is satisfied.
    :param condition: Optional dict containing the condition to check, if any.
    :param **extras: Additional keyword arguments to include in the payload.
    :return: Minimal WorkflowTemplateStepBranchOrm payload dictionary.
    """
    d: dict[str, Any] = {"id": id, "step_id": step_id, **extras}
    if target_step_id is not None:
        d["target_step_id"] = target_step_id
    if condition is not None:
        d["condition"] = condition
    return d


def _without_model_key(d: dict) -> dict:
    """Compare captured schema.load payloads ignoring the '__model__' key from the stub."""
    return {k: v for k, v in d.items() if k != "__model__"}


def test_unmarshal_branch_with_condition_forwards_and_attaches_condition(
    schema_loads_by_model,
):
    """
    When `condition` is present in the payload:
      - unmarshal loads the condition as a RuleGroupOrm object
      - scalar fields are preserved
      - extras are forwarded to the loaded object
      - condition is attached as a separate object
      - schema.load(...) is called with the original payload and nested condition
    """
    condition_payload = {
        "id": "rg-001",
        # include a couple of plausible fields a rule group might carry
        "name": "IF BP high",
        "rules": [{"field": "sbp", "gt": 140}],
    }
    payload = _create_branch(
        id="wtsb-A",
        step_id="wts-10",
        target_step_id="wts-20",
        condition=condition_payload,
        # extra should be forwarded to schema.load(...) untouched
        branch_label="High BP path",
    )

    obj = unmarshal(WorkflowTemplateStepBranchOrm, payload)
    assert isinstance(obj, types.SimpleNamespace)

    # scalar fields intact
    assert obj.id == "wtsb-A"
    assert obj.step_id == "wts-10"
    assert obj.target_step_id == "wts-20"
    # extras passed through to the loaded object
    assert getattr(obj, "branch_label", None) == "High BP path"

    # condition attached and unmarshaled as its own object
    assert hasattr(obj, "condition")
    assert isinstance(obj.condition, types.SimpleNamespace)
    assert obj.condition.id == "rg-001"
    assert getattr(obj.condition, "name", None) == "IF BP high"
    assert getattr(obj.condition, "rules", None) == [{"field": "sbp", "gt": 140}]

    # schema load assertions
    branch_loads = schema_loads_by_model("WorkflowTemplateStepBranchOrm")
    rule_group_loads = schema_loads_by_model("RuleGroupOrm")

    assert branch_loads, "Expected schema.load(...) for WorkflowTemplateStepBranchOrm"
    assert rule_group_loads, "Expected schema.load(...) for RuleGroupOrm"

    # The last branch load should equal our input payload (including `condition`)
    assert _without_model_key(branch_loads[-1]) == payload
    # The last rule group load should equal the nested condition payload
    assert _without_model_key(rule_group_loads[-1]) == condition_payload


def test_unmarshal_branch_without_condition_forwards_and_has_no_condition(
    schema_loads_by_model,
):
    """
    When `condition` is omitted from the payload:
      - unmarshal should not attempt to load a condition
      - the resulting object should not have a `condition` attribute
      - schema.load(...) should be called with the original payload, and
        should not attempt to load a RuleGroupOrm object
    """
    payload = _create_branch(
        id="wtsb-B",
        step_id="wts-30",
        target_step_id="wts-40",
        # condition omitted
    )

    obj = unmarshal(WorkflowTemplateStepBranchOrm, payload)
    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wtsb-B"
    assert obj.step_id == "wts-30"
    assert obj.target_step_id == "wts-40"
    assert not hasattr(obj, "condition")

    branch_loads = schema_loads_by_model("WorkflowTemplateStepBranchOrm")
    rule_group_loads = schema_loads_by_model("RuleGroupOrm")

    assert branch_loads, "Expected schema.load(...) for WorkflowTemplateStepBranchOrm"
    assert _without_model_key(branch_loads[-1]) == payload

    # No new RuleGroup load for this call
    assert not any(_without_model_key(c) == {} for c in rule_group_loads), (
        "Did not expect a RuleGroup load when `condition` is absent"
    )


def test_unmarshal_branch_with_condition_none_strips_key_and_attaches_nothing(
    schema_loads_by_model,
):
    """
    When `condition` is explicitly None in the payload:
      - unmarshal should strip the key from the payload and not attempt to load a condition
      - the resulting object should not have a `condition` attribute
      - schema.load(...) should be called with the original payload, minus the `condition` key
      - No RuleGroup load should be triggered by this call
    """
    payload_with_none = _create_branch(
        id="wtsb-C",
        step_id="wts-50",
        target_step_id="wts-60",
        condition=None,  # will be stripped out before schema.load(...)
    )

    obj = unmarshal(WorkflowTemplateStepBranchOrm, payload_with_none)
    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wtsb-C"
    assert obj.step_id == "wts-50"
    assert obj.target_step_id == "wts-60"
    assert not hasattr(obj, "condition")

    branch_loads = schema_loads_by_model("WorkflowTemplateStepBranchOrm")
    rule_group_loads = schema_loads_by_model("RuleGroupOrm")
    assert branch_loads, "Expected schema.load(...) for WorkflowTemplateStepBranchOrm"

    # After stripping None, the dict sent to schema.load should not contain `condition`
    assert _without_model_key(branch_loads[-1]) == {
        "id": "wtsb-C",
        "step_id": "wts-50",
        "target_step_id": "wts-60",
    }

    # No RuleGroup load should have been triggered by this call
    assert not any(_without_model_key(c) == {} for c in rule_group_loads)
