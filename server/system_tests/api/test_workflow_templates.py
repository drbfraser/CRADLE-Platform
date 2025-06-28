import pytest
from humps import decamelize

from common.commonUtil import get_current_time, get_uuid
from common.print_utils import pretty_print
from data import crud
from models import WorkflowClassificationOrm, WorkflowTemplateOrm


def test_workflow_templates_with_same_classification_upload(
    database, workflow_template1, workflow_template3, api_post
):
    try:
        archived_template1_id = workflow_template1["id"]

        response = api_post(endpoint="/api/workflow/templates", json=workflow_template1)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        """
        Uploading a new template with a different version under the same classification should archive 
        the currently unarchived template
        """

        response = api_post(endpoint="/api/workflow/templates", json=workflow_template3)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # The first template should now be archived
        archived_template1 = crud.read(
            WorkflowTemplateOrm, id=archived_template1_id, archived=True
        )

        assert archived_template1 is not None

    finally:
        classification_id = workflow_template1["classification"]["id"]

        crud.delete_workflow_template(
            id=workflow_template1["id"], classification_id=classification_id
        )
        crud.delete_workflow_template(
            id=workflow_template3["id"], classification_id=classification_id
        )

        crud.delete_by(WorkflowClassificationOrm, id=classification_id)


def test_invalid_workflow_templates_uploaded(
    database,
    invalid_workflow_template1,
    invalid_workflow_template2,
    invalid_workflow_template3,
    workflow_template1,
    api_post,
):
    try:
        response = api_post(
            endpoint="/api/workflow/templates", json=invalid_workflow_template1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 422

        response = api_post(
            endpoint="/api/workflow/templates", json=invalid_workflow_template2
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 422

        response = api_post(
            endpoint="/api/workflow/templates", json=invalid_workflow_template3
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 422

        response = api_post(endpoint="/api/workflow/templates", json=workflow_template1)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Submitting a workflow template with the same version of another template under the same classification should
        # return a 409 error
        response = api_post(endpoint="/api/workflow/templates", json=workflow_template1)
        # database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 409

    finally:
        crud.delete_by(
            WorkflowClassificationOrm, id=workflow_template1["classification"]["id"]
        )

        crud.delete_workflow_template(id=invalid_workflow_template1["id"])
        crud.delete_workflow_template(id=invalid_workflow_template2["id"])
        crud.delete_workflow_template(id=invalid_workflow_template3["id"])
        crud.delete_workflow_template(id=workflow_template1["id"])


@pytest.fixture
def workflow_template1(vht_user_id):
    template_id = get_uuid()
    classification_id = get_uuid()
    init_condition_id = get_uuid()
    return {
        "id": template_id,
        "name": "Example workflow template 1",
        "description": "Example workflow template with all valid fields",
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
            "name": "Workflow Classification example",
        },
        "steps": [],
    }


@pytest.fixture
def workflow_template2(vht_user_id, form_template):
    template_id = get_uuid()
    classification_id = get_uuid()
    init_condition_id = get_uuid()
    step_id = get_uuid()
    condition_id = get_uuid()
    return {
        "id": template_id,
        "name": "Example workflow template 2",
        "description": "Example workflow template with all valid fields including steps",
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
            "name": "Workflow Classification example",
        },
        "steps": [
            {
                "id": step_id,
                "name": "template step example 1",
                "title": "example template step with all valid fields",
                "expected_completion": get_current_time(),
                "last_edited": get_current_time(),
                "last_edited_by": vht_user_id,
                "form_id": form_template["id"],
                "form": form_template,
                "workflow_template_id": template_id,
                "condition_id": condition_id,
                "condition": {
                    "id": condition_id,
                    "logic": '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
                    "rules": (
                        '{"rule1": {"field": "patient.age", "operator": "LESS_THAN", "value": 32},'
                        '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
                    ),
                },
                "branches": [],
            }
        ],
    }


@pytest.fixture
def workflow_template3(form_template, vht_user_id, workflow_template1):
    template_id = get_uuid()
    init_condition_id = get_uuid()
    step_id = get_uuid()
    condition_id = get_uuid()
    return {
        "id": template_id,
        "name": "Example workflow template 3",
        "description": "Example workflow template with all valid fields including steps",
        "archived": False,
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "last_edited_by": vht_user_id,
        "version": "1",  # Should replace version 0 (workflow_template1) of this template when uploaded
        "initial_condition_id": init_condition_id,
        "initial_condition": {
            "id": init_condition_id,
            "logic": '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
            "rules": (
                '{"rule1": {"field": "patient.age", "operator": "LESS_THAN", "value": 32},'
                '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
            ),
        },
        "classification_id": workflow_template1["classification"]["id"],
        "classification": {
            "id": workflow_template1["classification"]["id"],
            "name": "Workflow Classification example",
        },
        "steps": [
            {
                "id": step_id,
                "name": "template step example 2",
                "title": "example template step with all valid fields",
                "expected_completion": get_current_time(),
                "last_edited": get_current_time(),
                "last_edited_by": vht_user_id,
                "form_id": form_template["id"],
                "form": form_template,
                "workflow_template_id": template_id,
                "condition_id": condition_id,
                "condition": {
                    "id": condition_id,
                    "logic": '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
                    "rules": (
                        '{"rule1": {"field": "patient.age", "operator": "LESS_THAN", "value": 32},'
                        '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
                    ),
                },
                "branches": [],
            }
        ],
    }


@pytest.fixture
def invalid_workflow_template1(vht_user_id):
    template_id = get_uuid()
    classification_id = get_uuid()
    init_condition_id = get_uuid()
    return {
        "id": template_id,
        "name": "Example invalid workflow template 1",
        "description": "Example workflow template with invalid dates",
        "archived": False,
        "date_created": get_current_time(),
        "last_edited": get_current_time() - 44345,  # Invalid edit date
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
            "name": "Workflow Classification example",
        },
        "steps": [],
    }


@pytest.fixture
def invalid_workflow_template2(vht_user_id):
    template_id = get_uuid()
    classification_id = get_uuid()
    init_condition_id = get_uuid()
    return {
        "id": template_id,
        "name": "Example invalid workflow template 2",
        "description": "Example workflow template with invalid initial conditions",
        "archived": False,
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "last_edited_by": vht_user_id,
        "version": "0",
        "initial_condition_id": init_condition_id,
        "initial_condition": {
            "id": init_condition_id,
            "logic": '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
            "rules": "Hello",  # Invalid JSON string
        },
        "classification_id": classification_id,
        "classification": {
            "id": classification_id,
            "name": "Workflow Classification example",
        },
        "steps": [],
    }


@pytest.fixture
def invalid_workflow_template3(vht_user_id, form_template):
    template_id = get_uuid()
    classification_id = get_uuid()
    init_condition_id = get_uuid()
    step_id = get_uuid()
    condition_id = get_uuid()
    return {
        "id": template_id,
        "name": "Example invalid workflow template 3",
        "description": "Example workflow template with invalid step",
        "archived": False,
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "last_edited_by": vht_user_id,
        "version": "0",
        "initial_condition_id": init_condition_id,
        "initial_condition": {
            "id": init_condition_id,
            "logic": '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
            "rules": "Hello",  # Invalid JSON string
        },
        "classification_id": classification_id,
        "classification": {
            "id": classification_id,
            "name": "Workflow Classification example",
        },
        "steps": [
            {
                "id": step_id,
                "name": "template step example 2",
                "title": "example template step with all invalid date",
                "expected_completion": get_current_time(),
                "last_edited": get_current_time() - 400,  # Invalid edit date
                "last_edited_by": vht_user_id,
                "form_id": form_template["id"],
                "form": form_template,
                "workflow_template_id": template_id,
                "condition_id": condition_id,
                "condition": {
                    "id": condition_id,
                    "logic": '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
                    "rules": (
                        '{"rule1": {"field": "patient.age", "operator": "LESS_THAN", "value": 32},'
                        '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
                    ),
                },
                "branches": [],
            }
        ],
    }
