from typing import Optional

import pytest
from humps import decamelize

import data.db_operations as crud
from common.api_utils import WorkflowInstanceStepIdPath
from common.print_utils import pretty_print
from models import (
    WorkflowInstanceOrm,
    WorkflowTemplateOrm,
)
from service.workflow.workflow_service import WorkflowService
from validation.workflow_api_models import (
    GetWorkflowInstanceStepsRequest,
    GetWorkflowInstanceStepsResponse,
)
from validation.workflow_models import WorkflowStepEvaluation

# TODO: testing has only been done for simple steps.
# steps involving forms or rules have not been tested.


def api_get_all_workflow_instance_steps(
    api_get, request: GetWorkflowInstanceStepsRequest
) -> GetWorkflowInstanceStepsResponse:
    """
    Helper function to send API request to get all steps for a workflow instance.
    Expects 200 OK.
    """
    response = api_get(
        endpoint="/api/workflow/instance/steps",
        json=request.model_dump(),
    )

    assert (
        response.status_code == 200
    ), f"Failed to get workflow instance steps: {response.text}"

    response_json = decamelize(response.json())
    pretty_print(response_json)

    return GetWorkflowInstanceStepsResponse(**response_json)


def test_get_workflow_instance_steps(api_get, sequential_workflow_view, patient_id):
    workflow_view = sequential_workflow_view
    workflow_view.instance.patient_id = patient_id

    try:
        WorkflowService.upsert_workflow_template(workflow_view.template)
        WorkflowService.upsert_workflow_instance(workflow_view.instance)

        response = api_get_all_workflow_instance_steps(
            api_get,
            GetWorkflowInstanceStepsRequest(
                workflow_instance_id=workflow_view.instance.id
            ),
        )

        assert len(response.items) == len(workflow_view.instance.steps)

        # Verify the steps are returned correctly
        for actual_step in response.items:
            expected_step = workflow_view.instance.get_instance_step(actual_step.id)
            assert expected_step
            assert actual_step == expected_step

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


def api_evaluate_step(
    api_get, path: WorkflowInstanceStepIdPath, expected_code: int
) -> Optional[WorkflowStepEvaluation]:
    """
    Helper function to send API request for evaluating a workflow step
    and validating the response.
    """
    response = api_get(
        endpoint=f"/api/workflow/instance/steps/{path.workflow_instance_step_id}/evaluate"
    )
    assert response.status_code == expected_code

    if response.status_code == 200:
        step_evaluation_resp = decamelize(response.json())
        return WorkflowStepEvaluation(**step_evaluation_resp)
    return None


def test_evaluate_step(api_get, sequential_workflow_view, patient_id):
    workflow_view = sequential_workflow_view
    workflow_view.instance.patient_id = patient_id

    try:
        WorkflowService.upsert_workflow_template(workflow_view.template)
        WorkflowService.upsert_workflow_instance(workflow_view.instance)

        step_1_evaluation = api_evaluate_step(
            api_get,
            WorkflowInstanceStepIdPath(workflow_instance_step_id="si-1"),
            expected_code=200,
        )
        step_2_evaluation = api_evaluate_step(
            api_get,
            WorkflowInstanceStepIdPath(workflow_instance_step_id="si-2"),
            expected_code=200,
        )
        # sanity checks, workflow planner unit tests already have more thorough checks
        assert step_1_evaluation.selected_branch_id == "b-1"
        assert step_2_evaluation.selected_branch_id == None

        api_evaluate_step(
            api_get,
            WorkflowInstanceStepIdPath(
                workflow_instance_step_id="this-step-shouldnt-exist",
            ),
            expected_code=404,
        )

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
