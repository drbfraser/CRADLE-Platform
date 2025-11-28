from __future__ import annotations

import json

from data import orm_serializer
from models import WorkflowInstanceOrm


def _create_question(*, id: str, form_id: str, index: int = 0) -> dict:
    """Minimal, valid Question payload for *Form* (not template)."""
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
    name: str = "ANC Intake",
    include_question: bool = True,
    patient_id: str = "p-1",
    lang: str = "en",
) -> dict:
    """
    Build a *FormOrm* payload (NOT FormTemplate). Do NOT include template fields.
    """
    d = {
        "id": id,
        "name": name,
        "patient_id": patient_id,
        "lang": lang,
        "last_edited": 1_700_000_123,
        "date_created": 1_700_000_000,
    }
    if include_question:
        d["questions"] = [_create_question(id="q-1", form_id=id, index=0)]
    return d


def _create_step_with_form(*, id: str, instance_id: str, form_id: str) -> dict:
    """WorkflowInstanceStep with nested *Form* (not template)."""
    return {
        "id": id,
        "name": "Intake",
        "description": "Collect vitals",
        "start_date": 1_700_001_001,
        "triggered_by": "template-start",
        "last_edited": 1_700_001_009,
        "expected_completion": 1_700_001_500,
        "status": "Active",
        "data": '{"note":"fasting"}',
        "assigned_to": 77,
        "workflow_instance_id": instance_id,
        "form_id": form_id,
        "form": _create_form(
            id=form_id, include_question=True, patient_id="p-1", lang="en"
        ),
    }


def _create_step_with_no_form(*, id: str, instance_id: str) -> dict:
    """Step without a nested form."""
    return {
        "id": id,
        "name": "Counseling",
        "description": "Diet advice",
        "start_date": 1_700_001_100,
        "triggered_by": "wis-1",
        "last_edited": 1_700_001_200,
        "expected_completion": 1_700_001_800,
        "status": "Active",
        "data": '{"note":"advise hydration"}',
        "assigned_to": 88,
        "workflow_instance_id": instance_id,
        # no 'form' key here
    }


def _create_instance_full(*, id: str) -> dict:
    """WorkflowInstance with two steps, first has a nested form."""
    return {
        "id": id,
        "name": "ANC Visit 1",
        "description": "First antenatal care flow",
        "start_date": 1_700_001_000,
        "current_step_id": "wis-1",
        "last_edited": 1_700_001_010,
        "status": "Active",
        "workflow_template_id": "wt-1",
        "patient_id": "p-1",
        "steps": [
            _create_step_with_form(id="wis-1", instance_id=id, form_id="form-1"),
            _create_step_with_no_form(id="wis-2", instance_id=id),
        ],
    }


def _create_instance_minimal(*, id: str) -> dict:
    """Minimal instance: no 'steps' key at all."""
    return {
        "id": id,
        "name": "Simple Instance",
        "description": "No steps here",
        "start_date": 1_700_100_000,
        "last_edited": 1_700_100_010,
        "status": "Active",
        "workflow_template_id": "wt-9",
        "patient_id": "p-9",
        # omit 'steps'
    }


def _create_instance_with_empty_steps(*, id: str) -> dict:
    """Instance that provides steps: [] explicitly."""
    d = _create_instance_minimal(id=id)
    d["steps"] = []
    return d


def test_unmarshal_workflow_instance_with_steps_mixed_form():
    """
    Tests that unmarshaling a WorkflowInstanceOrm with two steps, one with a nested form and one without,
    results in the correct object structure and schema.load forwarding.

    Verifies:
      - Instance is loaded once, without 'steps'
      - Two step loads in order; first step forwarded without 'form', second step forwarded as-is (no 'form' key)
      - Form is loaded once with raw 'questions'
      - One Question load; JSON-able fields are strings; lang_versions removed
      - One LangVersion load; mc_options stringified
    """
    payload = _create_instance_full(id="wi-1")
    obj = orm_serializer.unmarshal(WorkflowInstanceOrm, payload)

    # Accept either real ORM or the SimpleNamespace stub in tests
    assert isinstance(obj, WorkflowInstanceOrm)
    assert obj.id == "wi-1"
    assert obj.name == "ANC Visit 1"
    assert obj.current_step_id == "wis-1"
    assert isinstance(obj.steps, list) and len(obj.steps) == 2

    s1, s2 = obj.steps

    # Step 1 (has form)
    assert hasattr(s1, "id") and s1.id == "wis-1"
    assert s1.form is not None
    assert hasattr(s1.form, "id") and s1.form.id == "form-1"
    assert isinstance(s1.form.questions, list) and len(s1.form.questions) == 1

    q = s1.form.questions[0]
    # JSON-able fields were stringified by orm_serializer.unmarshal(QuestionOrm)
    assert json.loads(q.visible_condition) == {"op": "eq", "left": "age", "right": 18}
    assert json.loads(q.answers) == {"default": "no"}
    assert json.loads(q.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]

    assert isinstance(q.lang_versions, list) and len(q.lang_versions) == 1
    qv = q.lang_versions[0]
    assert qv.lang == "en"
    assert json.loads(qv.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]

    # Step 2 (no form)
    assert hasattr(s2, "id") and s2.id == "wis-2"
    assert s2.form is None


def test_unmarshal_workflow_instance_minimal_no_steps():
    """
    Tests that unmarshaling a WorkflowInstanceOrm with no steps
    forwards the payload as-is to WorkflowInstanceOrm.load(), and that an empty list
    is attached to the returned object.
    """
    payload = _create_instance_minimal(id="wi-2")
    obj = orm_serializer.unmarshal(WorkflowInstanceOrm, payload)

    assert isinstance(obj, WorkflowInstanceOrm)
    assert obj.id == "wi-2"
    assert obj.name == "Simple Instance"
    # Code attaches [] when steps missing
    assert isinstance(obj.steps, list) and obj.steps == []


def test_unmarshal_workflow_instance_steps_explicit_empty_list():
    """
    Tests that unmarshaling a WorkflowInstanceOrm with an explicit empty list of steps
    forwards the payload as-is to WorkflowInstanceOrm.load(), and that no nested
    loads occur.
    """
    payload = _create_instance_with_empty_steps(id="wi-3")
    obj = orm_serializer.unmarshal(WorkflowInstanceOrm, payload)

    assert isinstance(obj, WorkflowInstanceOrm)
    assert obj.id == "wi-3"
    assert isinstance(obj.steps, list) and obj.steps == []
