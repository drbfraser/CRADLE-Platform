# ruff: noqa: SLF001
import data.marshal as m
from models import (
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    FormOrm,
    FormClassificationOrm,
    RuleGroupOrm,
)

def _make_min_form(form_id: str, fc_id: str, fc_name: str = "Clinical") -> FormOrm:
    """
    Minimal but realistic FormOrm that __marshal_form(..., shallow=True) can serialize.
    Includes a FormClassification and an empty questions list.
    """
    f = FormOrm()
    f.id = form_id
    f.name = "ANC Intake"
    f.description = "Initial antenatal visit"
    f._private = "nope"  # should be stripped

    fc = FormClassificationOrm()
    fc.id = fc_id
    fc.name = fc_name
    #  __marshal_form_classification must removes it.
    fc.templates = []
    fc._tmp = "nope"
    f.classification = fc

    # Present but should be omitted because form is marshaled shallowly.
    f.questions = []
    return f


def _make_condition(rg_id: str) -> RuleGroupOrm:
    """A minimal valid RuleGroup for embedding into step.condition."""
    rg = RuleGroupOrm()
    rg.id = rg_id
    rg.rule = {"any": []}
    rg.data_sources = [{"type": "patient"}]
    rg._scratch = "nope"
    return rg


def test_workflow_instance_marshal_full_includes_steps_and_cleans_nested():
    """
    __marshal_workflow_instance (shallow=False) should:
      - copy non-None scalars at the instance level,
      - strip None-valued fields and private attrs,
      - include 'steps' with each step marshaled via __marshal_workflow_instance_step,
      - step.form must be shallow-marshaled (classification present, questions omitted),
      - step.condition must be marshaled, private attrs stripped,
      - nested objects must not leak private attributes.
    """
    wi = WorkflowInstanceOrm()
    wi.id = "wi-001"
    wi.name = "Antenatal Care"
    wi.description = "ANC workflow for patient"
    wi.start_date = 1_690_000_000
    wi.current_step_id = "wis-101"
    wi.last_edited = 1_690_000_050
    wi.completion_date = None            
    wi.status = "Active"
    wi.workflow_template_id = "wt-001"    
    wi.patient_id = "p-123"              
    wi._secret = "nope"                 

    # Step 1 (has form + condition)
    s1 = WorkflowInstanceStepOrm()
    s1.id = "wis-101"
    s1.name = "Collect vitals"
    s1.description = "Measure BP, HR, Temp"
    s1.start_date = 1_690_000_100
    s1.last_edited = 1_690_000_110
    s1.status = "Active"
    s1.data = '{"note":"patient anxious"}'       
    s1.workflow_instance_id = wi.id             
    s1.form_id = "f-10"
    s1.form = _make_min_form("f-10", "fc-1")
    s1.condition_id = "rg-1"
    s1.condition = _make_condition("rg-1")
    s1._debug = "nope"                            

    # Step 2 (no form, no condition; many Nones should be stripped)
    s2 = WorkflowInstanceStepOrm()
    s2.id = "wis-102"
    s2.name = "Finalize"
    s2.description = "Mark workflow complete"
    s2.start_date = 1_690_000_200
    s2.last_edited = 1_690_000_210
    s2.status = "Active"
    s2.data = None
    s2.workflow_instance_id = wi.id
    s2.form_id = None
    s2.form = None
    s2.condition_id = None
    s2.condition = None

    wi.steps = [s1, s2]

    out = m.marshal(wi)

    # --- top-level checks
    assert out["id"] == "wi-001"
    assert out["name"] == "Antenatal Care"
    assert out["description"] == "ANC workflow for patient"
    assert out["start_date"] == 1_690_000_000
    assert out["current_step_id"] == "wis-101"
    assert out["last_edited"] == 1_690_000_050
    assert out["status"] == "Active"
    assert out["workflow_template_id"] == "wt-001"
    assert out["patient_id"] == "p-123"
    # stripped from instance
    assert "completion_date" not in out
    assert "_secret" not in out

    # --- steps included and well-formed
    assert "steps" in out and isinstance(out["steps"], list) and len(out["steps"]) == 2

    stepA = next(s for s in out["steps"] if s["id"] == "wis-101")
    stepB = next(s for s in out["steps"] if s["id"] == "wis-102")

    # Step A: has form & condition
    for k in ("id", "name", "description", "start_date", "last_edited", "status", "workflow_instance_id"):
        assert k in stepA
    assert stepA["workflow_instance_id"] == "wi-001"
    assert stepA["data"] == '{"note":"patient anxious"}'
    # stripped at step level
    assert "_debug" not in stepA
    assert "expected_completion" not in stepA
    assert "completion_date" not in stepA

    # Form is shallow-marshaled
    assert "form" in stepA and isinstance(stepA["form"], dict)
    f = stepA["form"]
    assert f["id"] == "f-10"
    assert f["name"] == "ANC Intake"
    assert f["description"] == "Initial antenatal visit"
    assert "questions" not in f  # shallow=True in __marshal_workflow_instance_step
    assert "_private" not in f
    assert "classification" in f and isinstance(f["classification"], dict)
    fc = f["classification"]
    assert fc["id"] == "fc-1" and fc["name"] == "Clinical"
    assert "templates" not in fc            # scrubbed by __marshal_form_classification
    assert all(not k.startswith("_") for k in fc)

    # Condition is present and cleaned
    assert "condition" in stepA and isinstance(stepA["condition"], dict)
    c = stepA["condition"]
    assert c["id"] == "rg-1"
    assert c["rule"] == {"any": []}
    assert c["data_sources"] == [{"type": "patient"}]
    assert all(not k.startswith("_") for k in c)

    # Step B: no form/condition; explicit None for form, condition omitted
    assert "form" in stepB and stepB["form"] is None
    assert "condition" not in stepB
    assert "form_id" not in stepB
    assert "condition_id" not in stepB
    assert "data" not in stepB


def test_workflow_instance_marshal_shallow_omits_steps_and_strips_none():
    """
    With shallow=True:
      - 'steps' should be omitted,
      - instance-level Nones and private attrs should be stripped,
      - regular scalars kept.
    NOTE: If this test fails because 'steps' appears, consider adding the same
    shallow-guard used elsewhere (e.g., workflow template) to drop 'steps' when shallow.
    """
    wi = WorkflowInstanceOrm()
    wi.id = "wi-010"
    wi.name = "Postnatal Care"
    wi.description = "PNC workflow for patient"
    wi.start_date = 1_700_000_000
    wi.current_step_id = None          
    wi.last_edited = 1_700_000_050
    wi.completion_date = None      
    wi.status = "Active"
    wi.workflow_template_id = "wt-009"
    wi.patient_id = "p-999"
    wi._scratch = "nope"

    # Prepare a couple of steps but they should be omitted in shallow mode
    s = WorkflowInstanceStepOrm()
    s.id = "wis-X"
    s.name = "Dummy"
    s.description = "Ignored in shallow"
    s.start_date = 1_700_000_100
    s.last_edited = 1_700_000_110
    s.status = "Active"
    s.workflow_instance_id = wi.id
    wi.steps = [s]

    out = m.marshal(wi, shallow=True)

    # kept
    assert out["id"] == "wi-010"
    assert out["name"] == "Postnatal Care"
    assert out["description"] == "PNC workflow for patient"
    assert out["start_date"] == 1_700_000_000
    assert out["last_edited"] == 1_700_000_050
    assert out["status"] == "Active"
    assert out["workflow_template_id"] == "wt-009"
    assert out["patient_id"] == "p-999"

    # stripped at instance level
    assert "completion_date" not in out
    assert "current_step_id" not in out
    assert "_scratch" not in out

    # shallow => steps omitted
    assert "steps" not in out
