import json
import types

from data.marshal import unmarshal
from models import (
    WorkflowInstanceOrm,
)


def _create_question(*, id: str, form_id: str, index: int = 0) -> dict:
    """
    Minimal Question payload for testing purposes.

    Args:
        id (str): Unique identifier for the question.
        form_id (str): ID of the FormOrm associated with the question.
        index (int): Index of the question in the form.

    Returns:
        dict: Minimal Question payload dictionary.

    """
    return {
        "id": id,
        "form_id": form_id,
        "question_index": index,
        "question_text": "Do you have any symptoms?",
        "visible_condition": {"op": "eq", "left": "age", "right": 18},
        "mc_options": [
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"},
        ],
        "answers": {"default": "no"},
        "lang_versions": [
            {
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
    description: str = "Vitals + history",
    classification_id: str = "fc-1",
    include_question: bool = True,
) -> dict:
    """
    Helper function to create a FormOrm payload for testing purposes.

    :param id: The ID of the form.
    :param name: The name of the form. Defaults to "ANC Intake".
    :param description: The description of the form. Defaults to "Vitals + history".
    :param classification_id: The ID of the classification associated with the form. Defaults to "fc-1".
    :param include_question: Whether to include a question in the form. Defaults to True.
    :return: A dictionary representing the form.
    """
    d = {
        "id": id,
        "name": name,
        "description": description,
        "classification_id": classification_id,
        "last_edited": 1_700_000_123,
        "date_created": 1_700_000_000,
    }
    if include_question:
        d["questions"] = [_create_question(id="q-1", form_id=id, index=0)]
    return d


def _create_step_with_form(
    *,
    id: str,
    instance_id: str,
    form_id: str,
) -> dict:
    """
    Helper function to create a WorkflowInstanceStepOrm payload for testing purposes.

    :param id: The ID of the step.
    :param instance_id: The ID of the WorkflowInstanceOrm associated with the step.
    :param form_id: The ID of the FormOrm associated with the step.
    :return: A dictionary representing the step with a nested form.
    """
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
        "form": _create_form(id=form_id, include_question=True),
    }


def _create_step_with_no_form(
    *,
    id: str,
    instance_id: str,
) -> dict:
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
    """WorkflowInstance with two steps, only the first has a nested form."""
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
        # intentionally omit 'steps'
    }


def _create_instance_with_empty_steps(*, id: str) -> dict:
    """Instance that provides steps: [] explicitly."""
    d = _create_instance_minimal(id=id)
    d["steps"] = []
    return d


def test_unmarshal_workflow_instance_with_steps_mixed_form(schema_loads_by_model):
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

    pre_wi = len(schema_loads_by_model("WorkflowInstanceOrm"))
    pre_wis = len(schema_loads_by_model("WorkflowInstanceStepOrm"))
    pre_form = len(schema_loads_by_model("FormOrm"))
    pre_q = len(schema_loads_by_model("QuestionOrm"))
    pre_qv = len(schema_loads_by_model("QuestionLangVersionOrm"))

    obj = unmarshal(WorkflowInstanceOrm, payload)

    # --- object structure ---
    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wi-1"
    assert obj.name == "ANC Visit 1"
    assert obj.current_step_id == "wis-1"
    assert isinstance(obj.steps, list) and len(obj.steps) == 2

    s1, s2 = obj.steps
    # Step 1 (with form)
    assert isinstance(s1, types.SimpleNamespace)
    assert s1.id == "wis-1"
    assert isinstance(s1.form, types.SimpleNamespace)
    assert s1.form.id == "form-1"
    assert isinstance(s1.form.questions, list) and len(s1.form.questions) == 1
    q = s1.form.questions[0]
    assert isinstance(q, types.SimpleNamespace)
    # The Question unmarshaller json.dumps these fields before load; returned object
    assert json.loads(q.visible_condition) == {"op": "eq", "left": "age", "right": 18}
    assert json.loads(q.answers) == {"default": "no"}
    assert json.loads(q.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]
    assert isinstance(q.lang_versions, list) and len(q.lang_versions) == 1
    qv = q.lang_versions[0]
    assert isinstance(qv, types.SimpleNamespace)
    assert qv.lang == "en"
    assert json.loads(qv.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]

    # Step 2 (no form)
    assert isinstance(s2, types.SimpleNamespace)
    assert s2.id == "wis-2"
    assert s2.form is None

    # --- schema.load(...) forwarding checks ---
    wi_loads = schema_loads_by_model("WorkflowInstanceOrm")[pre_wi:]
    wis_loads = schema_loads_by_model("WorkflowInstanceStepOrm")[pre_wis:]
    form_loads = schema_loads_by_model("FormOrm")[pre_form:]
    q_loads = schema_loads_by_model("QuestionOrm")[pre_q:]
    qv_loads = schema_loads_by_model("QuestionLangVersionOrm")[pre_qv:]

    # Instance loaded once and without 'steps'
    assert len(wi_loads) == 1
    expected_instance_forwarded = dict(payload)
    expected_instance_forwarded.pop("steps")
    assert wi_loads[-1] == expected_instance_forwarded

    # Two step loads in order:
    assert len(wis_loads) == 2

    # Step 1 forwarded without 'form'
    step1_expected = dict(payload["steps"][0])
    step1_expected.pop("form")
    assert wis_loads[0] == step1_expected

    # Step 2 forwarded as-is (no 'form' key)
    assert wis_loads[1] == payload["steps"][1]

    # Form was loaded once with raw 'questions'
    assert len(form_loads) == 1
    assert form_loads[-1] == payload["steps"][0]["form"]

    # One Question load; JSON-able fields should be strings; lang_versions removed
    assert len(q_loads) == 1
    q_forwarded = q_loads[-1]
    assert isinstance(q_forwarded["visible_condition"], str)
    assert isinstance(q_forwarded["answers"], str)
    assert isinstance(q_forwarded["mc_options"], str)
    assert "lang_versions" not in q_forwarded

    # One LangVersion load; mc_options stringified
    assert len(qv_loads) == 1
    qv_forwarded = qv_loads[-1]
    assert qv_forwarded["lang"] == "en"
    assert isinstance(qv_forwarded["mc_options"], str)


def test_unmarshal_workflow_instance_minimal_no_steps(schema_loads_by_model):
    """
    Tests that unmarshaling a WorkflowInstanceOrm with no steps
    forwards the payload as-is to WorkflowInstanceOrm.load(), and that no nested
    loads occur.
    """
    payload = _create_instance_minimal(id="wi-2")

    pre_wi = len(schema_loads_by_model("WorkflowInstanceOrm"))
    pre_wis = len(schema_loads_by_model("WorkflowInstanceStepOrm"))
    pre_form = len(schema_loads_by_model("FormOrm"))
    pre_q = len(schema_loads_by_model("QuestionOrm"))
    pre_qv = len(schema_loads_by_model("QuestionLangVersionOrm"))

    obj = unmarshal(WorkflowInstanceOrm, payload)

    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wi-2"
    assert obj.name == "Simple Instance"
    assert obj.steps == []

    wi_loads = schema_loads_by_model("WorkflowInstanceOrm")[pre_wi:]
    assert len(wi_loads) == 1
    assert wi_loads[-1] == payload

    assert len(schema_loads_by_model("WorkflowInstanceStepOrm")[pre_wis:]) == 0
    assert len(schema_loads_by_model("FormOrm")[pre_form:]) == 0
    assert len(schema_loads_by_model("QuestionOrm")[pre_q:]) == 0
    assert len(schema_loads_by_model("QuestionLangVersionOrm")[pre_qv:]) == 0


def test_unmarshal_workflow_instance_steps_explicit_empty_list(schema_loads_by_model):
    """
    Tests that unmarshaling a WorkflowInstanceOrm with an explicit empty list of steps
    forwards the payload as-is to WorkflowInstanceOrm.load(), and that no nested
    loads occur.
    """
    payload = _create_instance_with_empty_steps(id="wi-3")

    pre_wi = len(schema_loads_by_model("WorkflowInstanceOrm"))
    pre_wis = len(schema_loads_by_model("WorkflowInstanceStepOrm"))
    pre_form = len(schema_loads_by_model("FormOrm"))
    pre_q = len(schema_loads_by_model("QuestionOrm"))
    pre_qv = len(schema_loads_by_model("QuestionLangVersionOrm"))

    obj = unmarshal(WorkflowInstanceOrm, payload)

    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wi-3"
    assert obj.steps == []

    wi_loads = schema_loads_by_model("WorkflowInstanceOrm")[pre_wi:]
    assert len(wi_loads) == 1
    expected_instance_forwarded = dict(payload)
    expected_instance_forwarded.pop("steps")
    assert wi_loads[-1] == expected_instance_forwarded

    assert len(schema_loads_by_model("WorkflowInstanceStepOrm")[pre_wis:]) == 0
    assert len(schema_loads_by_model("FormOrm")[pre_form:]) == 0
    assert len(schema_loads_by_model("QuestionOrm")[pre_q:]) == 0
    assert len(schema_loads_by_model("QuestionLangVersionOrm")[pre_qv:]) == 0
