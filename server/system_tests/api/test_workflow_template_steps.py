import pytest

from common.commonUtil import get_current_time, get_uuid


# ~~~~~~~~~~~~~~~~~~~~~~~ Example Workflow for testing ~~~~~~~~~~~~~~~~~~~~~~~~~~ #
@pytest.fixture
def example_workflow_template(vht_user_id):
    template_id = get_uuid()
    classification_id = get_uuid()
    init_condition_id = get_uuid()
    return {
        "id": template_id,
        "name": "workflow_example1",
        "description": "workflow_example1",
        "archived": False,
        "date_created": get_current_time(),
        "last_edited": get_current_time() + 44345,
        "last_edited_by": vht_user_id,
        "version": "0",
        "initial_condition_id": init_condition_id,
        "initial_condition": {
            "id": init_condition_id,
            "logic": '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
            "rules": (
                '{"rule1": {"field": "patient.age", "operator": "LESS_THAN", "value": 32},'
                '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
            ),
        },
        "classification_id": classification_id,
        "classification": {
            "id": classification_id,
            "name": "Workflow Classification example 1",
        },
        "steps": [],
    }


# ~~~~~~~~~~~~~~~~~~~~~~~ Example template steps for testing ~~~~~~~~~~~~~~~~~~~~~~~~~~ #
@pytest.fixture
def valid_workflow_template_step1(
    vht_user_id, example_workflow_template, form_template
):
    step_id = get_uuid()
    condition_id = get_uuid()
    return {
        "id": step_id,
        "name": "valid_workflow_template_step1",
        "title": "valid_workflow_template_step1",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "last_edited_by": vht_user_id,
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "logic": '{"logical_operator": "OR", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
            "rules": (
                '{"rule1": {"field": "patient.height", "operator": "LESS_THAN", "value": 56},'
                '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
            ),
        },
        "branches": [],
    }


@pytest.fixture
def valid_workflow_template_step2(
    vht_user_id, example_workflow_template, form_template
):
    step_id = get_uuid()
    condition_id = get_uuid()
    branch_id = get_uuid()
    branch_condition_id = get_uuid()

    return {
        "id": step_id,
        "name": "valid_workflow_template_step2",
        "title": "valid_workflow_template_step2",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "last_edited_by": vht_user_id,
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "logic": '{"logical_operator": "OR", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
            "rules": (
                '{"rule1": {"field": "patient.height", "operator": "LESS_THAN", "value": 56},'
                '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
            ),
        },
        "branches": [
            {
                "id": branch_id,
                "target_step_id": "example_step",
                "step_id": step_id,
                "condition_id": branch_condition_id,
                "condition": {
                    "id": branch_condition_id,
                    "logic": '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
                    "rules": (
                        '{"rule1": {"field": "4", "operator": "LESS_THAN", "value": 56},'
                        '"rule2": {"field": "443", "operator": "GREATER_THAN", "value": 164}}'
                    ),
                },
            }
        ],
    }


@pytest.fixture
def valid_workflow_template_step3(
    vht_user_id, example_workflow_template, form_template
):
    step_id = get_uuid()
    condition_id = get_uuid()
    branch_id = get_uuid()

    return {
        "id": step_id,
        "name": "valid_workflow_template_step3",
        "title": "valid_workflow_template_step3",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "last_edited_by": None,
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "logic": '{"logical_operator": "OR", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
            "rules": (
                '{"rule1": {"field": "patient.height", "operator": "LESS_THAN", "value": 56},'
                '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
            ),
        },
        "branches": [
            {
                "id": branch_id,
                "target_step_id": None,
                "step_id": step_id,
                "condition_id": None,
                "condition": None,
            }
        ],
    }


@pytest.fixture
def invalid_workflow_template_step1(
    vht_user_id, example_workflow_template, form_template
):
    step_id = get_uuid()
    condition_id = get_uuid()
    branch_id = get_uuid()
    branch_condition_id = get_uuid()
    return {
        "id": step_id,
        "name": "valid_workflow_template_step2",
        "title": "valid_workflow_template_step2",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "last_edited_by": vht_user_id,
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "logic": "Hello",  # Invalid logic
            "rules": (
                '{"rule1": {"field": "patient.height", "operator": "LESS_THAN", "value": 56},'
                '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
            ),
        },
        "branches": [
            {
                "id": branch_id,
                "target_step_id": "example_step",
                "step_id": step_id,
                "condition_id": branch_condition_id,
                "condition": {
                    "id": branch_condition_id,
                    "logic": '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
                    "rules": (
                        '{"rule1": {"field": "4", "operator": "LESS_THAN", "value": 56},'
                        '"rule2": {"field": "443", "operator": "GREATER_THAN", "value": 164}}'
                    ),
                },
            }
        ],
    }
