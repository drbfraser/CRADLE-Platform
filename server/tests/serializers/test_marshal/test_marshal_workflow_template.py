# ruff: noqa: SLF001
import data.marshal as m
from models import (
    FormClassificationOrm,
    FormTemplateOrm,
    RuleGroupOrm,
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
)


def _make_form_template(template_id: str, fc_id: str) -> FormTemplateOrm:
    """Minimal FormTemplate that satisfies __marshal_form_template."""
    fc = FormClassificationOrm()
    fc.id = fc_id
    fc.name = "Clinical"
    fc._internal = "strip-me"

    ft = FormTemplateOrm()
    ft.id = template_id
    ft.name = "ANC Intake"
    ft.description = "Initial antenatal visit"
    ft.classification = fc
    ft.questions = []
    ft._cache = {"ignore": True}
    return ft


def _make_condition(rg_id: str, rule=None, data_sources=None) -> RuleGroupOrm:
    rg = RuleGroupOrm()
    rg.id = rg_id
    rg.rule = {"all": []} if rule is None else rule
    rg.data_sources = [] if data_sources is None else data_sources
    rg._debug = "strip-me"
    return rg


def _make_step(
    step_id: str, template_id: str, form_template_id: str, form_fc_id: str
) -> WorkflowTemplateStepOrm:
    s = WorkflowTemplateStepOrm()
    s.id = step_id
    s.name = f"Step {step_id}"
    s.description = f"Description for {step_id}"
    s.expected_completion = 3600
    s.last_edited = 1_700_000_000
    s.workflow_template_id = template_id
    s._scratch = "strip-me"

    s.form_id = form_template_id
    s.form = _make_form_template(form_template_id, form_fc_id)

    b1 = WorkflowTemplateStepBranchOrm()
    b1.id = f"br-{step_id}-1"
    b1.step_id = s.id
    b1.target_step_id = "next-1"

    b2 = WorkflowTemplateStepBranchOrm()
    b2.id = f"br-{step_id}-2"
    b2.step_id = s.id
    b2.target_step_id = "next-2"
    b2.condition_id = None
    b2.condition = None

    s.branches = [b1, b2]
    return s


def test_workflow_template_marshal_full_embeds_classification_steps():
    """
    __marshal_workflow_template (shallow=False) should:
      - keep scalar fields and omit private ones,
      - embed a marshaled 'classification' (without leaking private/relationship junk),
      - include 'steps' where each step embeds its 'form', optional 'condition', and 'branches',
      - respect None-stripping throughout the tree.
    """
    wt = WorkflowTemplateOrm()
    wt.id = "wt-001"
    wt.name = "ANC Workflow"
    wt.description = "Routine antenatal care"
    wt.archived = False
    wt.date_created = 1_690_000_000
    wt.last_edited = 1_700_000_000
    wt.version = "v1"
    wt.starting_step_id = "wts-1"
    wt._private = "strip-me"

    # template classification
    wc = WorkflowClassificationOrm()
    wc.id = "wc-1"
    wc.name = "Antenatal"
    wc._hidden = "strip-me"
    wt.classification_id = wc.id
    wt.classification = wc

    # steps
    s1 = _make_step(
        "wts-1",
        wt.id,
        form_template_id="ft-1",
        form_fc_id="fc-1",
    )
    s2 = _make_step(
        "wts-2",
        wt.id,
        form_template_id="ft-2",
        form_fc_id="fc-2",
    )
    wt.steps = [s1, s2]

    out = m.marshal(wt, shallow=False)

    for key in (
        "id",
        "name",
        "description",
        "archived",
        "date_created",
        "last_edited",
        "version",
        "starting_step_id",
    ):
        assert key in out
    assert out["id"] == wt.id
    assert out["name"] == "ANC Workflow"
    assert out["archived"] is False
    assert out["date_created"] == 1_690_000_000
    assert out["version"] == "v1"
    assert out["starting_step_id"] == "wts-1"
    assert "_private" not in out  # private stripped

    # classification embedded
    assert "classification" in out and isinstance(out["classification"], dict)
    assert out["classification"]["id"] == "wc-1"
    assert out["classification"]["name"] == "Antenatal"
    assert "_hidden" not in out["classification"]

    # steps present and sorted order is not guaranteed by __marshal_workflow_template,
    # so we just index by id
    steps = {s["id"]: s for s in out["steps"]}
    assert set(steps.keys()) == {"wts-1", "wts-2"}

    step1 = steps["wts-1"]
    for k in (
        "id",
        "name",
        "description",
        "last_edited",
        "workflow_template_id",
        "form",
        "branches",
    ):
        assert k in step1
    assert step1["workflow_template_id"] == "wt-001"
    assert step1["expected_completion"] == 3600
    assert "_scratch" not in step1

    # Step 1 form
    f1 = step1["form"]
    for k in ("id", "name", "description", "classification", "questions"):
        assert k in f1
    assert f1["id"] == "ft-1"
    assert f1["questions"] == []
    assert "_cache" not in f1
    assert "classification" in f1 and f1["classification"]["id"] == "fc-1"

    # Step 1 branches
    b1 = {b["id"]: b for b in step1["branches"]}
    assert set(b1.keys()) == {"br-wts-1-1", "br-wts-1-2"}
    assert b1["br-wts-1-1"]["target_step_id"] == "next-1"

    assert b1["br-wts-1-2"]["target_step_id"] == "next-2"

    step2 = steps["wts-2"]
    b2 = {b["id"]: b for b in step2["branches"]}
    assert set(b2.keys()) == {"br-wts-2-1", "br-wts-2-2"}


def test_workflow_template_marshal_shallow_omits_steps_and_strips_nones():
    """
    With shallow=True:
      - 'steps' MUST be omitted,
      - 'classification' is still embedded,
      - None-valued fields are stripped (e.g., starting_step_id when None).
    """
    wt = WorkflowTemplateOrm()
    wt.id = "wt-002"
    wt.name = "Postnatal Workflow"
    wt.description = "Postnatal follow-up"
    wt.archived = True
    wt.date_created = 1_700_000_001
    wt.last_edited = 1_700_000_002
    wt.version = "v2"
    wt.starting_step_id = None  # should be stripped in shallow output
    wt._private = "strip-me"

    wc = WorkflowClassificationOrm()
    wc.id = "wc-2"
    wc.name = "Postnatal"
    wt.classification = wc
    wt.classification_id = wc.id

    out = m.marshal(wt, shallow=True)

    for k in (
        "id",
        "name",
        "description",
        "archived",
        "date_created",
        "last_edited",
        "version",
        "classification",
    ):
        assert k in out
    assert out["archived"] is True
    assert out["version"] == "v2"
    assert "_private" not in out

    assert "starting_step_id" not in out
    assert out["classification"]["id"] == "wc-2"
    assert "steps" not in out
