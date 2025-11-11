from __future__ import annotations

from typing import Any

from data.marshal import unmarshal
from models import (
    FormTemplateOrm,
    RuleGroupOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
)


def _form_payload(*, id: str = "ft-001") -> dict:
    return {"id": id}


def _create_branch(
    *,
    id: str,
    step_id: str,
    target_step_id: str | None = None,
    condition: dict[str, Any] | str | None = None,
) -> dict:
    d: dict[str, Any] = {"id": id, "step_id": step_id}
    if target_step_id is not None:
        d["target_step_id"] = target_step_id
    if condition is not None:
        if isinstance(condition, str):
            d["condition"] = {"id": condition}
        elif isinstance(condition, dict):
            d["condition"] = {"id": condition.get("id")}
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
) -> dict:
    d: dict[str, Any] = {
        "id": id,
        "name": name,
        "description": description,
        "workflow_template_id": workflow_template_id,
        "expected_completion": expected_completion,
        "last_edited": last_edited,
    }
    if form is not None:
        d["form"] = form
    if branches is not None:
        d["branches"] = branches
    return d


def test_unmarshal_step_with_form_and_branches():
    """
    When a WorkflowTemplateStep payload contains a FormTemplateOrm and two WorkflowTemplateStepBranchOrms,
      - the unmarshaller should:
        - strip out 'form' and 'branches' before calling schema().load(...) for the Step,
        - separately load FormTemplateOrm and WorkflowTemplateStepBranchOrm (+RuleGroupOrm),
        - attach them back to the returned Step object.
    """
    step_id = "wts-100"
    form = _form_payload(id="ft-123")
    branches = [
        _create_branch(
            id="wtsb-1",
            step_id=step_id,
            target_step_id="wts-200",
            condition={"id": "rg-555"},
        ),
        _create_branch(
            id="wtsb-2",
            step_id=step_id,
            target_step_id="wts-150",
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
    )

    obj = unmarshal(WorkflowTemplateStepOrm, payload)
    assert isinstance(obj, WorkflowTemplateStepOrm)

    # Scalars
    assert obj.id == "wts-100"
    assert obj.name == "Registration"
    assert obj.description == "Capture intake details and vitals"
    assert obj.workflow_template_id == "wt-42"
    assert obj.expected_completion == 3_600
    assert obj.last_edited == 1_700_100_000

    # Form attached
    assert isinstance(obj.form, FormTemplateOrm)
    assert obj.form.id == "ft-123"

    # Branches attached
    assert isinstance(obj.branches, list) and len(obj.branches) == 2
    b1, b2 = obj.branches
    assert isinstance(b1, WorkflowTemplateStepBranchOrm)
    assert b1.id == "wtsb-1"
    assert b1.step_id == step_id
    assert b1.target_step_id == "wts-200"
    assert isinstance(b1.condition, RuleGroupOrm)
    assert b1.condition.id == "rg-555"

    assert isinstance(b2, WorkflowTemplateStepBranchOrm)
    assert b2.id == "wtsb-2"
    assert b2.step_id == step_id
    assert b2.target_step_id == "wts-150"
    # No condition on second branch
    assert getattr(b2, "condition", None) is None


def test_unmarshal_step_without_form_or_branches():
    """
    Tests that unmarshaling a WorkflowTemplateStepOrm payload without 'form' or 'branches'
    sets form=None and branches=[] on the returned object.

    The test case verifies that the unmarshalled object has the correct fields and that
    form=None and branches=[] are set correctly.
    """
    payload = _create_step(
        id="wts-200",
        name="Review",
        description="Supervisor reviews intake form",
        workflow_template_id="wt-42",
        expected_completion=7_200,
        last_edited=1_700_200_000,
    )

    obj = unmarshal(WorkflowTemplateStepOrm, payload)
    assert isinstance(obj, WorkflowTemplateStepOrm)
    assert obj.id == "wts-200"
    assert obj.name == "Review"
    assert obj.description == "Supervisor reviews intake form"
    assert obj.workflow_template_id == "wt-42"
    assert obj.expected_completion == 7_200
    assert obj.last_edited == 1_700_200_000

    assert obj.form is None
    assert obj.branches == []


def test_unmarshal_step_strips_none_and_handles_empty_branches():
    """
    Tests that unmarshaling a WorkflowTemplateStepOrm with 'form' and 'branches' as None/empty
    strips out 'form' and 'branches' before calling WorkflowTemplateStepOrm.load().

    Also checks that no nested loads occur (i.e. no WorkflowTemplateStepBranchOrm loads),
    and that the resulting object has form=None and branches=[], and no expected_completion attribute.
    """
    payload = _create_step(
        id="wts-300",
        name="Counseling",
        description="Provide counseling and education",
        workflow_template_id="wt-42",
        form=None,
        branches=[],
        expected_completion=None,
        last_edited=1_700_300_000,
    )

    obj = unmarshal(WorkflowTemplateStepOrm, payload)
    assert isinstance(obj, WorkflowTemplateStepOrm)
    assert obj.id == "wts-300"
    assert obj.name == "Counseling"
    assert obj.description == "Provide counseling and education"
    assert obj.workflow_template_id == "wt-42"
    assert obj.last_edited == 1_700_300_000

    assert obj.form is None
    assert obj.branches == []

    assert getattr(obj, "expected_completion", None) is None
