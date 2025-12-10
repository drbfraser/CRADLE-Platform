from __future__ import annotations

import json

from data import orm_serializer
from models import (
    FormOrm,
    QuestionLangVersionOrm,
    QuestionOrm,
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
)
from tests.helpers import (
    make_form,
    make_question,
    make_question_lang_version,
    make_workflow_instance,
    make_workflow_instance_step,
)


def test_unmarshal_workflow_instance_with_steps_mixed_form():
    """
    Tests that unmarshaling a WorkflowInstance payload with steps containing a
    nested form and another step with no form correctly attaches the nested form
    and its questions, and the other step without form.
    """
    q_lang = make_question_lang_version(
        question_id="q-1",
        lang="en",
        question_text="Do you have any symptoms?",
        mc_options=[
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"},
        ],
    )

    # --- Question payload (wire shape, not ORM) ---
    question_payload = make_question(
        id="q-1",
        question_index=0,
        question_text="Do you have any symptoms?",
        question_type="MULTIPLE_CHOICE",
        visible_condition={"op": "eq", "left": "age", "right": 18},
        mc_options=[
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"},
        ],
        answers={"default": "no"},
        lang_versions=[q_lang],
    )

    # --- Form payload with the question attached ---
    form_payload = make_form(
        id="form-1",
        name="ANC Intake",
        patient_id="p-1",
        lang="en",
        questions=[question_payload],
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
    assert isinstance(s1.form, FormOrm)
    assert s1.form.id == "form-1"
    assert isinstance(s1.form.questions, list) and len(s1.form.questions) == 1

    q = s1.form.questions[0]
    assert isinstance(q, QuestionOrm)

    assert isinstance(q.visible_condition, str)
    assert json.loads(q.visible_condition) == {"op": "eq", "left": "age", "right": 18}

    assert isinstance(q.answers, str)
    assert json.loads(q.answers) == {"default": "no"}

    assert isinstance(q.mc_options, str)
    assert json.loads(q.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]

    assert isinstance(q.lang_versions, list)
    assert len(q.lang_versions) == 1
    qv = q.lang_versions[0]
    assert isinstance(qv, QuestionLangVersionOrm)
    assert qv.lang == "en"
    assert isinstance(qv.mc_options, str)
    assert json.loads(qv.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]

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
