from __future__ import annotations

from data import orm_serializer
from models import (
    FormTemplateOrm,
    RuleGroupOrm,
    WorkflowClassificationOrm,
    WorkflowTemplateOrm,
    WorkflowTemplateStepBranchOrm,
    WorkflowTemplateStepOrm,
)
from tests.helpers import (
    make_form_template,
    make_workflow_template,
    make_workflow_template_branch,
    make_workflow_template_step,
)


def test_unmarshal_workflow_template_with_steps_and_classification():
    """
    Tests that unmarshaling a WorkflowTemplateOrm with steps and classification
    deserializes to an object with the correct nested objects.
    """
    wt_id = "wt-42"
    step1_id, step2_id = "wts-100", "wts-200"

    # Branches for step 1
    branches1 = [
        make_workflow_template_branch(
            id="wtsb-1",
            step_id=step1_id,
            target_step_id=step2_id,
            condition={"id": "rg-900"},
        )
    ]

    # Step 1 with form + branch
    step1 = make_workflow_template_step(
        id=step1_id,
        description="Capture intake details",
        workflow_template_id=wt_id,
        form=make_form_template(id="ft-001"),
        branches=branches1,
        expected_completion=3_600,
        last_edited=1_700_200_001,
    )
    # Replace multilang name with ORM field
    step1.pop("name", None)
    step1["name_string_id"] = "ns-registration"

    # Step 2 without form/branches
    step2 = make_workflow_template_step(
        id=step2_id,
        description="Supervisor review",
        workflow_template_id=wt_id,
        expected_completion=7_200,
        last_edited=1_700_200_002,
    )
    step2.pop("name", None)
    step2["name_string_id"] = "ns-review"

    # Classification payload
    classification_payload = {"id": "wc-007", "name_string_id": "ns-anc"}

    # Top-level workflow template payload
    payload = make_workflow_template(
        id=wt_id,
        description="Standard ANC flow",
        version="1.0",
        archived=False,
        date_created=1_699_999_999,
        last_edited=1_700_123_456,
        starting_step_id=step1_id,
        steps=[step1, step2],
        classification=classification_payload,
    )

    obj = orm_serializer.unmarshal(WorkflowTemplateOrm, payload)

    # Top-level object
    assert isinstance(obj, WorkflowTemplateOrm)
    assert obj.id == wt_id
    assert obj.description == "Standard ANC flow"
    assert obj.version == "1.0"
    assert obj.archived is False
    assert obj.date_created == 1_699_999_999
    assert obj.last_edited == 1_700_123_456
    assert obj.starting_step_id == step1_id

    # Steps (via backref)
    assert isinstance(obj.steps, list) and len(obj.steps) == 2
    s1 = next(s for s in obj.steps if s.id == step1_id)
    s2 = next(s for s in obj.steps if s.id == step2_id)
    assert isinstance(s1, WorkflowTemplateStepOrm)
    assert isinstance(s2, WorkflowTemplateStepOrm)

    # Step1 -> form + branch + condition
    assert isinstance(s1.form, FormTemplateOrm)
    assert s1.form.id == "ft-001"
    assert isinstance(s1.branches, list) and len(s1.branches) == 1
    b1 = s1.branches[0]
    assert isinstance(b1, WorkflowTemplateStepBranchOrm)
    assert b1.step_id == step1_id
    assert b1.target_step_id == step2_id
    assert isinstance(b1.condition, RuleGroupOrm)
    assert b1.condition.id == "rg-900"

    # Step2 -> no form, no branches
    assert s2.form is None
    assert s2.branches == []

    # Classification
    assert isinstance(obj.classification, WorkflowClassificationOrm)
    assert obj.classification.id == "wc-007"
    assert obj.classification.name_string_id == "ns-anc"


def test_unmarshal_workflow_template_minimal_no_steps_no_classification():
    """
    Tests that unmarshaling a WorkflowTemplateOrm with no steps and no classification
    forwards the payload as-is to WorkflowTemplateOrm.load(), and that no nested
    loads occur.
    """
    payload = make_workflow_template(
        id="wt-2",
        description="A very small template",
        version="0.1",
        archived=True,
        date_created=1_700_000_000,
        last_edited=1_700_000_010,
    )

    payload.pop("starting_step_id", None)
    payload.pop("steps", None)

    obj = orm_serializer.unmarshal(WorkflowTemplateOrm, payload)

    assert isinstance(obj, WorkflowTemplateOrm)
    assert obj.id == "wt-2"
    assert obj.description == "A very small template"
    assert obj.version == "0.1"
    assert obj.archived is True
    assert obj.date_created == 1_700_000_000
    assert obj.last_edited == 1_700_000_010
    assert getattr(obj, "starting_step_id", None) is None

    # Defaults from unmarshaller
    assert obj.steps == []
    assert obj.classification is None


def test_unmarshal_workflow_template_strips_none_and_handles_empty_steps():
    """
    WorkflowTemplateOrm unmarshaling with starting_step_id=None and steps=[]
    should result in an object with starting_step_id=None and steps=[].
    No classification is expected.
    """
    payload = make_workflow_template(
        id="wt-3",
        description="Demonstrates stripping of None",
        version="1.2",
        archived=False,
        date_created=1_700_100_000,
        last_edited=1_700_100_500,
        starting_step_id=None,
        steps=[],
    )

    obj = orm_serializer.unmarshal(WorkflowTemplateOrm, payload)

    assert isinstance(obj, WorkflowTemplateOrm)
    assert obj.id == "wt-3"
    assert obj.steps == []
    assert obj.classification is None
