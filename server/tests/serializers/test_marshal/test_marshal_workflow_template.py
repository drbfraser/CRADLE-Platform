# ruff: noqa: SLF001
import data.orm_serializer as orm_seralizer
from models import (
    FormClassificationOrm,
    FormTemplateOrm,
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
)


def _make_form_template(template_id: str, fc_id: str) -> FormTemplateOrm:
    """
    Construct a minimal FormTemplateOrm instance with the given parameters.

    :param template_id: ID of the FormTemplateOrm to create.
    :param fc_id: ID of the FormClassificationOrm associated with the form template.
    :return: Minimal FormTemplateOrm instance with the given parameters.
    """
    form_classification = FormClassificationOrm()
    form_classification.id = fc_id
    form_classification.name = "Clinical"
    form_classification._internal = "strip-me"

    form_template = FormTemplateOrm()
    form_template.id = template_id
    form_template.name = "ANC Intake"
    form_template.description = "Initial antenatal visit"
    form_template.classification = form_classification
    form_template.questions = []
    form_template._cache = {"ignore": True}
    return form_template


def _make_step(
    step_id: str, template_id: str, form_template_id: str, form_fc_id: str
) -> WorkflowTemplateStepOrm:
    """
    Construct a minimal WorkflowTemplateStepOrm instance with the given parameters.

    :param step_id: ID of the WorkflowTemplateStepOrm to create.
    :param template_id: ID of the WorkflowTemplateOrm associated with the step.
    :param form_template_id: ID of the FormTemplateOrm associated with the step.
    :param form_fc_id: ID of the FormClassificationOrm associated with the form template.
    :return: Minimal WorkflowTemplateStepOrm instance with the given parameters.
    """
    workflow_step = WorkflowTemplateStepOrm()
    workflow_step.id = step_id
    workflow_step.name = f"Step {step_id}"
    workflow_step.description = f"Description for {step_id}"
    workflow_step.expected_completion = 3600
    workflow_step.last_edited = 1_700_000_000
    workflow_step.workflow_template_id = template_id
    workflow_step._scratch = "strip-me"

    workflow_step.form_id = form_template_id
    workflow_step.form = _make_form_template(form_template_id, form_fc_id)

    workflow_step_branch_1 = WorkflowTemplateStepBranchOrm()
    workflow_step_branch_1.id = f"br-{step_id}-1"
    workflow_step_branch_1.step_id = workflow_step.id
    workflow_step_branch_1.target_step_id = "next-1"

    workflow_step_branch_2 = WorkflowTemplateStepBranchOrm()
    workflow_step_branch_2.id = f"br-{step_id}-2"
    workflow_step_branch_2.step_id = workflow_step.id
    workflow_step_branch_2.target_step_id = "next-2"
    workflow_step_branch_2.condition_id = None
    workflow_step_branch_2.condition = None

    workflow_step.branches = [workflow_step_branch_1, workflow_step_branch_2]
    return workflow_step


def test_workflow_template_marshal_full_embeds_classification_steps():
    """
    __marshal_workflow_template (shallow=False) should:
      - keep scalar fields and omit private ones,
      - embed a marshaled 'classification' (without leaking private/relationship junk),
      - include 'steps' where each step embeds its 'form', optional 'condition', and 'branches',
      - respect None-stripping throughout the tree.
    """
    workflow_template = WorkflowTemplateOrm()
    workflow_template.id = "wt-001"
    workflow_template.name = "ANC Workflow"
    workflow_template.description = "Routine antenatal care"
    workflow_template.archived = False
    workflow_template.date_created = 1_690_000_000
    workflow_template.last_edited = 1_700_000_000
    workflow_template.version = "v1"
    workflow_template.starting_step_id = "wts-1"
    workflow_template._private = "strip-me"

    # template classification
    wc = WorkflowClassificationOrm()
    wc.id = "wc-1"
    wc.name = "Antenatal"
    wc._hidden = "strip-me"
    workflow_template.classification_id = wc.id
    workflow_template.classification = wc

    # steps
    s1 = _make_step(
        "wts-1",
        workflow_template.id,
        form_template_id="ft-1",
        form_fc_id="fc-1",
    )
    s2 = _make_step(
        "wts-2",
        workflow_template.id,
        form_template_id="ft-2",
        form_fc_id="fc-2",
    )
    workflow_template.steps = [s1, s2]

    marshalled = orm_seralizer.marshal(workflow_template, shallow=False)

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
        assert key in marshalled
    assert marshalled["id"] == workflow_template.id
    assert marshalled["name"] == "Antenatal"
    assert marshalled["archived"] is False
    assert marshalled["date_created"] == 1_690_000_000
    assert marshalled["version"] == "v1"
    assert marshalled["starting_step_id"] == "wts-1"
    assert "_private" not in marshalled  # private stripped

    # classification embedded
    assert "classification" in marshalled and isinstance(
        marshalled["classification"], dict
    )
    assert marshalled["classification"]["id"] == "wc-1"
    assert marshalled["classification"]["name"] == "Antenatal"
    assert "_hidden" not in marshalled["classification"]

    # steps present and sorted order is not guaranteed by __marshal_workflow_template,
    # so we just index by id
    steps = {s["id"]: s for s in marshalled["steps"]}
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
    workflow_template = WorkflowTemplateOrm()
    workflow_template.id = "wt-002"
    workflow_template.name = "Postnatal Workflow"
    workflow_template.description = "Postnatal follow-up"
    workflow_template.archived = True
    workflow_template.date_created = 1_700_000_001
    workflow_template.last_edited = 1_700_000_002
    workflow_template.version = "v2"
    workflow_template.starting_step_id = None  # should be stripped in shallow output
    workflow_template._private = "strip-me"

    wc = WorkflowClassificationOrm()
    wc.id = "wc-2"
    wc.name = "Postnatal"
    workflow_template.classification = wc
    workflow_template.classification_id = wc.id

    marshalled = orm_seralizer.marshal(workflow_template, shallow=True)

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
        assert k in marshalled
    assert marshalled["archived"] is True
    assert marshalled["version"] == "v2"
    assert "_private" not in marshalled

    assert "starting_step_id" not in marshalled
    assert marshalled["classification"]["id"] == "wc-2"
    assert "steps" not in marshalled
