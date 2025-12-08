import pytest
from humps import decamelize

import data.db_operations as crud
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
def patient_id(create_patient, patient_info):
    """Create a patient and return its ID"""
    create_patient()
    return patient_info["id"]
