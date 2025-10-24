from __future__ import annotations

import types
from typing import Any

from data.marshal import unmarshal
from models import (
    WorkflowTemplateStepOrm,
)


def _without_model_key(d: dict) -> dict:
    """Drop the '__model__' key that our schema stub adds so dicts are comparable."""
    return {k: v for k, v in d.items() if k != "__model__"}


def _form_payload(
    *, id: str = "ft-001", title: str = "Antenatal Intake", **extras: Any
) -> dict:
    """
    Minimal but realistic FormTemplate payload.
    We keep it intentionally small—unmarshal only forwards to schema().load(...)
    and attaches the returned object to the step.
    """
    return {"id": id, "title": title, **extras}


def _create_branch(
    *,
    id: str,
    step_id: str,
    target_step_id: str | None = None,
    condition: dict[str, Any] | None = None,
    **extras: Any,
) -> dict:
    """
    WorkflowTemplateStepBranch payload.
    Note: __unmarshal_workflow_template_step_branch forwards the dict to load(...)
    without stripping 'condition', then (if present) loads RuleGroupOrm for it.
    """
    d: dict[str, Any] = {"id": id, "step_id": step_id, **extras}
    if target_step_id is not None:
        d["target_step_id"] = target_step_id
    if condition is not None:
        d["condition"] = condition
    return d


def _create_step(
    *,
    id: str,
    name: str,
    description: str,
    workflow_template_id: str,
    form: dict[str, Any] | None = None,
    branches: list[dict[str, Any]] | None = None,
    expected_completion: int | None = 86_400,
    last_edited: int = 1_700_000_000,
    **extras: Any,
) -> dict:
    """
    WorkflowTemplateStep payload.
    Note: __unmarshal_workflow_template_step forwards the dict to load...
    without stripping 'form' and 'branches', then (if present) loads FormTemplateOrm and
    WorkflowTemplateStepBranchOrm, respectively.
    """
    d: dict[str, Any] = {
        "id": id,
        "name": name,
        "description": description,
        "workflow_template_id": workflow_template_id,
        "expected_completion": expected_completion,
        "last_edited": last_edited,
        **extras,
    }
    if form is not None:
        d["form"] = form
    if branches is not None:
        d["branches"] = branches
    return d


def test_unmarshal_step_with_form_and_branches(schema_loads_by_model):
    """
    When a WorkflowTemplateStep payload contains a FormTemplateOrm and two WorkflowTemplateStepBranchOrms,
      - the unmarshaller should:
        - strip out 'form' and 'branches' before calling schema().load(...) for the Step,
        - separately load FormTemplateOrm and WorkflowTemplateStepBranchOrm(+RuleGroupOrm),
        - attach them back to the returned Step object.
    """
    step_id = "wts-100"
    form = _form_payload(id="ft-123", title="ANC Registration", version="1.0")
    condition_payload = {
        "id": "rg-555",
        "name": "IF danger_signs",
        "rules": [{"field": "danger_signs", "equals": True}],
    }
    branches = [
        _create_branch(
            id="wtsb-1",
            step_id=step_id,
            target_step_id="wts-200",
            condition=condition_payload,
            branch_label="Danger signs → refer",
        ),
        _create_branch(
            id="wtsb-2",
            step_id=step_id,
            target_step_id="wts-150",
            branch_label="No danger signs → proceed",
        ),
    ]
    payload = _create_step(
        id=step_id,
        name="Registration",
        description="Capture intake details and vitals",
        workflow_template_id="wt-42",
        form=form,
        branches=branches,
        expected_completion=3_600,
        last_edited=1_700_100_000,
        sla="P1D",  # extra field passes through to schema.load(...)
    )

    obj = unmarshal(WorkflowTemplateStepOrm, payload)
    assert isinstance(obj, types.SimpleNamespace)

    # Basic fields forwarded to the returned object
    assert obj.id == "wts-100"
    assert obj.name == "Registration"
    assert obj.description == "Capture intake details and vitals"
    assert obj.workflow_template_id == "wt-42"
    assert obj.expected_completion == 3_600
    assert obj.last_edited == 1_700_100_000
    assert getattr(obj, "sla", None) == "P1D"

    # Form attached and unmarshaled
    assert hasattr(obj, "form")
    assert isinstance(obj.form, types.SimpleNamespace)
    assert obj.form.id == "ft-123"
    assert getattr(obj.form, "title", None) == "ANC Registration"
    assert getattr(obj.form, "version", None) == "1.0"

    # Branches attached and unmarshaled
    assert hasattr(obj, "branches")
    assert isinstance(obj.branches, list) and len(obj.branches) == 2

    # First branch has a condition attached
    b1, b2 = obj.branches
    assert isinstance(b1, types.SimpleNamespace)
    assert b1.id == "wtsb-1"
    assert b1.step_id == step_id
    assert b1.target_step_id == "wts-200"
    assert getattr(b1, "branch_label", None) == "Danger signs → refer"
    assert hasattr(b1, "condition")
    assert isinstance(b1.condition, types.SimpleNamespace)
    assert b1.condition.id == "rg-555"
    assert getattr(b1.condition, "name", None) == "IF danger_signs"
    assert getattr(b1.condition, "rules", None) == [
        {"field": "danger_signs", "equals": True}
    ]

    # Second branch has no condition
    assert isinstance(b2, types.SimpleNamespace)
    assert b2.id == "wtsb-2"
    assert b2.step_id == step_id
    assert b2.target_step_id == "wts-150"
    assert getattr(b2, "branch_label", None) == "No danger signs → proceed"
    assert not hasattr(b2, "condition")

    # --- schema.load(...) assertions ---
    step_loads = schema_loads_by_model("WorkflowTemplateStepOrm")
    form_loads = schema_loads_by_model("FormTemplateOrm")
    branch_loads = schema_loads_by_model("WorkflowTemplateStepBranchOrm")
    rule_group_loads = schema_loads_by_model("RuleGroupOrm")

    assert step_loads, "Expected schema.load(...) for WorkflowTemplateStepOrm"
    assert form_loads, "Expected schema.load(...) for FormTemplateOrm"
    assert branch_loads and len(branch_loads) >= 2, "Expected two branch loads"
    assert rule_group_loads and len(rule_group_loads) >= 1, "Expected a RuleGroup load"

    # Step payload forwarded WITHOUT 'form' and 'branches'
    expected_step_forward = {
        "id": "wts-100",
        "name": "Registration",
        "description": "Capture intake details and vitals",
        "workflow_template_id": "wt-42",
        "expected_completion": 3_600,
        "last_edited": 1_700_100_000,
        "sla": "P1D",
    }
    assert _without_model_key(step_loads[-1]) == expected_step_forward

    # Form payload forwarded as-is
    assert _without_model_key(form_loads[-1]) == form

    # Both branch payloads should have been forwarded as-is (including condition for the first)
    forwarded_branches = [_without_model_key(b) for b in branch_loads[-2:]]
    for expected in branches:
        assert expected in forwarded_branches

    # The condition payload should be forwarded to RuleGroupOrm.load(...)
    assert _without_model_key(rule_group_loads[-1]) == condition_payload


def test_unmarshal_step_without_form_or_branches(schema_loads_by_model):
    """
    When 'form' and 'branches' are omitted from the payload:
      - unmarshal should set form=None and branches=[]
      - the resulting object should have form=None and branches=[]
      - no FormTemplateOrm or WorkflowTemplateStepBranchOrm loads should occur
      - no RuleGroupOrm loads should occur (since no branch has a condition)
    """
    payload = _create_step(
        id="wts-200",
        name="Review",
        description="Supervisor reviews intake form",
        workflow_template_id="wt-42",
        # keys omitted
        expected_completion=7_200,
        last_edited=1_700_200_000,
    )

    obj = unmarshal(WorkflowTemplateStepOrm, payload)
    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wts-200"
    assert obj.name == "Review"
    assert obj.description == "Supervisor reviews intake form"
    assert obj.workflow_template_id == "wt-42"
    assert obj.expected_completion == 7_200
    assert obj.last_edited == 1_700_200_000

    # Defaults set by unmarshaller
    assert obj.form is None
    assert obj.branches == []

    # schema.load(...) assertions
    step_loads = schema_loads_by_model("WorkflowTemplateStepOrm")
    form_loads = schema_loads_by_model("FormTemplateOrm")
    branch_loads = schema_loads_by_model("WorkflowTemplateStepBranchOrm")
    rule_group_loads = schema_loads_by_model("RuleGroupOrm")

    assert step_loads and _without_model_key(step_loads[-1]) == payload
    assert not form_loads, "FormTemplateOrm should not be loaded when 'form' is omitted"
    assert not branch_loads, "No branch loads expected when 'branches' is omitted"
    assert not rule_group_loads, (
        "No RuleGroup loads expected when no branch has a condition"
    )


def test_unmarshal_step_strips_none_and_handles_empty_branches(schema_loads_by_model):
    """
    When 'form', 'branches', and 'expected_completion' are None/null in the payload:
      - These keys are stripped out before schema().load() is called
      - The returned object has form=None, branches=[], and no expected_completion attribute
      - No FormTemplateOrm, WorkflowTemplateStepBranchOrm, or RuleGroupOrm loads occur
    """
    payload = _create_step(
        id="wts-300",
        name="Counseling",
        description="Provide counseling and education",
        workflow_template_id="wt-42",
        form=None,  # stripped out before load
        branches=[],  # popped before load (but object gets branches=[])
        expected_completion=None,  # stripped out before load
        last_edited=1_700_300_000,
    )

    obj = unmarshal(WorkflowTemplateStepOrm, payload)
    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wts-300"
    assert obj.name == "Counseling"
    assert obj.description == "Provide counseling and education"
    assert obj.workflow_template_id == "wt-42"
    assert obj.last_edited == 1_700_300_000

    # Keys with None are stripped; empty branches list attaches as []
    assert obj.form is None
    assert obj.branches == []
    assert not hasattr(obj, "expected_completion")

    # schema.load(...) assertions
    step_loads = schema_loads_by_model("WorkflowTemplateStepOrm")
    form_loads = schema_loads_by_model("FormTemplateOrm")
    branch_loads = schema_loads_by_model("WorkflowTemplateStepBranchOrm")
    rule_group_loads = schema_loads_by_model("RuleGroupOrm")

    assert step_loads, "Expected schema.load(...) for WorkflowTemplateStepOrm"

    # 'form', 'expected_completion', and 'branches' should not be present in the forwarded dict
    forwarded = _without_model_key(step_loads[-1])
    assert forwarded == {
        "id": "wts-300",
        "name": "Counseling",
        "description": "Provide counseling and education",
        "workflow_template_id": "wt-42",
        "last_edited": 1_700_300_000,
    }

    # No form/branch/condition loads were triggered by this payload
    assert not form_loads
    assert not branch_loads
    assert not rule_group_loads
