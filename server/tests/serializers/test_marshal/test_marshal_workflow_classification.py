# ruff: noqa: SLF001
import data.marshal as m
from models import (
    FormClassificationOrm,
    FormTemplateOrm,
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
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

    foem_template = FormTemplateOrm()
    foem_template.id = template_id
    foem_template.name = "ANC Intake"
    foem_template.description = "Initial antenatal visit"
    foem_template.classification = form_classification
    foem_template.questions = []
    foem_template._cache = {"ignore": True}
    return foem_template


def _make_workflow_template_step(
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
    workflow_tem_step = WorkflowTemplateStepOrm()
    workflow_tem_step.id = step_id
    workflow_tem_step.name = f"Step {step_id}"
    workflow_tem_step.description = "Collect vitals"
    workflow_tem_step.expected_completion = 3600
    workflow_tem_step.last_edited = 1_700_000_000
    workflow_tem_step.workflow_template_id = template_id
    workflow_tem_step._scratch = "strip-me"

    workflow_tem_step.form_id = form_template_id
    workflow_tem_step.form = _make_form_template(form_template_id, form_fc_id)

    workflow_tem_step.condition_id = None
    workflow_tem_step.condition = None
    workflow_tem_step.branches = []
    return workflow_tem_step


def _make_workflow_template(
    wt_id: str,
    classification: WorkflowClassificationOrm,
    *,
    with_one_step: bool,
) -> WorkflowTemplateOrm:
    """
    Construct a minimal WorkflowTemplateOrm instance with the given parameters.

    :param wt_id: ID of the WorkflowTemplateOrm to create.
    :param classification: WorkflowClassificationOrm associated with the workflow template.
    :param with_one_step: If True, create a single WorkflowTemplateStepOrm within the workflow template.
    :return: Minimal WorkflowTemplateOrm instance with the given parameters.
    """
    workflow_template = WorkflowTemplateOrm()
    workflow_template.id = wt_id
    workflow_template.name = f"Template {wt_id}"
    workflow_template.description = "Routine antenatal care"
    workflow_template.archived = False
    workflow_template.date_created = 1_690_000_000
    workflow_template.last_edited = 1_700_000_000
    workflow_template.version = "v1"
    workflow_template.starting_step_id = "start-1"
    workflow_template._private = "strip-me"

    workflow_template.classification = classification
    workflow_template.classification_id = classification.id

    if with_one_step:
        step = _make_workflow_template_step(
            step_id=f"wts-{wt_id}-1",
            template_id=workflow_template.id,
            form_template_id=f"ft-{wt_id}-1",
            form_fc_id=f"fc-{wt_id}-1",
        )
        workflow_template.steps = [step]
    else:
        workflow_template.steps = []

    return workflow_template


def test_workflow_classification_marshal_basic_omits_backrefs_and_privates():
    """
    Basic marshal of WorkflowClassificationOrm should:
      - include scalar fields 'id', 'name', and 'collection_id' when set,
      - strip private attrs,
      - not include relationship collections by default.
    """
    workflow_classification = WorkflowClassificationOrm()
    workflow_classification.id = "wc-1"
    workflow_classification.name = "Antenatal"
    workflow_classification.collection_id = "coll-1"
    workflow_classification._secret = "nope"

    marshalled = m.marshal(workflow_classification)

    assert marshalled["id"] == "wc-1"
    assert marshalled["name"] == "Antenatal"
    assert marshalled["collection_id"] == "coll-1"
    assert "_secret" not in marshalled
    assert "workflow_templates" not in marshalled
    assert "collection" not in marshalled


def test_workflow_classification_marshal_includes_templates_with_shallow():
    """
    marshal(wc, if_include_versions=True, shallow=True) should:
      - include 'workflow_templates' (list) built from wc.templates,
      - embed each template with its own 'classification',
      - omit 'steps' (shallow=True),
      - strip private attrs at all levels.
    """
    workflow_classification = WorkflowClassificationOrm()
    workflow_classification.id = "wc-2"
    workflow_classification.name = "Postnatal"

    # Two templates, one without
    wt1 = _make_workflow_template("wt-A", workflow_classification, with_one_step=True)
    wt2 = _make_workflow_template("wt-B", workflow_classification, with_one_step=False)

    workflow_classification.workflow_templates = [wt1, wt2]
    workflow_classification.templates = [wt1, wt2]

    marshalled = m.marshal(
        workflow_classification, shallow=True, if_include_versions=True
    )

    # Top-level checks
    assert marshalled["id"] == "wc-2"
    assert marshalled["name"] == "Postnatal"
    assert "collection_id" not in marshalled
    assert "workflow_templates" in marshalled and isinstance(
        marshalled["workflow_templates"], list
    )
    assert {t["id"] for t in marshalled["workflow_templates"]} == {"wt-A", "wt-B"}

    # Template A (steps omitted due to shallow=True)
    tA = next(t for t in marshalled["workflow_templates"] if t["id"] == "wt-A")
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

    # Embedded classification should not leak backrefs/private
    assert tA["classification"]["id"] == workflow_classification.id
    assert "workflow_templates" not in tA["classification"]

    tB = next(t for t in marshalled["workflow_templates"] if t["id"] == "wt-B")
    assert "steps" not in tB
    assert tB["classification"]["id"] == workflow_classification.id
