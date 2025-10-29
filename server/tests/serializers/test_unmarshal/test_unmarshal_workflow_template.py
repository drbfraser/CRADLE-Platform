from __future__ import annotations

import types
from typing import Any

from data.marshal import unmarshal
from models import (
    WorkflowTemplateOrm,
)


def _create_form_template(
    *,
    id: str,
    title: str = "ANC Registration",
    version: str = "1.0",
    **extras: Any,
) -> dict:
    """
    Create a form template object with the given parameters.

    Args:
        id (str): Unique identifier for the form template.
        title (str, optional): Title of the form template. Defaults to "ANC Registration".
        version (str, optional): Version of the form template. Defaults to "1.0".
        **extras (Any): Additional key-value pairs to include in the form template.

    Returns:
        dict: Form template object with the given parameters.

    """
    return {"id": id, "title": title, "version": version, **extras}


def _create_rule_group(
    *,
    id: str,
    name: str = "IF danger_signs",
    rules: list[dict[str, Any]] | None = None,
    **extras: Any,
) -> dict:
    """
    Create a rule group object with the given parameters.

    Args:
        id (str): Unique identifier for the rule group.
        name (str, optional): Name of the rule group. Defaults to "IF danger_signs".
        rules (list[dict[str, Any]], optional): List of rules for the rule group. Defaults to None.
        **extras (Any): Additional key-value pairs to include in the rule group.

    Returns:
        dict: Rule group object with the given parameters.

    """
    return {
        "id": id,
        "name": name,
        "rules": rules or [{"field": "danger_signs", "equals": True}],
        **extras,
    }


def _create_branch(
    *,
    id: str,
    step_id: str,
    target_step_id: str | None,
    condition: dict[str, Any] | None = None,
    **extras: Any,
) -> dict:
    """
    Create a minimal WorkflowTemplateStepBranchOrm payload dictionary.

    Args:
        id (str): Unique identifier for the step branch.
        step_id (str): ID of the WorkflowTemplateStepOrm associated with the branch.
        target_step_id (str | None): ID of the WorkflowTemplateStepOrm to go to next if the condition is satisfied.
        condition (dict[str, Any] | None): Condition to check, if any.
        **extras (Any): Additional key-value pairs to include in the payload.

    Returns:
        dict: Minimal WorkflowTemplateStepBranchOrm payload dictionary.

    """
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
    """
    Construct a minimal WorkflowTemplateStepOrm payload dictionary.

    Args:
        id (str): Unique identifier for the step.
        name (str): Name of the step.
        description (str): Description of the step.
        workflow_template_id (str): ID of the WorkflowTemplateOrm associated with the step.
        form (dict[str, Any] | None): FormTemplateOrm payload dictionary, if any.
        branches (list[dict[str, Any]] | None): List of WorkflowTemplateStepBranchOrm payload dictionaries, if any.
        expected_completion (int | None): Expected time to complete the step in seconds, if any.
        last_edited (int): Timestamp when the step was last edited.
        **extras (Any): Additional key-value pairs to include in the payload.

    Returns:
        dict: Minimal WorkflowTemplateStepOrm payload dictionary.

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


def _classification_payload(
    *,
    id: str,
    name: str = "Antenatal Care",
    code: str = "ANC",
    **extras: Any,
) -> dict:
    """
    Create a classification object with the given parameters.

    Args:
        id (str): Unique identifier for the classification.
        name (str, optional): Name of the classification. Defaults to "Antenatal Care".
        code (str, optional): Code of the classification. Defaults to "ANC".
        **extras (Any): Additional key-value pairs to include in the classification.

    Returns:
        dict: Classification object with the given parameters.

    """
    return {"id": id, "name": name, "code": code, **extras}


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
    """
    Minimal but realistic WorkflowTemplateOrm payload.
    We keep it intentionally small—unmarshal only forwards to schema().load(...)
    and attaches the returned object to the step.

    Args:
        id (str): Unique identifier for the template.
        name (str): Name of the template.
        description (str): Description of the template.
        version (str): Version of the template.
        archived (bool, optional): Whether the template is archived. Defaults to False.
        date_created (int, optional): Timestamp when the template was created. Defaults to 1_699_999_999.
        last_edited (int, optional): Timestamp when the template was last edited. Defaults to 1_700_123_456.
        starting_step_id (str | None, optional): ID of the starting step of the template, if any. Defaults to None.
        steps (list[dict[str, Any]] | None, optional): List of WorkflowTemplateStepOrm payload dictionaries, if any. Defaults to None.
        classification (dict[str, Any] | None, optional): Classification object associated with the template, if any. Defaults to None.
        **extras (Any): Additional key-value pairs to include in the payload.

    Returns:
        dict: Minimal WorkflowTemplateOrm payload dictionary.

    """
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


def test_unmarshal_workflow_template_with_steps_and_classification(
    schema_loads_by_model, without_model_key
):
    """
    Verifies that unmarshalling a WorkflowTemplateOrm payload with steps and classification
    attaches the correct objects to the returned object and forwards the payloads
    unchanged to schema().load(...).

    The test case unmarshals a WorkflowTemplateOrm payload with two steps and a classification,
    and verifies the following conditions:

    - The returned object has the correct top-level fields.
    - The attached steps have the correct fields, including form and branches.
    - The attached classification has the correct fields.
    - The forwarded payloads to schema().load(...) are correct.

    The test case uses the following payloads:

    - WorkflowTemplateOrm payload with two steps and a classification.
    - FormTemplateOrm payload for the first step.
    - RuleGroupOrm payload for the first step's branch.
    - WorkflowTemplateStepOrm payload for the second step.
    - WorkflowClassificationOrm payload for the classification.

    The test case verifies that the unmarshalled object has the correct fields and that
    the forwarded payloads to schema().load(...) are correct.
    """
    wt_id = "wt-42"
    step1_id, step2_id = "wts-100", "wts-200"

    form1 = _create_form_template(id="ft-001", title="ANC Intake", version="1.1")
    cond = _create_rule_group(
        id="rg-900", rules=[{"field": "danger_signs", "equals": True}]
    )

    branches1 = [
        _create_branch(
            id="wtsb-1",
            step_id=step1_id,
            target_step_id=step2_id,
            condition=cond,
            branch_label="Refer",
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
        sla="P1D",
    )
    step2 = _create_step(
        id=step2_id,
        name="Review",
        description="Supervisor review",
        workflow_template_id=wt_id,
        # No form/branches
        expected_completion=7_200,
        last_edited=1_700_200_002,
    )
    classification = _classification_payload(id="wc-007", name="ANC", code="ANC")

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
        owner="MOH",
    )

    # --- Pre-count schema.load calls for precise slicing ---
    pre_wt = len(schema_loads_by_model("WorkflowTemplateOrm"))
    pre_step = len(schema_loads_by_model("WorkflowTemplateStepOrm"))
    pre_form = len(schema_loads_by_model("FormTemplateOrm"))
    pre_branch = len(schema_loads_by_model("WorkflowTemplateStepBranchOrm"))
    pre_rule = len(schema_loads_by_model("RuleGroupOrm"))
    pre_wc = len(schema_loads_by_model("WorkflowClassificationOrm"))

    # --- Unmarshal ---
    obj = unmarshal(WorkflowTemplateOrm, payload)
    assert isinstance(obj, types.SimpleNamespace)

    # Top-level fields
    assert obj.id == wt_id
    assert obj.name == "ANC Workflow v1"
    assert obj.description == "Standard ANC flow"
    assert obj.version == "1.0"
    assert obj.archived is False
    assert obj.date_created == 1_699_999_999
    assert obj.last_edited == 1_700_123_456
    assert obj.starting_step_id == step1_id
    assert getattr(obj, "owner", None) == "MOH"

    # Attached steps and classification
    assert isinstance(obj.steps, list) and len(obj.steps) == 2
    s1, s2 = obj.steps
    assert isinstance(s1, types.SimpleNamespace) and isinstance(
        s2, types.SimpleNamespace
    )
    assert s1.id == step1_id and s2.id == step2_id
    assert getattr(s1, "form", None) is not None
    assert getattr(s1, "branches", None) and len(s1.branches) == 1
    assert getattr(s2, "form", None) is None
    assert getattr(s2, "branches", None) == []

    assert isinstance(obj.classification, types.SimpleNamespace)
    assert obj.classification.id == "wc-007"
    assert getattr(obj.classification, "code", None) == "ANC"

    # --- Validate forwarded payloads to schema().load(...) ---

    # Slice new calls added by THIS test
    wt_loads = schema_loads_by_model("WorkflowTemplateOrm")[pre_wt:]
    step_loads = schema_loads_by_model("WorkflowTemplateStepOrm")[pre_step:]
    form_loads = schema_loads_by_model("FormTemplateOrm")[pre_form:]
    branch_loads = schema_loads_by_model("WorkflowTemplateStepBranchOrm")[pre_branch:]
    rule_loads = schema_loads_by_model("RuleGroupOrm")[pre_rule:]
    wc_loads = schema_loads_by_model("WorkflowClassificationOrm")[pre_wc:]

    # Top-level WT payload should NOT contain 'steps' or 'classification'
    expected_wt_forward = {
        "id": wt_id,
        "name": "ANC Workflow v1",
        "description": "Standard ANC flow",
        "archived": False,
        "date_created": 1_699_999_999,
        "starting_step_id": step1_id,
        "last_edited": 1_700_123_456,
        "version": "1.0",
        "owner": "MOH",
    }
    assert wt_loads and without_model_key(wt_loads[-1]) == expected_wt_forward

    # Steps forwarded WITHOUT 'form'/'branches'
    assert len(step_loads) == 2
    forwarded_steps = [without_model_key(x) for x in step_loads]
    assert {
        "id": step1_id,
        "name": "Registration",
        "description": "Capture intake details",
        "workflow_template_id": wt_id,
        "expected_completion": 3_600,
        "last_edited": 1_700_200_001,
        "sla": "P1D",
    } in forwarded_steps
    assert {
        "id": step2_id,
        "name": "Review",
        "description": "Supervisor review",
        "workflow_template_id": wt_id,
        "expected_completion": 7_200,
        "last_edited": 1_700_200_002,
    } in forwarded_steps

    # Form payload forwarded as-is
    assert len(form_loads) == 1
    assert without_model_key(form_loads[0]) == form1

    # Branch and condition payloads forwarded as-is
    assert len(branch_loads) == 1
    assert without_model_key(branch_loads[0]) == branches1[0]
    assert len(rule_loads) == 1
    assert without_model_key(rule_loads[0]) == cond

    # Classification forwarded as-is
    assert len(wc_loads) == 1
    assert without_model_key(wc_loads[0]) == classification


def test_unmarshal_workflow_template_minimal_no_steps_no_classification(
    schema_loads_by_model, without_model_key
):
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

    pre_wt = len(schema_loads_by_model("WorkflowTemplateOrm"))
    pre_step = len(schema_loads_by_model("WorkflowTemplateStepOrm"))
    pre_form = len(schema_loads_by_model("FormTemplateOrm"))
    pre_branch = len(schema_loads_by_model("WorkflowTemplateStepBranchOrm"))
    pre_rule = len(schema_loads_by_model("RuleGroupOrm"))
    pre_wc = len(schema_loads_by_model("WorkflowClassificationOrm"))

    obj = unmarshal(WorkflowTemplateOrm, payload)
    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wt-2"
    assert obj.name == "Simple Flow"
    assert obj.description == "A very small template"
    assert obj.version == "0.1"
    assert obj.archived is True
    assert obj.date_created == 1_700_000_000
    assert obj.last_edited == 1_700_000_010
    assert getattr(obj, "starting_step_id", None) is None
    assert obj.steps == []
    assert obj.classification is None

    # Forwarded as-is
    wt_loads = schema_loads_by_model("WorkflowTemplateOrm")[pre_wt:]
    assert wt_loads and without_model_key(wt_loads[-1]) == payload

    # No nested loads
    assert len(schema_loads_by_model("WorkflowTemplateStepOrm")[pre_step:]) == 0
    assert len(schema_loads_by_model("FormTemplateOrm")[pre_form:]) == 0
    assert len(schema_loads_by_model("WorkflowTemplateStepBranchOrm")[pre_branch:]) == 0
    assert len(schema_loads_by_model("RuleGroupOrm")[pre_rule:]) == 0
    assert len(schema_loads_by_model("WorkflowClassificationOrm")[pre_wc:]) == 0


def test_unmarshal_workflow_template_strips_none_and_handles_empty_steps(
    schema_loads_by_model, without_model_key
):
    """
    Tests that unmarshaling a WorkflowTemplateOrm with starting_step_id=None and steps=[]
    will strip the starting_step_id key and pop the steps key before forwarding the payload
    to WorkflowTemplateOrm.load().

    Also checks that no nested loads occur (i.e. no WorkflowTemplateStepOrm or
    WorkflowClassificationOrm loads).
    """
    payload = _template_payload(
        id="wt-3",
        name="Nulls Example",
        description="Demonstrates stripping of None",
        version="1.2",
        archived=False,
        date_created=1_700_100_000,
        last_edited=1_700_100_500,
        starting_step_id=None,  # should be stripped
        steps=[],  # should be popped before load
    )

    pre_wt = len(schema_loads_by_model("WorkflowTemplateOrm"))
    pre_step = len(schema_loads_by_model("WorkflowTemplateStepOrm"))
    pre_wc = len(schema_loads_by_model("WorkflowClassificationOrm"))

    obj = unmarshal(WorkflowTemplateOrm, payload)
    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wt-3"
    assert obj.steps == []  # attached default
    assert obj.classification is None

    wt_loads = schema_loads_by_model("WorkflowTemplateOrm")[pre_wt:]
    assert wt_loads, "Expected WorkflowTemplateOrm.load(...) to be called"

    forwarded = without_model_key(wt_loads[-1])
    # 'starting_step_id' and 'steps' should not be in forwarded dict
    assert forwarded == {
        "id": "wt-3",
        "name": "Nulls Example",
        "description": "Demonstrates stripping of None",
        "archived": False,
        "date_created": 1_700_100_000,
        "last_edited": 1_700_100_500,
        "version": "1.2",
    }

    # No nested loads expected here
    assert len(schema_loads_by_model("WorkflowTemplateStepOrm")[pre_step:]) == 0
    assert len(schema_loads_by_model("WorkflowClassificationOrm")[pre_wc:]) == 0
