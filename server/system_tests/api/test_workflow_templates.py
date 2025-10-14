import pytest
from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_current_time, get_uuid
from common.print_utils import pretty_print
from models import WorkflowTemplateOrm


def test_workflow_templates_with_same_classification_upload(
    database, workflow_template1, workflow_template3, api_post
):
    try:
        archived_template1_id = workflow_template1["id"]

        response = api_post(
            endpoint="/api/workflow/templates/body", json=workflow_template1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        """
        Uploading a new template with a different version under the same classification should archive
        the currently unarchived template
        """

        response = api_post(
            endpoint="/api/workflow/templates/body", json=workflow_template3
        )
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
    workflow_template1,
    api_post,
):
    try:
        response = api_post(
            endpoint="/api/workflow/templates/body", json=invalid_workflow_template1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 422

        response = api_post(
            endpoint="/api/workflow/templates/body", json=invalid_workflow_template2
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 404

        response = api_post(
            endpoint="/api/workflow/templates/body", json=workflow_template1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        """
        Submitting a workflow template with the same version of another template under the same classification should
        return a 409 error
        """
        response = api_post(
            endpoint="/api/workflow/templates/body", json=workflow_template1
        )
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
            id=workflow_template1["id"],
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

        # Keep workflow_template3 classification to match workflow_template1
        workflow_template3["steps"] = []

        workflow_template4["archived"] = True

        api_post(endpoint="/api/workflow/templates/body", json=workflow_template1)
        database.session.commit()

        api_post(endpoint="/api/workflow/templates/body", json=workflow_template3)
        database.session.commit()

        api_post(endpoint="/api/workflow/templates/body", json=workflow_template4)
        database.session.commit()

        classification_id = workflow_template1["classification_id"]

        """
        Query for non-archived workflow templates with same classification ID
        Should only return workflow_example3 since workflow_example1 is archived
        """

        response = api_get(
            f"/api/workflow/templates?classification_id={classification_id}"
        )
        workflow_templates = decamelize(response.json())["items"]

        assert len(workflow_templates) == 1
        assert workflow_templates[0]["id"] == workflow_template3["id"]

        """
        Query for archived workflow templates with same classification ID
        """

        response = api_get(
            f"/api/workflow/templates?classification_id={classification_id}&archived=True"
        )
        workflow_templates = decamelize(response.json())["items"]

        assert (
            len(workflow_templates) == 1
            and workflow_templates[0]["id"] == workflow_template1["id"]
        )

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


def test_workflow_template_patch_request(
    database, workflow_template1, api_patch, api_post
):
    updated_workflow_template = None
    try:
        api_post(endpoint="/api/workflow/templates/body", json=workflow_template1)
        database.session.commit()

        changes = {
            "name": "New workflow template name",
            "description": "New workflow template description",
            "version": "v2",
        }

        response = api_patch(
            endpoint=f"/api/workflow/templates/{workflow_template1['id']}", json=changes
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200

        old_workflow_template = crud.read(
            WorkflowTemplateOrm, id=workflow_template1["id"]
        )

        # Assert that the old workflow template is now archived
        assert old_workflow_template.archived is True

        updated_workflow_template = crud.read(
            WorkflowTemplateOrm, id=response_body["id"]
        )

        assert (
            updated_workflow_template is not None
            and updated_workflow_template.name == "New workflow template name"
            and updated_workflow_template.description
            == "New workflow template description"
            and updated_workflow_template.version == "v2"
        )

    finally:
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template1["id"],
        )

        if updated_workflow_template:
            crud.delete_workflow(
                m=WorkflowTemplateOrm,
                delete_classification=True,
                id=updated_workflow_template.id,
            )


@pytest.fixture
def workflow_template1():
    template_id = get_uuid()
    classification_id = get_uuid()
    return {
        "id": template_id,
        "name": "workflow_example1",
        "description": "workflow_example1",
        "archived": False,
        "starting_step_id": None,
        "date_created": get_current_time(),
        "last_edited": get_current_time() + 44345,
        "version": "0",
        "classification_id": classification_id,
        "classification": {
            "id": classification_id,
            "name": "Workflow Classification example 1",
        },
        "steps": [],
    }


@pytest.fixture
def workflow_template2(form_template):
    return {
        "id": None,
        "name": "workflow_example2",
        "description": "workflow_example2",
        "archived": False,
        "starting_step_id": None,
        "date_created": get_current_time(),
        "last_edited": get_current_time() + 44345,
        "version": "0",
        "classification_id": None,
        "classification": {
            "id": None,
            "name": "Workflow Classification example 2",
        },
        "steps": [
            {
                "id": None,
                "name": "template step example 1",
                "description": "example template step with all valid fields",
                "expected_completion": get_current_time(),
                "last_edited": get_current_time(),
                "form_id": form_template["id"],
                "form": form_template,
                "workflow_template_id": None,
                "condition_id": None,
                "condition": {
                    "id": None,
                    "rule": '{"and": [{"<": [{"var": "$patient.age"}, 32]}, {">": [{"var": "bpm"}, 164]}]}',
                    "data_sources": '["$patient.age"]',
                },
                "branches": [],
            }
        ],
    }


@pytest.fixture
def workflow_template3(form_template, workflow_template1):
    template_id = get_uuid()
    step_id = get_uuid()
    form_template["form_classification_id"] = get_uuid()
    form_template["classification"]["id"] = form_template["form_classification_id"]
    form_template["classification"]["name"] = "Form Classification example"
    return {
        "id": template_id,
        "name": "workflow_example3",
        "description": "workflow_example3",
        "archived": False,
        "starting_step_id": step_id,
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "version": "1",  # Should replace version 0 (workflow_template1) of this template when uploaded
        "classification_id": workflow_template1["classification_id"],
        "classification": {
            "id": workflow_template1["classification_id"],
            "name": "Workflow Classification Example 1",
        },
        "steps": [
            {
                "id": step_id,
                "name": "template step example 2",
                "description": "example template step with all valid fields",
                "expected_completion": get_current_time(),
                "last_edited": get_current_time(),
                "form_id": form_template["id"],
                "form": form_template,
                "workflow_template_id": template_id,
                "branches": [],
            }
        ],
    }


@pytest.fixture
def workflow_template4():
    template_id = get_uuid()
    classification_id = get_uuid()

    return {
        "id": template_id,
        "name": "workflow_example4",
        "description": "workflow_example4",
        "archived": False,
        "starting_step_id": None,
        "date_created": get_current_time(),
        "last_edited": get_current_time(),
        "version": "1",
        "classification_id": classification_id,
        "classification": {
            "id": classification_id,
            "name": "Workflow Classification for workflow_template4",
        },
        "steps": [],
    }


@pytest.fixture
def invalid_workflow_template1():
    template_id = get_uuid()
    classification_id = get_uuid()
    return {
        "id": template_id,
        "name": "Example invalid workflow template 1",
        "description": "Example workflow template with invalid dates",
        "archived": False,
        "starting_step_id": None,
        "date_created": get_current_time(),
        "last_edited": get_current_time() - 44345,  # Invalid edit date
        "version": "0",
        "classification_id": classification_id,
        "classification": {
            "id": classification_id,
            "name": "Workflow Classification for invalid_workflow_template1",
        },
        "steps": [],
    }


@pytest.fixture
def invalid_workflow_template2(form_template):
    template_id = get_uuid()
    classification_id = get_uuid()
    return {
        "id": template_id,
        "name": "Example workflow template 1",
        "description": "Example workflow template with all valid fields",
        "archived": False,
        "starting_step_id": None,
        "date_created": get_current_time(),
        "last_edited": get_current_time() + 44345,
        "version": "0",
        "classification_id": classification_id,
        "classification": None,  # No classification exists with this ID
        "steps": [],
    }
