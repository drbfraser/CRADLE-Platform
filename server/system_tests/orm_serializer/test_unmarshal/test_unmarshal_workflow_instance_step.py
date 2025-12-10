from __future__ import annotations

import json
import types

from data import orm_serializer
from models import FormOrm, QuestionLangVersionOrm, QuestionOrm, WorkflowInstanceStepOrm


def _create_question(*, id: str, form_id: str, index: int = 0) -> dict:
    return {
        "id": id,
        "form_id": form_id,
        "question_index": index,
        "question_text": "Do you have any symptoms?",
        "question_type": "MULTIPLE_CHOICE",
        "visible_condition": {"op": "eq", "left": "age", "right": 18},
        "mc_options": [
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"},
        ],
        "answers": {"default": "no"},
        "lang_versions": [
            {
                # schema requires this FK
                "question_id": id,
                "lang": "en",
                "question_text": "Do you have any symptoms?",
                "mc_options": [
                    {"label": "Yes", "value": "yes"},
                    {"label": "No", "value": "no"},
                ],
            }
        ],
    }


def _create_form(
    *,
    id: str,
    name: str = "Intake Form",
    with_question: bool = True,
) -> dict:
    payload = {
        "id": id,
        "name": name,
        "patient_id": "pat-1",
        "lang": "en",
        "last_edited": 1_700_000_123,
        "date_created": 1_700_000_000,
    }
    if with_question:
        payload["questions"] = [_create_question(id="q-1", form_id=id, index=0)]
    return payload


def _create_workflow_instance_step(
    *,
    id: str,
    name: str,
    description: str,
    workflow_instance_id: str,
    form_id: str | None = None,
    include_form: bool = True,
) -> dict:
    d = {
        "id": id,
        "name": name,
        "description": description,
        "start_date": 1_700_000_001,
        "triggered_by": "prev-step-0",
        "last_edited": 1_700_000_010,
        "expected_completion": 1_700_000_999,
        "status": "Active",
        "data": '{"note":"bring previous records"}',
        "assigned_to": 42,
        "workflow_instance_id": workflow_instance_id,
    }
    if form_id:
        d["form_id"] = form_id
    if include_form:
        d["form"] = _create_form(id=form_id or "form-1", with_question=True)
    return d


def test_unmarshal_workflow_instance_step_with_form_and_questions():
    """
    Tests that unmarshaling a WorkflowInstanceStepOrm with a form and its questions
    successfully reconstructs the object structure.

    Ensures that the unmarshaled form has a single question with visible_condition,
    answers, and mc_options fields stringified as JSON. Also checks that the
    question's lang version has mc_options stringified as JSON.

    Finally, verifies that the original payload is not modified.
    """
    payload = _create_workflow_instance_step(
        id="wis-1",
        name="Intake",
        description="Collect initial data",
        workflow_instance_id="wi-1",
        form_id="form-1",
        include_form=True,
    )
    original = dict(payload)

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
    assert json.loads(q.visible_condition) == {"op": "eq", "left": "age", "right": 18}
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
    assert json.loads(qv.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]

    assert payload == original


def test_unmarshal_workflow_instance_step_minimal_no_form():
    """
    Tests that unmarshaling a WorkflowInstanceStepOrm with no form results in the correct object structure and no nested loads.
    Verifies that the unmarshalled object has form=None and no nested form loads occur.
    """
    payload = _create_workflow_instance_step(
        id="wis-2",
        name="Follow-up",
        description="Schedule a follow-up appointment",
        workflow_instance_id="wi-99",
        form_id=None,
        include_form=False,
    )
    original = dict(payload)

    obj = orm_serializer.unmarshal(WorkflowInstanceStepOrm, payload)

    assert isinstance(obj, (WorkflowInstanceStepOrm, types.SimpleNamespace))
    assert obj.id == "wis-2"
    assert obj.name == "Follow-up"
    assert obj.form is None

    assert payload == original
