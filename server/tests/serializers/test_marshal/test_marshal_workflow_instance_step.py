# ruff: noqa: SLF001
import data.marshal as m
from models import (
    FormClassificationOrm,
    FormOrm,
    RuleGroupOrm,
    WorkflowInstanceStepOrm,
)


def _make_min_form(form_id: str, fc_id: str, fc_name: str = "Clinical") -> FormOrm:
    """
    Construct a realistic FormOrm minimal for marshaling:
      - has a classification (required by __marshal_form),
      - has an empty questions list to verify shallow=False/True behavior,
      - includes a private attribute that must be stripped.
    """
    form = FormOrm()
    form.id = form_id
    form.name = "ANC Intake"
    form.description = "Initial antenatal visit"
    form._private = "nope"

    fc = FormClassificationOrm()
    fc.id = fc_id
    fc.name = fc_name
    fc.templates = []  # __marshal_form_classification explicitly deletes this
    fc._ephemeral = "nope"
    form.classification = fc

    # questions exists, but __marshal_form(..., shallow=True) must drop it
    form.questions = []
    return form


def _make_condition(rg_id: str) -> RuleGroupOrm:
    """
    Minimal valid RuleGroup for marshaling into the step's 'condition'.
    """
    rg = RuleGroupOrm()
    rg.id = rg_id
    rg.rule = {"any": []}
    rg.data_sources = [{"type": "patient"}]
    rg._scratch = "do not leak"
    return rg


def test_workflow_instance_step_marshal_full_includes_form_and_condition_and_strips_none():
    """
    __marshal_workflow_instance_step should:
      - copy scalar fields and keep non-None ones,
      - preserve 'data' (string) as-is (no JSON parsing),
      - embed a shallow marshaled 'form' with its 'classification' and without 'questions',
      - embed a marshaled 'condition',
      - strip private attributes from all levels,
      - strip None-valued fields (e.g., expected_completion when None).
    """
    wis = WorkflowInstanceStepOrm()
    wis.id = "wis-101"
    wis.name = "Collect vitals"
    wis.description = "Measure BP, HR, Temp"
    wis.start_date = 1_690_000_100
    wis.triggered_by = "wis-100"
    wis.last_edited = 1_690_000_200
    wis.expected_completion = None
    wis.completion_date = 1_690_000_300  # kept
    wis.status = "Active"
    wis.data = '{"notes":"patient anxious"}'
    wis.workflow_instance_id = "wi-001"
    wis.assigned_to = None
    wis._debug = "nope"

    # Attach form (shallow-marshaled)
    wis.form_id = "f-10"
    wis.form = _make_min_form(form_id="f-10", fc_id="fc-1")

    # Attach condition
    wis.condition_id = "rg-200"
    wis.condition = _make_condition("rg-200")

    out = m.marshal(wis)

    # Top-level scalar fields that should be present
    assert out["id"] == "wis-101"
    assert out["name"] == "Collect vitals"
    assert out["description"] == "Measure BP, HR, Temp"
    assert out["start_date"] == 1_690_000_100
    assert out["triggered_by"] == "wis-100"
    assert out["last_edited"] == 1_690_000_200
    assert out["completion_date"] == 1_690_000_300
    assert out["status"] == "Active"
    assert out["data"] == '{"notes":"patient anxious"}'
    assert out["workflow_instance_id"] == "wi-001"
    # Form/condition FKs are kept when non-None
    assert out["form_id"] == "f-10"
    assert out["condition_id"] == "rg-200"

    # Stripped fields
    assert "expected_completion" not in out
    assert "assigned_to" not in out
    assert "_debug" not in out

    # Embedded form (shallow=True inside __marshal_workflow_instance_step)
    assert "form" in out and isinstance(out["form"], dict)
    f = out["form"]
    assert f["id"] == "f-10"
    # classification is embedded and cleaned
    assert "classification" in f and isinstance(f["classification"], dict)
    fc = f["classification"]
    assert fc["id"] == "fc-1"
    assert fc["name"] == "Clinical"
    assert "templates" not in fc  # removed by __marshal_form_classification
    assert all(not k.startswith("_") for k in fc)  # no private attrs
    # questions are omitted because shallow=True for 'form'
    assert "questions" not in f
    # ensure no private attrs on form
    assert "_private" not in f


def test_workflow_instance_step_marshal_handles_no_form_and_no_condition():
    """
    When a step has no form and no condition:
      - 'form' MUST be present and set to None (as per __marshal_workflow_instance_step),
      - 'condition' MUST be omitted entirely,
      - None-valued scalars are stripped,
      - regular fields are preserved.
    """
    wis = WorkflowInstanceStepOrm()
    wis.id = "wis-202"
    wis.name = "Review labs"
    wis.description = "Check CBC and LFTs"
    wis.start_date = 1_700_000_000
    wis.triggered_by = None
    wis.last_edited = 1_700_000_001
    wis.expected_completion = None
    wis.completion_date = None
    wis.status = "Active"
    wis.data = None
    wis.workflow_instance_id = "wi-002"
    wis.assigned_to = None
    wis._temp = "nope"

    wis.form_id = None
    wis.form = None

    wis.condition_id = None
    wis.condition = None

    out = m.marshal(wis)

    # Regular kept fields
    assert out["id"] == "wis-202"
    assert out["name"] == "Review labs"
    assert out["description"] == "Check CBC and LFTs"
    assert out["start_date"] == 1_700_000_000
    assert out["last_edited"] == 1_700_000_001
    assert out["status"] == "Active"
    assert out["workflow_instance_id"] == "wi-002"

    # Explicit behavior for absent relations
    assert "condition" not in out  # not added at all
    assert "condition_id" not in out  # None stripped by pre_process
    assert "form_id" not in out  # None stripped by pre_process
    assert "form" in out and out["form"] is None  # explicitly set by marshaller

    # Stripped scalars and private attrs
    for k in (
        "triggered_by",
        "expected_completion",
        "completion_date",
        "data",
        "assigned_to",
        "_temp",
    ):
        assert k not in out
