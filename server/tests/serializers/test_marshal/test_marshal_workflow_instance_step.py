# ruff: noqa: SLF001
import data.orm_serializer as orm_seralizer
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

    form_classification = FormClassificationOrm()
    form_classification.id = fc_id
    form_classification.name = fc_name
    form_classification.templates = []  # __marshal_form_classification explicitly deletes this
    form_classification._ephemeral = "nope"
    form.classification = form_classification

    # questions exists, but __marshal_form(..., shallow=True) must drop it
    form.questions = []
    return form


def _make_condition(rg_id: str) -> RuleGroupOrm:
    """
    Minimal valid RuleGroup for marshaling into the step's 'condition'.
    """
    rule_group = RuleGroupOrm()
    rule_group.id = rg_id
    rule_group.rule = {"any": []}
    rule_group.data_sources = [{"type": "patient"}]
    rule_group._scratch = "do not leak"
    return rule_group


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
    workflow_instance_step = WorkflowInstanceStepOrm()
    workflow_instance_step.id = "wis-101"
    workflow_instance_step.name = "Collect vitals"
    workflow_instance_step.description = "Measure BP, HR, Temp"
    workflow_instance_step.start_date = 1_690_000_100
    workflow_instance_step.triggered_by = "wis-100"
    workflow_instance_step.last_edited = 1_690_000_200
    workflow_instance_step.expected_completion = None
    workflow_instance_step.completion_date = 1_690_000_300  # kept
    workflow_instance_step.status = "Active"
    workflow_instance_step.data = '{"notes":"patient anxious"}'
    workflow_instance_step.workflow_instance_id = "wi-001"
    workflow_instance_step.assigned_to = None
    workflow_instance_step._debug = "nope"

    # Attach form (shallow-marshaled)
    workflow_instance_step.form_id = "f-10"
    workflow_instance_step.form = _make_min_form(form_id="f-10", fc_id="fc-1")

    # Attach condition
    workflow_instance_step.condition_id = "rg-200"
    workflow_instance_step.condition = _make_condition("rg-200")

    marshalled = orm_seralizer.marshal(workflow_instance_step)

    # Top-level scalar fields that should be present
    assert marshalled["id"] == "wis-101"
    assert marshalled["name"] == "Collect vitals"
    assert marshalled["description"] == "Measure BP, HR, Temp"
    assert marshalled["start_date"] == 1_690_000_100
    assert marshalled["triggered_by"] == "wis-100"
    assert marshalled["last_edited"] == 1_690_000_200
    assert marshalled["completion_date"] == 1_690_000_300
    assert marshalled["status"] == "Active"
    assert marshalled["data"] == '{"notes":"patient anxious"}'
    assert marshalled["workflow_instance_id"] == "wi-001"
    # Form/condition FKs are kept when non-None
    assert marshalled["form_id"] == "f-10"
    assert marshalled["condition_id"] == "rg-200"

    # Stripped fields
    assert "expected_completion" not in marshalled
    assert "assigned_to" not in marshalled
    assert "_debug" not in marshalled

    # Embedded form (shallow=True inside __marshal_workflow_instance_step)
    assert "form" in marshalled and isinstance(marshalled["form"], dict)
    f = marshalled["form"]
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
    workflow_instance_step = WorkflowInstanceStepOrm()
    workflow_instance_step.id = "wis-202"
    workflow_instance_step.name = "Review labs"
    workflow_instance_step.description = "Check CBC and LFTs"
    workflow_instance_step.start_date = 1_700_000_000
    workflow_instance_step.triggered_by = None
    workflow_instance_step.last_edited = 1_700_000_001
    workflow_instance_step.expected_completion = None
    workflow_instance_step.completion_date = None
    workflow_instance_step.status = "Active"
    workflow_instance_step.data = None
    workflow_instance_step.workflow_instance_id = "wi-002"
    workflow_instance_step.assigned_to = None
    workflow_instance_step._temp = "nope"

    workflow_instance_step.form_id = None
    workflow_instance_step.form = None

    workflow_instance_step.condition_id = None
    workflow_instance_step.condition = None

    marshalled = orm_seralizer.marshal(workflow_instance_step)

    # Regular kept fields
    assert marshalled["id"] == "wis-202"
    assert marshalled["name"] == "Review labs"
    assert marshalled["description"] == "Check CBC and LFTs"
    assert marshalled["start_date"] == 1_700_000_000
    assert marshalled["last_edited"] == 1_700_000_001
    assert marshalled["status"] == "Active"
    assert marshalled["workflow_instance_id"] == "wi-002"

    # Explicit behavior for absent relations
    assert "condition" not in marshalled  # not added at all
    assert "condition_id" not in marshalled  # None stripped by pre_process
    assert "form_id" not in marshalled  # None stripped by pre_process
    assert (
        "form" in marshalled and marshalled["form"] is None
    )  # explicitly set by marshaller

    # Stripped scalars and private attrs
    for k in (
        "triggered_by",
        "expected_completion",
        "completion_date",
        "data",
        "assigned_to",
        "_temp",
    ):
        assert k not in marshalled
