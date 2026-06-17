from __future__ import annotations

import json

from data import orm_serializer
from models import (
    FormAnswerOrmV2,
    FormSubmissionOrmV2,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
)
from tests.helpers import (
    make_answer_v2,
    make_form_submission_v2,
    make_workflow_instance,
    make_workflow_instance_step,
)


def test_unmarshal_workflow_instance_with_steps_mixed_form():
    """
    Tests that unmarshaling a WorkflowInstance payload with steps containing a
    nested form and another step with no form correctly attaches the nested form
    and its questions, and the other step without form.
    """
    # --- Question payload (wire shape, not ORM) ---
    answer_payload = make_answer_v2(
        id="q-1",
        question_id="q-1",
        form_submission_id="form-1",
        answer={"mc_id_array": [0]},
    )

    # --- Form payload with the question attached ---
    form_payload = make_form_submission_v2(
        id="form-1",
        patient_id="p-1",
        answers=[answer_payload],
    )

    # --- First step: with nested form ---
    step_with_form = make_workflow_instance_step(
        id="wis-1",
        name="Intake",
        description="Collect vitals",
        workflow_instance_id="wi-1",
        form_id="form-1",
        form=form_payload,
        data='{"note":"fasting"}',
        assigned_to=77,
    )

    # --- Second step: no form attached ---
    step_no_form = make_workflow_instance_step(
        id="wis-2",
        name="Counseling",
        description="Diet advice",
        workflow_instance_id="wi-1",
        form_id=None,
        form=None,
        data='{"note":"advise hydration"}',
        assigned_to=88,
    )

    # --- Workflow instance payload with both steps ---
    payload = make_workflow_instance(
        id="wi-1",
        name="ANC Visit 1",
        description="First antenatal care flow",
        current_step_id="wis-1",
        workflow_template_id="wt-1",
        patient_id="p-1",
        steps=[step_with_form, step_no_form],
    )

    obj = orm_serializer.unmarshal(WorkflowInstanceOrm, payload)

    assert isinstance(obj, WorkflowInstanceOrm)
    assert obj.id == "wi-1"
    assert obj.name == "ANC Visit 1"
    assert obj.current_step_id == "wis-1"
    assert isinstance(obj.steps, list) and len(obj.steps) == 2

    s1, s2 = obj.steps
    assert isinstance(s1, WorkflowInstanceStepOrm)
    assert isinstance(s2, WorkflowInstanceStepOrm)

    assert s1.id == "wis-1"
    assert isinstance(s1.form, FormSubmissionOrmV2)
    assert s1.form.id == "form-1"
    assert isinstance(s1.form.answers, list) and len(s1.form.answers) == 1

    q = s1.form.answers[0]
    assert isinstance(q, FormAnswerOrmV2)

    assert isinstance(q.answer, str)
    assert json.loads(q.answer) == {"mc_id_array": [0]}

    assert s2.id == "wis-2"
    assert s2.form is None


def test_unmarshal_workflow_instance_minimal_no_steps():
    """
    Tests that unmarshaling a WorkflowInstanceOrm with no steps
    forwards the payload as-is to WorkflowInstanceOrm.load(), and that an empty list
    is attached to the returned object.
    """
    payload = make_workflow_instance(
        id="wi-2",
        name="Simple Instance",
        description="No steps here",
        workflow_template_id="wt-9",
        patient_id="p-9",
    )
    payload.pop("steps", None)

    obj = orm_serializer.unmarshal(WorkflowInstanceOrm, payload)

    assert isinstance(obj, WorkflowInstanceOrm)
    assert obj.id == "wi-2"
    assert obj.name == "Simple Instance"
    assert isinstance(obj.steps, list)
    assert obj.steps == []


def test_unmarshal_workflow_instance_steps_explicit_empty_list():
    """
    Tests that unmarshaling a WorkflowInstanceOrm with an explicit empty list of steps
    forwards the payload as-is to WorkflowInstanceOrm.load(), and that no nested
    loads occur.
    """
    payload = make_workflow_instance(
        id="wi-3",
        name="Instance With Empty Steps",
        description="Steps explicitly empty",
        workflow_template_id="wt-10",
        patient_id="p-10",
        steps=[],
    )

    obj = orm_serializer.unmarshal(WorkflowInstanceOrm, payload)

    assert isinstance(obj, WorkflowInstanceOrm)
    assert obj.id == "wi-3"
    assert isinstance(obj.steps, list)
    assert obj.steps == []
