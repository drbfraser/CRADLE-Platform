# ruff: noqa: SLF001
import data.marshal as m
from models import (
    FormClassificationOrm,
    FormTemplateOrm,
    RuleGroupOrm,
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepOrm,
)


def _make_form_template(template_id: str, fc_id: str) -> FormTemplateOrm:
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
    s.description = "Collect vitals"
    s.expected_completion = 3600
    s.last_edited = 1_700_000_000
    s.workflow_template_id = template_id
    s._scratch = "strip-me"

    s.form_id = form_template_id
    s.form = _make_form_template(form_template_id, form_fc_id)

    s.condition_id = None
    s.condition = None
    s.branches = []
    return s


def _make_workflow_template(
    wt_id: str,
    classification: WorkflowClassificationOrm,
    *,
    with_initial_condition: bool,
    with_one_step: bool,
) -> WorkflowTemplateOrm:
    wt = WorkflowTemplateOrm()
    wt.id = wt_id
    wt.name = f"Template {wt_id}"
    wt.description = "Routine antenatal care"
    wt.archived = False
    wt.date_created = 1_690_000_000
    wt.last_edited = 1_700_000_000
    wt.version = "v1"
    wt.starting_step_id = "start-1"
    wt._private = "strip-me"

    wt.classification = classification
    wt.classification_id = classification.id

    if with_initial_condition:
        wt.initial_condition_id = f"rg-init-{wt_id}"
        wt.initial_condition = _make_condition(
            wt.initial_condition_id,
            rule={"any": []},
            data_sources=[{"type": "patient"}],
        )
    else:
        wt.initial_condition_id = None
        wt.initial_condition = None

    if with_one_step:
        step = _make_step(
            step_id=f"wts-{wt_id}-1",
            template_id=wt.id,
            form_template_id=f"ft-{wt_id}-1",
            form_fc_id=f"fc-{wt_id}-1",
        )
        wt.steps = [step]
    else:
        wt.steps = []

    return wt


def test_workflow_classification_marshal_basic_omits_backrefs_and_privates():
    """
    Basic marshal of WorkflowClassificationOrm should:
      - include scalar fields 'id', 'name', and 'collection_id' when set,
      - strip private attrs,
      - not include relationship collections by default.
    """
    wc = WorkflowClassificationOrm()
    wc.id = "wc-1"
    wc.name = "Antenatal"
    wc.collection_id = "coll-1"
    wc._secret = "nope"

    out = m.marshal(wc)

    assert out["id"] == "wc-1"
    assert out["name"] == "Antenatal"
    assert out["collection_id"] == "coll-1"
    assert "_secret" not in out
    assert "workflow_templates" not in out
    assert "collection" not in out


def test_workflow_classification_marshal_includes_templates_with_shallow():
    """
    marshal(wc, if_include_versions=True, shallow=True) should:
      - include 'workflow_templates' (list) built from wc.templates,
      - embed each template with its own 'classification',
      - omit 'steps' (shallow=True),
      - include 'initial_condition' only when present,
      - strip private attrs at all levels.
    """
    wc = WorkflowClassificationOrm()
    wc.id = "wc-2"
    wc.name = "Postnatal"
    wc.collection_id = None

    # Two templates, one with initial condition, one without
    wt1 = _make_workflow_template(
        "wt-A", wc, with_initial_condition=True, with_one_step=True
    )
    wt2 = _make_workflow_template(
        "wt-B", wc, with_initial_condition=False, with_one_step=False
    )

    wc.workflow_templates = [wt1, wt2]
    wc.templates = [wt1, wt2]

    out = m.marshal(wc, shallow=True, if_include_versions=True)

    # Top-level checks
    assert out["id"] == "wc-2"
    assert out["name"] == "Postnatal"
    assert "collection_id" not in out
    assert "workflow_templates" in out and isinstance(out["workflow_templates"], list)
    assert {t["id"] for t in out["workflow_templates"]} == {"wt-A", "wt-B"}

    # Template A (has initial condition, steps omitted due to shallow=True)
    tA = next(t for t in out["workflow_templates"] if t["id"] == "wt-A")
    for k in (
        "id",
        "name",
        "description",
        "archived",
        "date_created",
        "last_edited",
        "version",
        "starting_step_id",
        "classification",
    ):
        assert k in tA
    assert "_private" not in tA
    assert "steps" not in tA

    # Initial condition present and cleaned
    assert "initial_condition" in tA
    ic = tA["initial_condition"]
    # required fields present
    for k in ("id", "rule", "data_sources"):
        assert k in ic
    # no private attrs / common backrefs
    assert all(not k.startswith("_") for k in ic.keys())
    assert "workflow_template_steps" not in ic
    assert "workflow_template_step_branches" not in ic

    # Embedded classification should not leak backrefs/private
    assert tA["classification"]["id"] == wc.id
    assert "workflow_templates" not in tA["classification"]

    # Template B (no initial condition)
    tB = next(t for t in out["workflow_templates"] if t["id"] == "wt-B")
    assert "steps" not in tB
    assert "initial_condition" not in tB
    assert tB["classification"]["id"] == wc.id
