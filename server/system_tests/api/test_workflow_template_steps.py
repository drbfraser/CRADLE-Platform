import copy

import pytest
from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_current_time, get_uuid
from common.print_utils import pretty_print
from models import (
    WorkflowTemplateOrm,
)


def test_uploading_valid_workflow_template_steps(
    database,
    valid_workflow_template_step1,
    valid_workflow_template_step2,
    valid_workflow_template_step4,
    example_workflow_template,
    valid_workflow_template_step5,
    api_post,
):
    try:
        """
        Upload 3 template steps to the example workflow template
        """

        api_post(
            endpoint="/api/workflow/templates/body", json=example_workflow_template
        )

        # upload step1
        response = api_post(
            endpoint="/api/workflow/template/steps", json=valid_workflow_template_step1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # upload step 2
        response = api_post(
            endpoint="/api/workflow/template/steps", json=valid_workflow_template_step2
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # upload step 4
        response = api_post(
            endpoint="/api/workflow/template/steps", json=valid_workflow_template_step4
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        workflow_template_orm = crud.read(
            WorkflowTemplateOrm, id=example_workflow_template["id"]
        )

        """
        Check that all 3 steps have been added to the workflow template
        """
        assert len(workflow_template_orm.steps) == 3
        
        # upload duplicate step -> should fail with 409
        response = api_post(
            endpoint="/api/workflow/template/steps", json=valid_workflow_template_step5
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 409

    finally:
        crud.delete_workflow(
            WorkflowTemplateOrm,
            delete_classification=True,
            id=example_workflow_template["id"],
        )


def test_uploading_invalid_workflow_template_steps(
    database,
    invalid_workflow_template_step1,
    invalid_workflow_template_step2,
    invalid_workflow_template_step3,
    valid_workflow_template_step1,
    valid_workflow_template_step3,
    example_workflow_template,
    api_post,
):
    try:
        api_post(
            endpoint="/api/workflow/templates/body", json=example_workflow_template
        )

        """
        Try to upload 3 invalid template steps to the example workflow template
        """

        response = api_post(
            endpoint="/api/workflow/template/steps",
            json=invalid_workflow_template_step1,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 422

        response = api_post(
            endpoint="/api/workflow/template/steps",
            json=invalid_workflow_template_step2,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 404

        response = api_post(
            endpoint="/api/workflow/template/steps",
            json=invalid_workflow_template_step3,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 404

        """
        Try to upload a workflow template step which has the exact same form template version as an
        already existing form template
        """

        response = api_post(
            endpoint="/api/workflow/template/steps", json=valid_workflow_template_step1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        response = api_post(
            endpoint="/api/workflow/template/steps", json=valid_workflow_template_step3
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 409

    finally:
        crud.delete_workflow(
            WorkflowTemplateOrm,
            delete_classification=True,
            id=example_workflow_template["id"],
        )


def test_getting_workflow_template_steps(
    database,
    example_workflow_template,
    valid_workflow_template_step1,
    valid_workflow_template_step2,
    api_post,
    api_get,
):
    try:
        api_post(
            endpoint="/api/workflow/templates/body", json=example_workflow_template
        )

        response = api_post(
            endpoint="/api/workflow/template/steps", json=valid_workflow_template_step1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        response = api_post(
            endpoint="/api/workflow/template/steps", json=valid_workflow_template_step2
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        """
        Query for specific workflow template steps with various query parameters
        """

        response = api_get(
            endpoint=f"/api/workflow/template/steps/{valid_workflow_template_step2['id']}?with_form=True&with_branches=True"
        )
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert (
            response.status_code == 200
            and response_body is not None
            and response_body["id"] == valid_workflow_template_step2["id"]
            and response_body["form"] is not None
            and len(response_body["branches"]) == 1
        )

        response = api_get(
            endpoint=f"/api/workflow/template/steps/{valid_workflow_template_step1['id']}"
        )
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert (
            response.status_code == 200
            and response_body["id"] == valid_workflow_template_step1["id"]
            and "form" not in response_body
            and "branches" not in response_body
        )

        """
        Query for all workflow template steps from a workflow template
        """

        response = api_get(
            endpoint=f"/api/workflow/templates/{example_workflow_template['id']}/steps"
        )
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 200 and len(response_body["items"]) == 2

    finally:
        crud.delete_workflow(
            WorkflowTemplateOrm,
            delete_classification=True,
            id=example_workflow_template["id"],
        )


# ~~~~~~~~~~~~~~~~~~~~~~~ Example Workflow for testing ~~~~~~~~~~~~~~~~~~~~~~~~~~ #
@pytest.fixture
def example_workflow_template():
    template_id = get_uuid()
    classification_id = get_uuid()
    init_condition_id = get_uuid()
    return {
        "id": template_id,
        "name": "workflow_example1",
        "description": "workflow_example1",
        "archived": False,
        "starting_step_id": None,
        "date_created": get_current_time(),
        "last_edited": get_current_time() + 44345,
        "version": "0",
        "initial_condition_id": init_condition_id,
        "initial_condition": {
            "id": init_condition_id,
            "rule": '{"and": [{"<": [{"var": "$patient.age"}, 32]}, {">": [{"var": "bpm"}, 164]}]}',
            "data_sources": '["$patient.age"]',
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
def valid_workflow_template_step1(example_workflow_template, form_template):
    step_id = get_uuid()
    condition_id = get_uuid()
    form_template = copy.deepcopy(form_template)
    form_template["id"] = get_uuid()
    form_template["form_classification_id"] = get_uuid()
    form_template["classification"]["id"] = form_template["form_classification_id"]
    return {
        "id": step_id,
        "name": "valid_workflow_template_step1",
        "description": "valid_workflow_template_step1",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "rule": '{"or": [{"<": [{"var": "height"}, 56]}, {">": [{"var": "bpm"}, 164]}]}',
            "data_sources": "[]",
        },
        "branches": [],
    }


@pytest.fixture
def valid_workflow_template_step2(
    example_workflow_template, form_template, valid_workflow_template_step4
):
    step_id = get_uuid()
    condition_id = get_uuid()
    branch_id = get_uuid()
    branch_condition_id = get_uuid()
    form_template = copy.deepcopy(form_template)
    form_template["id"] = get_uuid()
    form_template["version"] = "V2"
    form_template["form_classification_id"] = get_uuid()
    form_template["classification"]["id"] = form_template["form_classification_id"]

    return {
        "id": step_id,
        "name": "valid_workflow_template_step2",
        "description": "valid_workflow_template_step2",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "rule": '{"or": [{"<": [{"var": "height"}, 56]}, {">": [{"var": "bpm"}, 164]}]}',
            "data_sources": "[]",
        },
        "branches": [
            {
                "id": branch_id,
                "target_step_id": valid_workflow_template_step4["id"],
                "step_id": step_id,
                "condition_id": branch_condition_id,
                "condition": {
                    "id": branch_condition_id,
                    "rule": '{"and": [{"<": [4, 56]}, {">": [443, 164]}]}',
                    "data_sources": "[]",
                },
            }
        ],
    }


# This will cause an error if uploaded alongside valid_workflow_template_step1 because both of them are attempting to
# upload the same form template version at the same time
@pytest.fixture
def valid_workflow_template_step3(example_workflow_template, form_template):
    step_id = get_uuid()
    condition_id = get_uuid()
    branch_id = get_uuid()
    form_template = copy.deepcopy(form_template)
    form_template["id"] = "ft-2"
    form_template["form_classification_id"] = "fc-5"
    form_template["classification"]["id"] = form_template["form_classification_id"]

    return {
        "id": step_id,
        "name": "valid_workflow_template_step3",
        "description": "valid_workflow_template_step3",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "rule": '{"or": [{"<": [{"var": "height"}, 56]}, {">": [{"var": "bpm"}, 164]}]}',
            "data_sources": "[]",
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
def valid_workflow_template_step4(example_workflow_template, form_template):
    step_id = get_uuid()
    condition_id = get_uuid()
    branch_id = get_uuid()
    branch_condition_id = get_uuid()
    branch_condition_id2 = get_uuid()
    branch_id2 = get_uuid()

    form_template = copy.deepcopy(form_template)
    form_template["id"] = get_uuid()
    form_template["version"] = "V3"
    form_template["form_classification_id"] = get_uuid()
    form_template["classification"]["id"] = form_template["form_classification_id"]

    return {
        "id": step_id,
        "name": "valid_workflow_template_step4",
        "description": "valid_workflow_template_step4",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "rule": '{"or": [{"<": [{"var": "height"}, 56]}, {">": [{"var": "bpm"}, 164]}]}',
            "data_sources": "[]",
        },
        "branches": [
            {
                "id": branch_id,
                "target_step_id": "example_step",
                "step_id": step_id,
                "condition_id": branch_condition_id,
                "condition": {
                    "id": branch_condition_id,
                    "rule": '{"and": [{"<": [4, 56]}, {">": [443, 164]}]}',
                    "data_sources": "[]",
                },
            },
            {
                "id": branch_id2,
                "target_step_id": "example_branch",
                "step_id": step_id,
                "condition_id": branch_condition_id2,
                "condition": {
                    "id": branch_condition_id2,
                    "rule": '{"or": [{"<": [{"var": "height"}, 56]}, {">": [{"var": "bpm"}, 164]}]}',
                    "data_sources": "[]",
                },
            },
        ],
    }

# intentionally conflicts with Step 1 -> should get 409
@pytest.fixture
def valid_workflow_template_step5(example_workflow_template, valid_workflow_template_step1):
    step_id = get_uuid()
    ft = copy.deepcopy(valid_workflow_template_step1["form"])
    return {
        "id": step_id,
        "name": "valid_workflow_template_step5_duplicate",
        "description": "duplicate version of step1",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "form_id": ft["id"],
        "form": ft,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": get_uuid(),
        "condition": {
            "id": get_uuid(),
            "rule": '{"or": [{"<": [{"var": "height"}, 56]}, {">": [{"var": "bpm"}, 164]}]}',
            "data_sources": "[]",
        },
        "branches": [],
    }

@pytest.fixture
def invalid_workflow_template_step1(example_workflow_template, form_template):
    step_id = get_uuid()
    condition_id = get_uuid()
    branch_id = get_uuid()
    branch_condition_id = get_uuid()
    return {
        "id": step_id,
        "name": "invalid_workflow_template_step1",
        "description": "invalid_workflow_template_step1",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "rule": "Hello",  # Invalid rule
            "data_sources": "[]",
        },
        "branches": [
            {
                "id": branch_id,
                "target_step_id": "example_step",
                "step_id": step_id,
                "condition_id": branch_condition_id,
                "condition": {
                    "id": branch_condition_id,
                    "rule": '{"and": [{"<": [4, 56]}, {">": [443, 164]}]}',
                    "data_sources": "[]",
                },
            }
        ],
    }


@pytest.fixture
def invalid_workflow_template_step2(form_template):
    step_id = get_uuid()
    condition_id = get_uuid()
    branch_id = get_uuid()
    branch_condition_id = get_uuid()
    return {
        "id": step_id,
        "name": "invalid_workflow_template_step2",
        "description": "invalid_workflow_template_step2",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": "non-existent-template",  # This template does not exist
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "rule": '{"or": [{"<": [{"var": "height"}, 56]}, {">": [{"var": "bpm"}, 164]}]}',
            "data_sources": "[]",
        },
        "branches": [
            {
                "id": branch_id,
                "target_step_id": "example_step",
                "step_id": step_id,
                "condition_id": branch_condition_id,
                "condition": {
                    "id": branch_condition_id,
                    "rule": '{"and": [{"<": [4, 56]}, {">": [443, 164]}]}',
                    "data_sources": "[]",
                },
            }
        ],
    }


@pytest.fixture
def invalid_workflow_template_step3(example_workflow_template, form_template):
    step_id = get_uuid()
    condition_id = get_uuid()
    branch_id = get_uuid()
    return {
        "id": step_id,
        "name": "invalid_workflow_template_step3",
        "description": "invalid_workflow_template_step3",
        "expected_completion": get_current_time(),
        "last_edited": get_current_time(),
        "form_id": form_template["id"],
        "form": form_template,
        "workflow_template_id": example_workflow_template["id"],
        "condition_id": condition_id,
        "condition": {
            "id": condition_id,
            "rule": '{"or": [{"<": [{"var": "height"}, 56]}, {">": [{"var": "bpm"}, 164]}]}',
            "data_sources": "[]",
        },
        "branches": [
            {
                "id": branch_id,
                "target_step_id": "example_step",
                "step_id": step_id,
                "condition_id": "non-existent-rule-group",  # No rule group with this ID exists
                "condition": None,
            }
        ],
    }
