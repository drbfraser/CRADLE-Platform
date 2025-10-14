# ruff: noqa: SLF001
import data.marshal as m
from models import (
    FormClassificationOrm,
    FormTemplateOrm,
    RuleGroupOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
)


def _make_min_form_template(
    template_id: str, classification_id: str
) -> FormTemplateOrm:
    """Minimal FormTemplateOrm suitable for __marshal_form_template."""
    fc = FormClassificationOrm()
    fc.id = classification_id
    fc.name = "Clinical"

    form = FormTemplateOrm()
    form.id = template_id
    form.name = "ANC Intake"
    form.description = "Initial antenatal visit"
    form.classification = fc
    form.questions = []  # important: function sorts/questions even if empty
    return form


def _make_condition(rule_group_id: str, rule=None, data_sources=None) -> RuleGroupOrm:
    rg = RuleGroupOrm()
    rg.id = rule_group_id
    rg.rule = {"all": []} if rule is None else rule
    rg.data_sources = [] if data_sources is None else data_sources
    return rg


def test_workflow_template_step_marshal_full_includes_form_condition_and_branches():
    """
    __marshal_workflow_template_step should:
      - keep scalar fields that are not None,
      - embed a marshaled 'form' (with classification, questions=[]),
      - embed a marshaled 'condition' (preserving JSON fields),
      - include marshaled 'branches' (each may embed its own condition),
      - not leak private attributes from any object.
    """
    step = WorkflowTemplateStepOrm()
    step.id = "wts-101"
    step.name = "Collect vitals"
    step.description = "Measure BP, HR, Temp"
    step.expected_completion = 2 * 60 * 60  # seconds
    step.last_edited = 1_700_000_000
    step.workflow_template_id = "wt-001"

    # Attach form and condition
    step.form_id = "ft-10"
    step.form = _make_min_form_template(step.form_id, "fc-1")

    step.condition_id = "rg-200"
    step.condition = _make_condition(step.condition_id)

    # Two real ORM branches
    b1 = WorkflowTemplateStepBranchOrm()
    b1.id = "br-001"
    b1.step_id = step.id
    b1.target_step_id = "wts-200"
    b1.condition_id = "rg-201"
    b1.condition = _make_condition("rg-201")

    b2 = WorkflowTemplateStepBranchOrm()
    b2.id = "br-002"
    b2.step_id = step.id
    b2.target_step_id = "wts-999"

    # Appending mapped instances is allowed and sets the backref .step
    step.branches = [b1, b2]

    out = m.marshal(step, shallow=False)

    # Top-level expectations
    for key in (
        "id",
        "name",
        "description",
        "last_edited",
        "workflow_template_id",
        "form",
        "branches",
    ):
        assert key in out
    assert out["id"] == "wts-101"
    assert out["name"] == "Collect vitals"
    assert out["description"] == "Measure BP, HR, Temp"
    assert out["last_edited"] == 1_700_000_000
    assert out["workflow_template_id"] == "wt-001"
    assert out["expected_completion"] == 2 * 60 * 60
    assert "_scratch" not in out  # private stripped

    # Form embedding
    form = out["form"]
    for key in ("id", "name", "description", "classification", "questions"):
        assert key in form
    assert form["id"] == "ft-10"
    assert form["questions"] == []  # preserved
    assert isinstance(form["classification"], dict)
    assert form["classification"]["id"] == "fc-1"

    # Branches
    branches = out["branches"]
    assert isinstance(branches, list) and len(branches) == 2

    # br-001 with its own condition
    b1_out = next(b for b in branches if b["id"] == "br-001")
    for key in ("id", "step_id", "target_step_id"):
        assert key in b1_out
    assert b1_out["step_id"] == "wts-101"
    assert b1_out["target_step_id"] == "wts-200"
    assert "condition" in b1_out and isinstance(b1_out["condition"], dict)
    assert b1_out["condition"]["id"] == "rg-201"
    # We intentionally do NOT assert that extra relationship keys (like 'step') are absent.

    # br-002 without condition
    b2_out = next(b for b in branches if b["id"] == "br-002")
    assert b2_out["target_step_id"] == "wts-999"
    # condition_id was None -> __pre_process strips None
    assert "condition" not in b2_out
    assert "condition_id" not in b2_out or b2_out["condition_id"] is None


def test_workflow_template_step_marshal_shallow_tolerates_existing_branches_attr():
    """
    With shallow=True:
      - function does not *add* 'branches', but vars(wts) may already include
        a 'branches' attribute from SQLAlchemy; we allow either absence or [].
      - 'form' is still embedded,
      - 'condition' omitted when None,
      - None-valued fields (e.g., expected_completion) stripped.
    """
    step = WorkflowTemplateStepOrm()
    step.id = "wts-202"
    step.name = "Review labs"
    step.description = "Check CBC and LFTs"
    step.expected_completion = None  # should be stripped
    step.last_edited = 1_800_000_000
    step.workflow_template_id = "wt-002"

    step.form_id = "ft-22"
    step.form = _make_min_form_template(step.form_id, "fc-2")

    step.condition_id = None
    step.condition = None

    step.branches = []

    out = m.marshal(step, shallow=True)

    if "branches" in out:
        assert out["branches"] == []
    else:
        assert "branches" not in out

    # 'form' present and embedded
    assert "form" in out and isinstance(out["form"], dict)

    # 'condition' omitted because None; condition_id removed as None
    assert "condition" not in out
    assert "condition_id" not in out

    # None-valued scalar stripped
    assert "expected_completion" not in out

    # core fields present
    for key in ("id", "name", "description", "last_edited", "workflow_template_id"):
        assert key in out
