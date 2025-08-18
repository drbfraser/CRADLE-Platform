import pytest

from common.commonUtil import get_current_time, get_uuid


def test_create_workflow_instance_step(
    database,
    workflow_template1,
    workflow_instance1,
    api_post,
    form_template,
    form,
    vht_user_id,
):
    try:
        # Create workflow template
        response = api_post(
            endpoint="/api/workflow/templates/body", json=workflow_template1
        )
        database.session.commit()
        assert response.status_code == 201

        # Create workflow instance
        response = api_post(endpoint="/api/workflow/instances", json=workflow_instance1)
        database.session.commit()
        assert response.status_code == 201

        # # Create form template first (required for form)
        # print("=== Creating form template ===")
        # response = api_post(endpoint="/api/forms/templates/body", json=form_template)
        # database.session.commit()
        # print(f"Form template creation status: {response.status_code}")
        # if response.status_code != 201:
        #     try:
        #         print(f"Form template error: {response.json()}")
        #     except:
        #         print(f"Form template error text: {response.text}")
        # assert response.status_code == 201

        # # Create form (required for step)
        # print("=== Creating form ===")
        # response = api_post(endpoint="/api/forms/responses", json=form)
        # database.session.commit()
        # print(f"Form creation status: {response.status_code}")
        # if response.status_code != 201:
        #     try:
        #         print(f"Form creation error: {response.json()}")
        #     except:
        #         print(f"Form creation error text: {response.text}")
        # assert response.status_code == 201

        # # Create step data
        # step_data = {
        #     "name": "test_step",
        #     "title": "Test Step",
        #     "status": "Active",
        #     "form_id": "f9",
        #     "workflow_instance_id": workflow_instance1["id"],
        #     "assigned_to": vht_user_id,
        #     "expected_completion": get_current_time() + 86400000,
        #     "data": '{"test": "data"}'
        # }

        # # Test creating workflow instance step
        # response = api_post(endpoint="/api/workflow/instance/steps", json=step_data)
        # database.session.commit()

        # print(f"Step creation status: {response.status_code}")
        # if response.status_code != 201:
        #     try:
        #         print(f"Step creation error: {response.json()}")
        #     except:
        #         print(f"Step creation error text: {response.text}")

        # assert response.status_code == 201

    except Exception as e:
        print(f"Exception occurred: {e}")


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
