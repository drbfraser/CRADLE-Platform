import pytest
from humps import decamelize

from common.commonUtil import get_current_time, get_uuid
from common.print_utils import pretty_print
from common.workflow_utils import assign_workflow_template_or_instance_ids
from data import crud, marshal
from models import WorkflowTemplateOrm


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
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template1["id"],
        )
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template3["id"],
        )


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
        assert response.status_code == 404

        response = api_post(endpoint="/api/workflow/templates", json=workflow_template1)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        """
        Submitting a workflow template with the same version of another template under the same classification should
        return a 409 error
        """
        response = api_post(endpoint="/api/workflow/templates", json=workflow_template1)
        # database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 409

    finally:
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=invalid_workflow_template1["id"],
        )
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=invalid_workflow_template2["id"],
        )
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=invalid_workflow_template3["id"],
        )
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template1["id"],
        )


def test_workflow_template_ID_assignment(workflow_template2):
    assign_workflow_template_or_instance_ids(
        m=WorkflowTemplateOrm, workflow=workflow_template2
    )

    # Check that IDs are being assigned

    assert workflow_template2["id"] is not None
    assert workflow_template2["initial_condition_id"] is not None
    assert workflow_template2["initial_condition"]["id"] is not None
    assert workflow_template2["classification_id"] is not None
    assert workflow_template2["classification"]["id"] is not None
    assert workflow_template2["steps"][0]["id"] is not None
    assert workflow_template2["steps"][0]["workflow_template_id"] is not None
    assert workflow_template2["steps"][0]["condition_id"] is not None
    assert workflow_template2["steps"][0]["condition"]["id"] is not None
    assert workflow_template2["steps"][0]["form_id"] is not None
    assert workflow_template2["steps"][0]["form"]["id"] is not None

    # Check that newly assigned IDs match

    assert (
        workflow_template2["initial_condition_id"]
        == workflow_template2["initial_condition"]["id"]
    )
    assert (
        workflow_template2["classification_id"]
        == workflow_template2["classification"]["id"]
    )
    assert (
        workflow_template2["steps"][0]["workflow_template_id"]
        == workflow_template2["id"]
    )
    assert (
        workflow_template2["steps"][0]["condition_id"]
        == workflow_template2["steps"][0]["condition"]["id"]
    )
    assert (
        workflow_template2["steps"][0]["form_id"]
        == workflow_template2["steps"][0]["form"]["id"]
    )


def test_getting_workflow_templates(
    database,
    workflow_template1,
    workflow_template3,
    workflow_template4,
    api_get,
    api_post,
):
    try:
        workflow_template1["archived"] = True
        workflow_template_orm_1 = marshal.unmarshal(
            WorkflowTemplateOrm, workflow_template1
        )

        workflow_template3["classification"] = None
        workflow_template3["steps"] = []
        workflow_template_orm_2 = marshal.unmarshal(
            WorkflowTemplateOrm, workflow_template3
        )

        workflow_template_orm_2.classification_id = (
            workflow_template_orm_1.classification_id
        )

        workflow_template4["archived"] = True

        api_post(endpoint="/api/workflow/templates", json=workflow_template1)
        database.session.commit()

        api_post(endpoint="/api/workflow/templates", json=workflow_template3)
        database.session.commit()

        api_post(endpoint="/api/workflow/templates", json=workflow_template4)
        database.session.commit()

        """
        Query for archived workflow templates with same classification ID
        """

        response = api_get(
            f"/api/workflow/templates?classification_id={workflow_template1['classification_id']}&archived=True"
        )
        workflow_templates = decamelize(response.json())["items"]

        assert (
            len(workflow_templates) == 1
            and workflow_templates[0]["id"] == workflow_template1["id"]
        )

        response = api_get("/api/workflow/templates?archived=True")
        workflow_templates = decamelize(response.json())["items"]

        assert len(workflow_templates) == 2

        """
        Query for workflow_example1 and workflow_example3 with same classification ID
        """

        response = api_get(
            f"/api/workflow/templates?classification_id={workflow_template1['classification_id']}"
        )
        workflow_templates = decamelize(response.json())["items"]

        assert len(workflow_templates) == 2

        """
        Query for a specific workflow template
        """

        response = api_get(
            f"/api/workflow/templates/{workflow_template1['id']}?with_steps=False&with_classification=False"
        )
        workflow_template = decamelize(response.json())

        assert (
            workflow_template is not None
            and workflow_template["id"] == workflow_template1["id"]
        )

    finally:
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template1["id"],
        )
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template3["id"],
        )
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template4["id"],
        )


@pytest.fixture
def workflow_template1(vht_user_id):
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


@pytest.fixture
def workflow_template2(vht_user_id, form_template):
    return {
        "id": None,
        "name": "workflow_example2",
        "description": "workflow_example2",
        "archived": False,
        "date_created": get_current_time(),
        "last_edited": get_current_time() + 44345,
        "last_edited_by": vht_user_id,
        "version": "0",
        "initial_condition_id": None,
        "initial_condition": {
            "id": None,
            "logic": '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
            "rules": (
                '{"rule1": {"field": "patient.age", "operator": "LESS_THAN", "value": 32},'
                '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
            ),
        },
        "classification_id": None,
        "classification": {
            "id": None,
            "name": "Workflow Classification example 2",
        },
        "steps": [
            {
                "id": None,
                "name": "template step example 1",
                "title": "example template step with all valid fields",
                "expected_completion": get_current_time(),
                "last_edited": get_current_time(),
                "last_edited_by": vht_user_id,
                "form_id": None,
                "form": form_template,
                "workflow_template_id": None,
                "condition_id": None,
                "condition": {
                    "id": None,
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
    form_template["form_classification_id"] = get_uuid()
    form_template["classification"]["id"] = form_template["form_classification_id"]
    form_template["classification"]["name"] = "Form Classification example"
    return {
        "id": template_id,
        "name": "workflow_example3",
        "description": "workflow_example3",
        "archived": False,
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "last_edited_by": vht_user_id,
        "version": "1",  # Should replace version 0 (workflow_template1) of this template when uploaded
        "initial_condition_id": init_condition_id,
        "initial_condition": {
            "id": init_condition_id,
            "logic": '{"logical_operator": "OR", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
            "rules": (
                '{"rule1": {"field": "patient.height", "operator": "LESS_THAN", "value": 56},'
                '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
            ),
        },
        "classification_id": workflow_template1["classification_id"],
        "classification": {
            "id": workflow_template1["classification_id"],
            "name": "Workflow Classification Example 1",
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
                    "logic": '{"logical_operator": "OR", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
                    "rules": (
                        '{"rule1": {"field": "patient.height", "operator": "LESS_THAN", "value": 56},'
                        '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
                    ),
                },
                "branches": [],
            }
        ],
    }


@pytest.fixture
def workflow_template4(vht_user_id):
    template_id = get_uuid()
    init_condition_id = get_uuid()
    classification_id = get_uuid()

    return {
        "id": template_id,
        "name": "workflow_example4",
        "description": "workflow_example4",
        "archived": False,
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "last_edited_by": vht_user_id,
        "version": "1",
        "initial_condition_id": init_condition_id,
        "initial_condition": {
            "id": init_condition_id,
            "logic": '{"logical_operator": "OR", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}',
            "rules": (
                '{"rule1": {"field": "patient.height", "operator": "LESS_THAN", "value": 56},'
                '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
            ),
        },
        "classification_id": classification_id,
        "classification": {
            "id": classification_id,
            "name": "Workflow Classification for workflow_template4",
        },
        "steps": [],
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
            "name": "Workflow Classification for invalid_workflow_template1",
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
            "name": "Workflow Classification for invalid_workflow_template2",
        },
        "steps": [],
    }


@pytest.fixture
def invalid_workflow_template3(vht_user_id, form_template):
    template_id = get_uuid()
    init_condition_id = get_uuid()
    classification_id = get_uuid()
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
        "classification": None,  # No classification exists with this ID
        "steps": [],
    }
