import pytest
from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_current_time, get_uuid
from common.print_utils import pretty_print
from models import WorkflowInstanceOrm, WorkflowTemplateOrm
from service.workflow.workflow_service import WorkflowService
from validation.workflow_models import WorkflowInstanceModel, WorkflowTemplateModel


def test_create_workflow_instance__success(patient_id, workflow_template1, api_post):
    try:
        # Create workflow template
        WorkflowService.upsert_workflow_template(
            WorkflowTemplateModel(**workflow_template1)
        )

        # Create workflow instance
        response = api_post(
            endpoint="/api/workflow/instances",
            json={
                "workflow_template_id": workflow_template1["id"],
                "patient_id": patient_id,
            },
        )

        assert response.status_code == 201

        response_body = decamelize(response.json())
        pretty_print(response_body)

        # sanity check
        assert response_body["workflow_template_id"] == workflow_template1["id"]
        assert response_body["status"] == "Pending"
        assert response_body["patient_id"] == patient_id

        # check instance actually persisted
        workflow_instance = WorkflowService.get_workflow_instance(response_body["id"])
        assert workflow_instance.status == "Pending"
        assert workflow_instance.patient_id == patient_id

    finally:
        crud.delete_workflow(
            m=WorkflowInstanceOrm,
            id=response_body["id"],
        )
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template1["id"],
        )


def test_create_workflow_instance__workflow_template_not_found(patient_id, api_post):
    response = api_post(
        endpoint="/api/workflow/instances",
        json={
            "workflow_template_id": "this-template-shouldnt-exist",
            "patient_id": patient_id,
        },
    )

    assert response.status_code == 404

    response_body = decamelize(response.json())
    assert "Workflow template with ID" in response_body["description"]


def test_create_workflow_instance__patient_not_found(workflow_template1, api_post):
    try:
        WorkflowService.upsert_workflow_template(
            WorkflowTemplateModel(**workflow_template1)
        )

        response = api_post(
            endpoint="/api/workflow/instances",
            json={
                "workflow_template_id": workflow_template1["id"],
                "patient_id": "this-patient-shouldnt-exist",
            },
        )

        assert response.status_code == 404

        response_body = decamelize(response.json())
        assert "Patient with ID" in response_body["description"]

    finally:
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template1["id"],
        )


def test_getting_workflow_instance(
    workflow_instance1,
    workflow_instance2,
    workflow_template1,
    api_get,
):
    try:
        # Create workflow template
        WorkflowService.upsert_workflow_template(
            WorkflowTemplateModel(**workflow_template1)
        )

        # Create the first workflow instance
        WorkflowService.upsert_workflow_instance(
            WorkflowInstanceModel(**workflow_instance1)
        )

        # Create the second workflow instance
        WorkflowService.upsert_workflow_instance(
            WorkflowInstanceModel(**workflow_instance2)
        )

        # Get without params first
        print("About to retrieve instances...")
        response = api_get(endpoint="/api/workflow/instances")
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200

        assert "items" in response_body
        instance_ids = [item["id"] for item in response_body["items"]]
        assert workflow_instance1["id"] in instance_ids
        assert workflow_instance2["id"] in instance_ids

        # Get with status "Active"
        response = api_get(endpoint="/api/workflow/instances?status=Active")
        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200

        our_active_instances = [
            item
            for item in response_body["items"]
            if item["id"] == workflow_instance1["id"]
        ]
        assert len(our_active_instances) == 1
        assert our_active_instances[0]["status"] == "Active"

        # Get with template_id
        template_id = workflow_template1["id"]
        response = api_get(
            endpoint=f"/api/workflow/instances?workflow_template_id={template_id}"
        )
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 200
        assert "items" in response_body
        assert len(response_body["items"]) == 2
        assert response_body["items"][0]["workflow_template_id"] == template_id

        # Get with patient_id
        patient_id = workflow_instance1["patient_id"]
        response = api_get(endpoint=f"/api/workflow/instances?patient_id={patient_id}")
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 200
        assert "items" in response_body
        assert len(response_body["items"]) == 2
        assert response_body["items"][0]["patient_id"] == patient_id

        # Get with multiple parameters
        response = api_get(
            endpoint=f"/api/workflow/instances?patient_id={patient_id}&status=Active&workflow_template_id={template_id}"
        )
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 200
        assert "items" in response_body
        assert len(response_body["items"]) == 1

    finally:
        crud.delete_workflow(
            m=WorkflowInstanceOrm,
            id=workflow_instance1["id"],
        )
        crud.delete_workflow(
            m=WorkflowInstanceOrm,
            id=workflow_instance2["id"],
        )
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template1["id"],
        )


def test_patch_workflow_instance(
    database, workflow_instance1, workflow_template1, api_patch, api_get
):
    try:
        # First create the workflow template
        WorkflowService.upsert_workflow_template(
            WorkflowTemplateModel(**workflow_template1)
        )

        # Create the first workflow instance
        WorkflowService.upsert_workflow_instance(
            WorkflowInstanceModel(**workflow_instance1)
        )

        # Update the name and status
        # TODO: status should not be able to be modified
        patch_data = {"name": "updated_workflow_name", "status": "Completed"}

        response = api_patch(
            endpoint=f"/api/workflow/instances/{workflow_instance1['id']}",
            json=patch_data,
        )
        database.session.commit()
        response_body = decamelize(response.json())
        pretty_print(response_body)

        assert response.status_code == 200
        assert response_body["name"] == "updated_workflow_name"
        assert response_body["status"] == "Completed"
        assert response_body["description"] == workflow_instance1["description"]
        assert response_body["patient_id"] == workflow_instance1["patient_id"]

        # Verify the changes persisted by getting the instance
        response = api_get(
            endpoint=f"/api/workflow/instances/{workflow_instance1['id']}"
        )
        response_body = decamelize(response.json())

        assert response.status_code == 200
        assert response_body["name"] == "updated_workflow_name"
        assert response_body["status"] == "Completed"

    finally:
        crud.delete_workflow(
            m=WorkflowInstanceOrm,
            id=workflow_instance1["id"],
        )
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_template1["id"],
        )


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
def workflow_instance2(vht_user_id, patient_id, workflow_template1):
    instance_id = get_uuid()
    return {
        "id": instance_id,
        "name": "workflow_instance2",
        "description": "Workflow Instance 2",
        "status": "Completed",
        "start_date": get_current_time(),
        "current_step_id": None,
        "last_edited": get_current_time() + 44345,
        "completion_date": get_current_time() + 88690,
        "patient_id": patient_id,
        "workflow_template_id": workflow_template1["id"],
        "steps": [],
    }


@pytest.fixture
def workflow_template1(vht_user_id):
    template_id = get_uuid()
    classification_id = get_uuid()
    return {
        "id": template_id,
        "name": "workflow_example1",
        "description": "workflow_example1",
        "archived": False,
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
def patient_id(create_patient, patient_info):
    """Create a patient and return its ID"""
    create_patient()
    return patient_info["id"]
