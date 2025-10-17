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
    """
    Construct a minimal FormTemplateOrm instance with the given parameters.

    :param template_id: ID of the FormTemplateOrm to create.
    :param classification_id: ID of the FormClassificationOrm associated with the form template.
    :return: Minimal FormTemplateOrm instance with the given parameters.
    """
    form_classification = FormClassificationOrm()
    form_classification.id = classification_id
    form_classification.name = "Clinical"

    form = FormTemplateOrm()
    form.id = template_id
    form.name = "ANC Intake"
    form.description = "Initial antenatal visit"
    form.classification = form_classification
    form.questions = []  # important: function sorts/questions even if empty
    return form


def _make_condition(rule_group_id: str, rule=None, data_sources=None) -> RuleGroupOrm:
    """
    Construct a minimal RuleGroupOrm instance with the given parameters.

    :param rule_group_id: ID of the RuleGroupOrm to create.
    :param rule: JSON-serializable rule associated with the rule group.
    :param data_sources: List of data sources associated with the rule group.
    :return: Minimal RuleGroupOrm instance with the given parameters.
    """
    rule_group = RuleGroupOrm()
    rule_group.id = rule_group_id
    rule_group.rule = {"all": []} if rule is None else rule
    rule_group.data_sources = [] if data_sources is None else data_sources
    return rule_group


def test_workflow_template_step_marshal_full_includes_form_condition_and_branches():
    """
    __marshal_workflow_template_step should:
      - keep scalar fields that are not None,
      - embed a marshaled 'form' (with classification, questions=[]),
      - embed a marshaled 'condition' (preserving JSON fields),
      - include marshaled 'branches' (each may embed its own condition),
      - not leak private attributes from any object.
    """
    workflow_step = WorkflowTemplateStepOrm()
    workflow_step.id = "wts-101"
    workflow_step.name = "Collect vitals"
    workflow_step.description = "Measure BP, HR, Temp"
    workflow_step.expected_completion = 2 * 60 * 60  # seconds
    workflow_step.last_edited = 1_700_000_000
    workflow_step.workflow_template_id = "wt-001"

    # Attach form and condition
    workflow_step.form_id = "ft-10"
    workflow_step.form = _make_min_form_template(workflow_step.form_id, "fc-1")

    workflow_step.condition_id = "rg-200"
    workflow_step.condition = _make_condition(workflow_step.condition_id)

    # Two real ORM branches
    b1 = WorkflowTemplateStepBranchOrm()
    b1.id = "br-001"
    b1.step_id = workflow_step.id
    b1.target_step_id = "wts-200"
    b1.condition_id = "rg-201"
    b1.condition = _make_condition("rg-201")

    b2 = WorkflowTemplateStepBranchOrm()
    b2.id = "br-002"
    b2.step_id = workflow_step.id
    b2.target_step_id = "wts-999"

    # Appending mapped instances is allowed and sets the backref .step
    workflow_step.branches = [b1, b2]

    marshalled = m.marshal(workflow_step, shallow=False)

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
        assert key in marshalled
    assert marshalled["id"] == "wts-101"
    assert marshalled["name"] == "Collect vitals"
    assert marshalled["description"] == "Measure BP, HR, Temp"
    assert marshalled["last_edited"] == 1_700_000_000
    assert marshalled["workflow_template_id"] == "wt-001"
    assert marshalled["expected_completion"] == 2 * 60 * 60
    assert "_scratch" not in marshalled  # private stripped

    # Form embedding
    form = marshalled["form"]
    for key in ("id", "name", "description", "classification", "questions"):
        assert key in form
    assert form["id"] == "ft-10"
    assert form["questions"] == []  # preserved
    assert isinstance(form["classification"], dict)
    assert form["classification"]["id"] == "fc-1"

    # Branches
    branches = marshalled["branches"]
    assert isinstance(branches, list) and len(branches) == 2

    # br-001 with its own condition
    b1_marshalled = next(b for b in branches if b["id"] == "br-001")
    for key in ("id", "step_id", "target_step_id"):
        assert key in b1_marshalled
    assert b1_marshalled["step_id"] == "wts-101"
    assert b1_marshalled["target_step_id"] == "wts-200"
    assert "condition" in b1_marshalled and isinstance(b1_marshalled["condition"], dict)
    assert b1_marshalled["condition"]["id"] == "rg-201"
    # We intentionally do NOT assert that extra relationship keys (like 'step') are absent.

    # br-002 without condition
    b2_marshalled = next(b for b in branches if b["id"] == "br-002")
    assert b2_marshalled["target_step_id"] == "wts-999"
    # condition_id was None -> __pre_process strips None
    assert "condition" not in b2_marshalled
    assert "condition_id" not in b2_marshalled or b2_marshalled["condition_id"] is None


def test_workflow_template_step_marshal_shallow_tolerates_existing_branches_attr():
    """
    With shallow=True:
      - function does not *add* 'branches', but vars(wts) may already include
        a 'branches' attribute from SQLAlchemy; we allow either absence or [].
      - 'form' is still embedded,
      - 'condition' omitted when None,
      - None-valued fields (e.g., expected_completion) stripped.
    """
    workflow_step = WorkflowTemplateStepOrm()
    workflow_step.id = "wts-202"
    workflow_step.name = "Review labs"
    workflow_step.description = "Check CBC and LFTs"
    workflow_step.expected_completion = None  # should be stripped
    workflow_step.last_edited = 1_800_000_000
    workflow_step.workflow_template_id = "wt-002"

    workflow_step.form_id = "ft-22"
    workflow_step.form = _make_min_form_template(workflow_step.form_id, "fc-2")

    workflow_step.condition_id = None
    workflow_step.condition = None

    workflow_step.branches = []

    marshalled = m.marshal(workflow_step, shallow=True)

    if "branches" in marshalled:
        assert marshalled["branches"] == []
    else:
        assert "branches" not in marshalled

    # 'form' present and embedded
    assert "form" in marshalled and isinstance(marshalled["form"], dict)

    # 'condition' omitted because None; condition_id removed as None
    assert "condition" not in marshalled
    assert "condition_id" not in marshalled

    # None-valued scalar stripped
    assert "expected_completion" not in marshalled

    # core fields present
    for key in ("id", "name", "description", "last_edited", "workflow_template_id"):
        assert key in marshalled
