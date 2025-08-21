import pytest
from humps import decamelize

from common.commonUtil import get_current_time, get_uuid
from common.print_utils import pretty_print
from data import crud
from models import (
    WorkflowInstanceOrm,
    WorkflowInstanceStepOrm,
    WorkflowTemplateOrm,
)


def test_create_workflow_instance_step(
    database,
    workflow_template1,
    workflow_instance1,
    api_post,
    vht_user_id,
):
    try:
        # Create workflow template
        response = api_post(
            endpoint="/api/workflow/templates/body", json=workflow_template1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create workflow instance
        response = api_post(endpoint="/api/workflow/instances", json=workflow_instance1)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        minimal_workflow_instance_step = {
            "id": get_uuid(),
            "name": "Test Step 1",
            "description": "Test Step 1",
            "start_date": get_current_time(),
            "last_edited": get_current_time() + 44345,
            "status": "Active",
            "workflow_instance_id": workflow_instance1["id"],
        }

        # Test creating workflow instance step
        response = api_post(
            endpoint="/api/workflow/instance/steps", json=minimal_workflow_instance_step
        )
        database.session.commit()

        if response.status_code != 201:
            print(f"Error response status: {response.status_code}")
            print(f"Error response text: {response.text}")

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

    finally:
        crud.delete_all(
            WorkflowInstanceStepOrm, workflow_instance_id=workflow_instance1["id"]
        )
        crud.delete_all(WorkflowInstanceOrm, id=workflow_instance1["id"])
        crud.delete_all(WorkflowTemplateOrm, id=workflow_template1["id"])


def test_get_workflow_instance_steps(
    database,
    workflow_template1,
    workflow_instance1,
    api_post,
    api_get,
    vht_user_id,
):
    try:
        # Create workflow template
        response = api_post(
            endpoint="/api/workflow/templates/body", json=workflow_template1
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create workflow instance
        response = api_post(endpoint="/api/workflow/instances", json=workflow_instance1)
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 201

        # Create first workflow instance step
        minimal_workflow_instance_step1 = {
            "id": get_uuid(),
            "name": "Test Step 1",
            "description": "Test Step 1",
            "start_date": get_current_time(),
            "last_edited": get_current_time() + 44345,
            "status": "Active",
            "completion_date": None,
            "expected_completion": None,
            "workflow_instance_id": workflow_instance1["id"],
        }

        response = api_post(
            endpoint="/api/workflow/instance/steps", json=minimal_workflow_instance_step1
        )
        database.session.commit()
        assert response.status_code == 201

        # Create second workflow instance step
        minimal_workflow_instance_step2 = {
            "id": get_uuid(),
            "name": "Test Step 2",
            "description": "Test Step 2",
            "start_date": get_current_time() + 44345,
            "last_edited": get_current_time() + 44345,
            "status": "Active",  
            "completion_date": None,
            "expected_completion": None,
            "workflow_instance_id": workflow_instance1["id"],
        }

        response = api_post(
            endpoint="/api/workflow/instance/steps", json=minimal_workflow_instance_step2
        )
        database.session.commit()

        if response.status_code != 201:
            print(f"Error response status: {response.status_code}")
            print(f"Error response text: {response.text}")

        assert response.status_code == 201

        # Test getting workflow instance steps with workflow_instance_id filter
        response = api_get(
            endpoint=f"/api/workflow/instance/steps?workflow_instance_id={workflow_instance1['id']}"
        )
        
        if response.status_code != 200:
            print(f"Error response status: {response.status_code}")
            print(f"Error response text: {response.text}")

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        assert "items" in response_body
        assert len(response_body["items"]) == 2
        
        # Verify the steps are returned correctly
        step_names = [step["name"] for step in response_body["items"]]
        assert "Test Step 1" in step_names
        assert "Test Step 2" in step_names

        # Test getting all workflow instance steps without filter
        response = api_get(endpoint="/api/workflow/instance/steps")
        
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        assert "items" in response_body
        assert len(response_body["items"]) >= 2

    finally:
        crud.delete_all(
            WorkflowInstanceStepOrm, workflow_instance_id=workflow_instance1["id"]
        )
        crud.delete_all(WorkflowInstanceOrm, id=workflow_instance1["id"])
        crud.delete_all(WorkflowTemplateOrm, id=workflow_template1["id"])


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


@pytest.fixture
def workflow_instance1(vht_user_id, patient_id, workflow_template1):
    instance_id = get_uuid()
    return {
        "id": instance_id,
        "name": "workflow_instance1",
        "description": "Workflow Instance 1",
        "status": "Active",
        "start_date": get_current_time(),
        "current_step_id": None,
        "last_edited": get_current_time() + 44345,
        "completion_date": None,
        "patient_id": patient_id,
        "workflow_template_id": workflow_template1["id"],
        "steps": [],
    }


@pytest.fixture
def patient_id(create_patient, patient_info):
    """Create a patient and return its ID"""
    create_patient()
    return patient_info["id"]
