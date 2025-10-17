# ruff: noqa: SLF001

import data.marshal as m
from models import (
    FormClassificationOrm,
    FormOrm,
    RuleGroupOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
)


def _make_min_form(form_id: str, fc_id: str, fc_name: str = "Clinical") -> FormOrm:
    """
    Construct a minimal FormOrm instance with the given parameters.

    :param form_id: ID of the FormOrm to create.
    :param fc_id: ID of the FormClassificationOrm associated with the form.
    :param fc_name: Name of the FormClassificationOrm associated with the form.
    :return: Minimal FormOrm instance with the given parameters.
    """
    form = FormOrm()
    form.id = form_id
    form.name = "ANC Intake"
    form.description = "Initial antenatal visit"
    form._private = "nope"  # should be stripped

    form_classificationc = FormClassificationOrm()
    form_classificationc.id = fc_id
    form_classificationc.name = fc_name
    #  __marshal_form_classification must removes it.

    form_classificationc.templates = []
    form_classificationc._tmp = "nope"
    form.classification = form_classificationc

    # Present but should be omitted because form is marshaled shallowly.

    form.questions = []
    return form


def _make_condition(rg_id: str) -> RuleGroupOrm:
    """
    Construct a minimal RuleGroupOrm instance with the given parameters.

    :param rg_id: ID of the RuleGroupOrm to create.
    :return: Minimal RuleGroupOrm instance with the given parameters.
    """
    rule_groupg = RuleGroupOrm()
    rule_groupg.id = rg_id
    rule_groupg.rule = {"any": []}
    rule_groupg.data_sources = [{"type": "patient"}]
    rule_groupg._scratch = "nope"
    return rule_groupg


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
    workflow_instance = WorkflowInstanceOrm()
    workflow_instance.id = "wi-001"
    workflow_instance.name = "Antenatal Care"
    workflow_instance.description = "ANC workflow for patient"
    workflow_instance.start_date = 1_690_000_000
    workflow_instance.current_step_id = "wis-101"
    workflow_instance.last_edited = 1_690_000_050
    workflow_instance.completion_date = None
    workflow_instance.status = "Active"
    workflow_instance.workflow_template_id = "wt-001"
    workflow_instance.patient_id = "p-123"
    workflow_instance._secret = "nope"

    # Step 1 (has form + condition)

    workflow_instance_1 = WorkflowInstanceStepOrm()
    workflow_instance_1.id = "wis-101"
    workflow_instance_1.name = "Collect vitals"
    workflow_instance_1.description = "Measure BP, HR, Temp"
    workflow_instance_1.start_date = 1_690_000_100
    workflow_instance_1.last_edited = 1_690_000_110
    workflow_instance_1.status = "Active"
    workflow_instance_1.data = '{"note":"patient anxious"}'
    workflow_instance_1.workflow_instance_id = workflow_instance.id
    workflow_instance_1.form_id = "f-10"
    workflow_instance_1.form = _make_min_form("f-10", "fc-1")
    workflow_instance_1.condition_id = "rg-1"
    workflow_instance_1.condition = _make_condition("rg-1")
    workflow_instance_1._debug = "nope"

    # Step 2 (no form, no condition; many Nones should be stripped)

    workflow_instance_2 = WorkflowInstanceStepOrm()
    workflow_instance_2.id = "wis-102"
    workflow_instance_2.name = "Finalize"
    workflow_instance_2.description = "Mark workflow complete"
    workflow_instance_2.start_date = 1_690_000_200
    workflow_instance_2.last_edited = 1_690_000_210
    workflow_instance_2.status = "Active"
    workflow_instance_2.data = None
    workflow_instance_2.workflow_instance_id = workflow_instance.id
    workflow_instance_2.form_id = None
    workflow_instance_2.form = None
    workflow_instance_2.condition_id = None
    workflow_instance_2.condition = None

    workflow_instance.steps = [workflow_instance_1, workflow_instance_2]

    marshalled = m.marshal(workflow_instance)

    # --- top-level checks

    assert marshalled["id"] == "wi-001"
    assert marshalled["name"] == "Antenatal Care"
    assert marshalled["description"] == "ANC workflow for patient"
    assert marshalled["start_date"] == 1_690_000_000
    assert marshalled["current_step_id"] == "wis-101"
    assert marshalled["last_edited"] == 1_690_000_050
    assert marshalled["status"] == "Active"
    assert marshalled["workflow_template_id"] == "wt-001"
    assert marshalled["patient_id"] == "p-123"
    # stripped from instance

    assert "completion_date" not in marshalled
    assert "_secret" not in marshalled

    # --- steps included and well-formed

    assert (
        "steps" in marshalled
        and isinstance(marshalled["steps"], list)
        and len(marshalled["steps"]) == 2
    )

    stepA = next(s for s in marshalled["steps"] if s["id"] == "wis-101")
    stepB = next(s for s in marshalled["steps"] if s["id"] == "wis-102")

    # Step A: has form & condition

    for k in (
        "id",
        "name",
        "description",
        "start_date",
        "last_edited",
        "status",
        "workflow_instance_id",
    ):
        assert k in stepA
    assert stepA["workflow_instance_id"] == "wi-001"
    assert stepA["data"] == '{"note":"patient anxious"}'
    # stripped at step level

    assert "_debug" not in stepA
    assert "expected_completion" not in stepA
    assert "completion_date" not in stepA

    # Form is shallow-marshaled

    assert "form" in stepA and isinstance(stepA["form"], dict)
    form = stepA["form"]
    assert form["id"] == "f-10"
    assert form["name"] == "ANC Intake"
    assert form["description"] == "Initial antenatal visit"
    assert "questions" not in form  # shallow=True in __marshal_workflow_instance_step
    assert "_private" not in form
    assert "classification" in form and isinstance(form["classification"], dict)
    fc = form["classification"]
    assert fc["id"] == "fc-1" and fc["name"] == "Clinical"
    assert "templates" not in fc  # scrubbed by __marshal_form_classification
    assert all(not k.startswith("_") for k in fc)

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
    workflow_instance = WorkflowInstanceOrm()
    workflow_instance.id = "wi-010"
    workflow_instance.name = "Postnatal Care"
    workflow_instance.description = "PNC workflow for patient"
    workflow_instance.start_date = 1_700_000_000
    workflow_instance.current_step_id = None
    workflow_instance.last_edited = 1_700_000_050
    workflow_instance.completion_date = None
    workflow_instance.status = "Active"
    workflow_instance.workflow_template_id = "wt-009"
    workflow_instance.patient_id = "p-999"
    workflow_instance._scratch = "nope"

    # Prepare a couple of steps but they should be omitted in shallow mode

    s = WorkflowInstanceStepOrm()
    s.id = "wis-X"
    s.name = "Dummy"
    s.description = "Ignored in shallow"
    s.start_date = 1_700_000_100
    s.last_edited = 1_700_000_110
    s.status = "Active"
    s.workflow_instance_id = workflow_instance.id
    workflow_instance.steps = [s]

    marshalled = m.marshal(workflow_instance, shallow=True)

    # kept

    assert marshalled["id"] == "wi-010"
    assert marshalled["name"] == "Postnatal Care"
    assert marshalled["description"] == "PNC workflow for patient"
    assert marshalled["start_date"] == 1_700_000_000
    assert marshalled["last_edited"] == 1_700_000_050
    assert marshalled["status"] == "Active"
    assert marshalled["workflow_template_id"] == "wt-009"
    assert marshalled["patient_id"] == "p-999"

    # stripped at instance level

    assert "completion_date" not in marshalled
    assert "current_step_id" not in marshalled
    assert "_scratch" not in marshalled

    # shallow => steps omitted

    assert "steps" not in marshalled
