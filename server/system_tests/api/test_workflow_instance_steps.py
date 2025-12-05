import pytest
from humps import decamelize

import data.db_operations as crud
from common.commonUtil import get_current_time, get_uuid
from common.print_utils import pretty_print
from models import (
    WorkflowInstanceOrm,
    WorkflowTemplateOrm,
)
from service.workflow.workflow_service import WorkflowService

# TODO: testing has only been done for simple steps.
# steps involving forms or rules have not been tested.


def test_get_workflow_instance_steps(api_get, sequential_workflow_view, patient_id):
    workflow_view = sequential_workflow_view
    workflow_view.instance.patient_id = patient_id

    try:
        WorkflowService.upsert_workflow_template(workflow_view.template)
        WorkflowService.upsert_workflow_instance(workflow_view.instance)

        response = api_get(
            endpoint=f"/api/workflow/instance/steps?workflow_instance_id={workflow_view.instance.id}"
        )

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        assert "items" in response_body
        assert len(response_body["items"]) == 2

        # Verify the steps are returned correctly
        step_ids = [step["id"] for step in response_body["items"]]
        assert "si-1" in step_ids
        assert "si-2" in step_ids

        # Test getting all workflow instance steps without filter
        response = api_get(endpoint="/api/workflow/instance/steps")

        response_body = decamelize(response.json())
        pretty_print(response_body)
        assert response.status_code == 200
        assert "items" in response_body
        assert len(response_body["items"]) >= 2

    finally:
        crud.delete_workflow(
            m=WorkflowTemplateOrm,
            delete_classification=True,
            id=workflow_view.template.id,
        )
        crud.delete_workflow(
            m=WorkflowInstanceOrm,
            id=workflow_view.instance.id,
        )


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


@pytest.fixture
def form_classification():
    return {
        "id": "wissfc",
        "name": "wissfc",
    }


@pytest.fixture
def form_template():
    return {
        "classification": {"id": "wissfc", "name": "wissfc"},
        "id": "wissft",
        "version": "V1",
        "questions": [],
    }


@pytest.fixture
def form(patient_id):
    return {
        "id": "wissf",
        "lang": "english",
        "form_template_id": "wissft",
        "form_classification_id": "wissfc",
        "patient_id": patient_id,
        "date_created": 1561011126,
        "questions": [],
    }
