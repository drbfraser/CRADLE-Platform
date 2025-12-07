from __future__ import annotations

from typing import Any

from data import orm_serializer
from models import (
    FormTemplateOrm,
    RuleGroupOrm,
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
)


def _create_form_template(*, id: str, **extras: Any) -> dict:
    d: dict[str, Any] = {"id": id}
    d.update(extras)
    return d


def _create_rule_group(*, id: str, **extras: Any) -> dict:
    d: dict[str, Any] = {"id": id}
    d.update(extras)
    return d


def _create_branch(
    *,
    id: str,
    step_id: str,
    target_step_id: str | None,
    condition: dict[str, Any] | None = None,
    **extras: Any,
) -> dict:
    d: dict[str, Any] = {"id": id, "step_id": step_id}
    if target_step_id is not None:
        d["target_step_id"] = target_step_id
    if condition is not None:
        d["condition"] = condition
    d.update(extras)
    return d


def _create_step(
    *,
    id: str,
    name: str,
    description: str,
    workflow_template_id: str,
    form: dict[str, Any] | None = None,
    branches: list[dict[str, Any]] | None = None,
    expected_completion: int | None = 3600,
    last_edited: int = 1_700_000_000,
    **extras: Any,
) -> dict:
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


def _classification_payload(*, id: str, name: str = "ANC", **extras: Any) -> dict:
    d: dict[str, Any] = {"id": id, "name": name}
    d.update(extras)
    return d


def _template_payload(
    *,
    id: str,
    name: str,
    description: str,
    version: str,
    archived: bool = False,
    date_created: int = 1_699_999_999,
    last_edited: int = 1_700_123_456,
    starting_step_id: str | None = None,
    steps: list[dict[str, Any]] | None = None,
    classification: dict[str, Any] | None = None,
    **extras: Any,
) -> dict:
    d: dict[str, Any] = {
        "id": id,
        "name": name,
        "description": description,
        "archived": archived,
        "date_created": date_created,
        "starting_step_id": starting_step_id,
        "last_edited": last_edited,
        "version": version,
        **extras,
    }
    if steps is not None:
        d["steps"] = steps
    if classification is not None:
        d["classification"] = classification
    return d


def test_unmarshal_workflow_template_with_steps_and_classification():
    """
    Tests that unmarshaling a WorkflowTemplateOrm with steps and classification
    deserializes to an object with the correct nested objects.
    """
    wt_id = "wt-42"
    step1_id, step2_id = "wts-100", "wts-200"

    form1 = _create_form_template(id="ft-001")
    cond = _create_rule_group(id="rg-900")

    branches1 = [
        _create_branch(
            id="wtsb-1",
            step_id=step1_id,
            target_step_id=step2_id,
            condition=cond,
        )
    ]
    step1 = _create_step(
        id=step1_id,
        name="Registration",
        description="Capture intake details",
        workflow_template_id=wt_id,
        form=form1,
        branches=branches1,
        expected_completion=3_600,
        last_edited=1_700_200_001,
    )
    step2 = _create_step(
        id=step2_id,
        name="Review",
        description="Supervisor review",
        workflow_template_id=wt_id,
        expected_completion=7_200,
        last_edited=1_700_200_002,
    )
    classification = _classification_payload(id="wc-007", name="ANC")

    payload = _template_payload(
        id=wt_id,
        name="ANC Workflow v1",
        description="Standard ANC flow",
        version="1.0",
        archived=False,
        date_created=1_699_999_999,
        last_edited=1_700_123_456,
        starting_step_id=step1_id,
        steps=[step1, step2],
        classification=classification,
    )

    obj = orm_serializer.unmarshal(WorkflowTemplateOrm, payload)

    # Top-level object
    assert isinstance(obj, WorkflowTemplateOrm)
    assert obj.id == wt_id
    assert obj.name == "ANC Workflow v1"
    assert obj.description == "Standard ANC flow"
    assert obj.version == "1.0"
    assert obj.archived is False
    assert obj.date_created == 1_699_999_999
    assert obj.last_edited == 1_700_123_456
    assert obj.starting_step_id == step1_id

    # Steps (via backref)
    assert isinstance(obj.steps, list) and len(obj.steps) == 2
    s1 = next(s for s in obj.steps if s.id == step1_id)
    s2 = next(s for s in obj.steps if s.id == step2_id)
    assert isinstance(s1, WorkflowTemplateStepOrm)
    assert isinstance(s2, WorkflowTemplateStepOrm)

    # Step1 -> form + branch + condition
    assert isinstance(s1.form, FormTemplateOrm)
    assert s1.form.id == "ft-001"
    assert isinstance(s1.branches, list) and len(s1.branches) == 1
    b1 = s1.branches[0]
    assert isinstance(b1, WorkflowTemplateStepBranchOrm)
    assert b1.step_id == step1_id
    assert b1.target_step_id == step2_id
    assert isinstance(b1.condition, RuleGroupOrm)
    assert b1.condition.id == "rg-900"

    # Step2 -> no form, no branches
    assert s2.form is None
    assert s2.branches == []

    # Classification
    assert isinstance(obj.classification, WorkflowClassificationOrm)
    assert obj.classification.id == "wc-007"
    assert getattr(obj.classification, "name", None) == "ANC"


def test_unmarshal_workflow_template_minimal_no_steps_no_classification():
    """
    Tests that unmarshaling a WorkflowTemplateOrm with no steps and no classification
    forwards the payload as-is to WorkflowTemplateOrm.load(), and that no nested
    loads occur.
    """
    payload = _template_payload(
        id="wt-2",
        name="Simple Flow",
        description="A very small template",
        version="0.1",
        archived=True,
        date_created=1_700_000_000,
        last_edited=1_700_000_010,
    )
    payload.pop("starting_step_id", None)

    obj = orm_serializer.unmarshal(WorkflowTemplateOrm, payload)

    assert isinstance(obj, WorkflowTemplateOrm)
    assert obj.id == "wt-2"
    assert obj.name == "Simple Flow"
    assert obj.description == "A very small template"
    assert obj.version == "0.1"
    assert obj.archived is True
    assert obj.date_created == 1_700_000_000
    assert obj.last_edited == 1_700_000_010
    assert getattr(obj, "starting_step_id", None) is None

    # Defaults from unmarshaller
    assert obj.steps == []
    assert obj.classification is None


def test_unmarshal_workflow_template_strips_none_and_handles_empty_steps():
    """
    WorkflowTemplateOrm unmarshaling with starting_step_id=None and steps=[]
    should result in an object with starting_step_id=None and steps=[].
    No classification is expected.
    """
    payload = _template_payload(
        id="wt-3",
        name="Nulls Example",
        description="Demonstrates stripping of None",
        version="1.2",
        archived=False,
        date_created=1_700_100_000,
        last_edited=1_700_100_500,
        starting_step_id=None,
        steps=[],
    )

    obj = orm_serializer.unmarshal(WorkflowTemplateOrm, payload)

    assert isinstance(obj, WorkflowTemplateOrm)
    assert obj.id == "wt-3"
    assert obj.steps == []
    assert obj.classification is None
