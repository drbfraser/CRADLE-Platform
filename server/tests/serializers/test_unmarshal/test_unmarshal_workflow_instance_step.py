from __future__ import annotations

import json
import types

from data.marshal import unmarshal
from models import (
    WorkflowInstanceStepOrm,
)


def _create_question(
    *,
    id: str,
    form_id: str,
    index: int = 0,
) -> dict:
    """
    Construct a minimal QuestionOrm payload dictionary.

    Args:
        id (str): Unique identifier for the question.
        form_id (str): ID of the FormOrm associated with the question.
        index (int): Index of the question in the form.

    Returns:
        dict: Minimal QuestionOrm payload dictionary.

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
    name: str = "Intake Form",
    description: str = "Initial intake and triage",
    classification_id: str = "fc-1",
    with_question: bool = True,
) -> dict:
    """
    Helper function to create a FormOrm payload for testing purposes.

    :param id: The ID of the form.
    :param name: The name of the form. Defaults to "Intake Form".
    :param description: The description of the form. Defaults to "Initial intake and triage".
    :param classification_id: The ID of the classification associated with the form. Defaults to "fc-1".
    :param with_question: Whether to include a question in the form. Defaults to True.
    :return: A dictionary representing the form.
    """
    payload = {
        "id": id,
        "name": name,
        "description": description,
        "classification_id": classification_id,
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
    """
    Helper function to create a WorkflowInstanceStepOrm payload for testing purposes.

    :param id: The ID of the step.
    :param name: The name of the step.
    :param description: The description of the step.
    :param workflow_instance_id: The ID of the WorkflowInstanceOrm associated with the step.
    :param form_id: The ID of the FormOrm associated with the step, if any.
    :param include_form: Whether to include the form in the payload. Defaults to True.
    :return: A dictionary representing the step. If include_form is True, the dictionary will contain a 'form' key with a value that is a FormOrm payload dictionary.
    """
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


def test_unmarshal_workflow_instance_step_with_form_and_questions(
    schema_loads_by_model,
):
    """
    Tests that unmarshaling a WorkflowInstanceStepOrm with a form and questions loads the form and questions correctly.

    Verifies that:
    - The WorkflowInstanceStepOrm object returned has the correct form associated with it.
    - The form object has the correct questions associated with it.
    - The questions have their visible condition, answers, and mc_options fields stringified.
    - The lang_versions have their mc_options field stringified.
    - The correct number of loads occur for each model.
    """
    payload = _create_workflow_instance_step(
        id="wis-1",
        name="Intake",
        description="Collect initial data",
        workflow_instance_id="wi-1",
        form_id="form-1",
        include_form=True,
    )

    # Pre-capture sizes so we can slice out only the new calls
    pre_wis = len(schema_loads_by_model("WorkflowInstanceStepOrm"))
    pre_form = len(schema_loads_by_model("FormOrm"))
    pre_q = len(schema_loads_by_model("QuestionOrm"))
    pre_qv = len(schema_loads_by_model("QuestionLangVersionOrm"))

    obj = unmarshal(WorkflowInstanceStepOrm, payload)

    # --- object structure ---
    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wis-1"
    assert obj.name == "Intake"
    assert obj.description == "Collect initial data"
    assert obj.workflow_instance_id == "wi-1"
    # The unmarshaller attaches the nested form to the returned object
    assert isinstance(obj.form, types.SimpleNamespace)
    assert obj.form.id == "form-1"

    # Questions on the form are Question objects (SimpleNamespace from stub)
    assert isinstance(obj.form.questions, list) and len(obj.form.questions) == 1
    q = obj.form.questions[0]
    assert isinstance(q, types.SimpleNamespace)
    # json.loads to confirm fields were json.dumps'ed by unmarshal
    assert json.loads(q.visible_condition) == {"op": "eq", "left": "age", "right": 18}
    assert json.loads(q.answers) == {"default": "no"}
    assert json.loads(q.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]

    # Lang versions become objects too; their mc_options is json.dumps'ed
    assert isinstance(q.lang_versions, list) and len(q.lang_versions) == 1
    qv = q.lang_versions[0]
    assert isinstance(qv, types.SimpleNamespace)
    assert qv.lang == "en"
    assert json.loads(qv.mc_options) == [
        {"label": "Yes", "value": "yes"},
        {"label": "No", "value": "no"},
    ]

    # --- schema.load(...) forwarding checks ---
    wis_loads = schema_loads_by_model("WorkflowInstanceStepOrm")[pre_wis:]
    form_loads = schema_loads_by_model("FormOrm")[pre_form:]
    q_loads = schema_loads_by_model("QuestionOrm")[pre_q:]
    qv_loads = schema_loads_by_model("QuestionLangVersionOrm")[pre_qv:]

    # Step was loaded exactly once and *without* the 'form' key
    assert len(wis_loads) == 1
    expected_step_forwarded = dict(payload)
    expected_step_forwarded.pop("form")
    assert wis_loads[-1] == expected_step_forwarded

    # Form was loaded exactly once and includes the raw 'questions' list
    assert len(form_loads) == 1
    assert form_loads[-1] == payload["form"]

    # One question was loaded; verify JSON-able fields are strings
    assert len(q_loads) == 1
    q_forwarded = q_loads[-1]
    assert isinstance(q_forwarded["visible_condition"], str)
    assert isinstance(q_forwarded["answers"], str)
    assert isinstance(q_forwarded["mc_options"], str)
    # lang_versions key is removed before Question load
    assert "lang_versions" not in q_forwarded

    # One lang-version load; its mc_options is also stringified
    assert len(qv_loads) == 1
    qv_forwarded = qv_loads[-1]
    assert isinstance(qv_forwarded["mc_options"], str)
    assert qv_forwarded["lang"] == "en"


def test_unmarshal_workflow_instance_step_minimal_no_form(schema_loads_by_model):
    """
    Tests that unmarshaling a WorkflowInstanceStepOrm with include_form=False sets form=None
    and does not forward the 'form' key to the Step schema.

    Also checks that no nested loads occur (i.e. no Form, Question, or QuestionLangVersion loads)
    """
    payload = _create_workflow_instance_step(
        id="wis-2",
        name="Follow-up",
        description="Schedule a follow-up appointment",
        workflow_instance_id="wi-99",
        form_id=None,
        include_form=False,
    )

    pre_wis = len(schema_loads_by_model("WorkflowInstanceStepOrm"))
    pre_form = len(schema_loads_by_model("FormOrm"))
    pre_q = len(schema_loads_by_model("QuestionOrm"))
    pre_qv = len(schema_loads_by_model("QuestionLangVersionOrm"))

    obj = unmarshal(WorkflowInstanceStepOrm, payload)

    assert isinstance(obj, types.SimpleNamespace)
    assert obj.id == "wis-2"
    assert obj.name == "Follow-up"
    assert obj.form is None

    # Forwarded as-is to the Step schema (no 'form' key present at all)
    wis_loads = schema_loads_by_model("WorkflowInstanceStepOrm")[pre_wis:]
    assert len(wis_loads) == 1
    assert wis_loads[-1] == payload

    # No nested loads should have occurred
    assert len(schema_loads_by_model("FormOrm")[pre_form:]) == 0
    assert len(schema_loads_by_model("QuestionOrm")[pre_q:]) == 0
    assert len(schema_loads_by_model("QuestionLangVersionOrm")[pre_qv:]) == 0
