from __future__ import annotations

import json
import types

from data import orm_serializer
from models import FormOrm, QuestionLangVersionOrm, QuestionOrm, WorkflowInstanceStepOrm
from tests.helpers import (
    make_form,
    make_question,
    make_question_lang_version,
    make_workflow_instance_step,
)


def test_unmarshal_workflow_instance_step_with_form_and_questions():
    """
    Tests that unmarshaling a WorkflowInstanceStepOrm with a form and its questions
    successfully reconstructs the object structure.

    Ensures that the unmarshaled form has a single question with visible_condition,
    answers, and mc_options fields stringified as JSON. Also checks that the
    question's lang version has mc_options stringified as JSON.

    Finally, verifies that the original payload is not modified.
    """
    question_payload = make_question(
        id="q-pre",
        question_index=1,
        question_text="Dizziness severity?",
        question_type="MULTIPLE_CHOICE",
        visible_condition={"op": "eq", "left": "age", "right": 18},
        mc_options=[
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"},
        ],
        answers={"default": "no"},
        lang_versions=[
            make_question_lang_version(
                lang="en",
                question_text="Dizziness severity? (en)",
                mc_options=[
                    {"label": "Yes", "value": "yes"},
                    {"label": "No", "value": "no"},
                ],
            )
        ],
    )

    form_payload = make_form(
        id="form-1",
        patient_id="p-001",
        questions=[question_payload],
    )

    payload = make_workflow_instance_step(
        id="wis-1",
        name="Intake",
        description="Collect initial data",
        workflow_instance_id="wi-1",
        form_id="form-1",
        form=form_payload,
    )

    obj = orm_serializer.unmarshal(WorkflowInstanceStepOrm, payload)

    # object structure
    assert isinstance(obj, (WorkflowInstanceStepOrm, types.SimpleNamespace))
    assert obj.id == "wis-1"
    assert obj.name == "Intake"
    assert obj.description == "Collect initial data"
    assert obj.workflow_instance_id == "wi-1"

    # nested form
    assert isinstance(obj.form, (FormOrm, types.SimpleNamespace))
    assert obj.form.id == "form-1"

    # one question, JSON-able fields stringified
    assert isinstance(obj.form.questions, list) and len(obj.form.questions) == 1
    q = obj.form.questions[0]
    assert isinstance(q, (QuestionOrm, types.SimpleNamespace))

    # These should be JSON *strings* on the ORM side
    assert isinstance(q.visible_condition, str)
    assert isinstance(q.answers, str)
    assert isinstance(q.mc_options, str)

    assert json.loads(q.visible_condition) == {
        "op": "eq",
        "left": "age",
        "right": 18,
    }
    assert json.loads(q.answers) == {"default": "no"}
    assert json.loads(q.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]

    # lang version present; mc_options stringified
    assert isinstance(q.lang_versions, list) and len(q.lang_versions) == 1
    qv = q.lang_versions[0]
    assert isinstance(qv, (QuestionLangVersionOrm, types.SimpleNamespace))
    assert qv.lang == "en"
    assert isinstance(qv.mc_options, str)
    assert json.loads(qv.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]


def test_unmarshal_workflow_instance_step_minimal_no_form():
    """
    Tests that unmarshaling a WorkflowInstanceStepOrm with no form results in the correct object structure and no nested loads.
    Verifies that the unmarshalled object has form=None and no nested form loads occur.
    """
    payload = make_workflow_instance_step(
        id="wis-2",
        name="Follow-up",
        description="Schedule a follow-up appointment",
        workflow_instance_id="wi-99",
        form_id=None,
    )
    original = dict(payload)

    obj = orm_serializer.unmarshal(WorkflowInstanceStepOrm, payload)

    assert isinstance(obj, (WorkflowInstanceStepOrm, types.SimpleNamespace))
    assert obj.id == "wis-2"
    assert obj.name == "Follow-up"
    assert obj.form is None

    assert payload == original
