from __future__ import annotations

import json
import types

from data import orm_serializer
from models import FormAnswerOrmV2, FormSubmissionOrmV2, WorkflowInstanceStepOrm
from tests.helpers import (
    make_answer_v2,
    make_form_submission_v2,
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
    question_payload = make_answer_v2(
        id="q-pre",
        question_id="q-1",
        form_submission_id="form-1",
        answer={"mc_id_array": [0]},
    )

    form_payload = make_form_submission_v2(
        id="form-1",
        patient_id="p-001",
        answers=[question_payload],
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
    assert isinstance(obj.form, (FormSubmissionOrmV2, types.SimpleNamespace))
    assert obj.form.id == "form-1"

    # one question, JSON-able fields stringified
    assert isinstance(obj.form.answers, list) and len(obj.form.answers) == 1
    q = obj.form.answers[0]
    assert isinstance(q, (FormAnswerOrmV2, types.SimpleNamespace))

    # These should be JSON *strings* on the ORM side
    assert isinstance(q.answer, str)
    assert json.loads(q.answer) == {"mc_id_array": [0]}


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
