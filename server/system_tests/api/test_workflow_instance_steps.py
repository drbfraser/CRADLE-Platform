from typing import Optional

import pytest
from humps import decamelize

import data.db_operations as crud
from common.api_utils import WorkflowInstanceStepIdPath
from common.print_utils import pretty_print
from models import (
    FormOrm,
)
from service.workflow.workflow_service import WorkflowService
from validation.workflow_api_models import (
    GetWorkflowInstanceStepsRequest,
    GetWorkflowInstanceStepsResponse,
    WorkflowInstanceStepPatchModel,
)
from validation.workflow_models import WorkflowInstanceStepModel, WorkflowStepEvaluation

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


def api_get_workflow_instance_step(
    api_get, path: WorkflowInstanceStepIdPath
) -> WorkflowInstanceStepModel:
    """
    Helper function to send API request to get a workflow instance step.
    Expects 200 OK.
    """
    response = api_get(
        endpoint=f"/api/workflow/instance/steps/{path.workflow_instance_step_id}",
    )

    assert (
        response.status_code == 200
    ), f"Failed to get workflow instance step: {response.text}"

    response_json = decamelize(response.json())
    pretty_print(response_json)

    return WorkflowInstanceStepModel(**response_json)


def api_patch_workflow_instance_step(
    api_patch,
    path: WorkflowInstanceStepIdPath,
    request: WorkflowInstanceStepPatchModel,
    expected_code: int = 200,
) -> WorkflowInstanceStepModel:
    """
    Helper function to send API request to patch a workflow instance step.
    Expects 200 OK.
    """
    response = api_patch(
        endpoint=f"/api/workflow/instance/steps/{path.workflow_instance_step_id}",
        json=request.model_dump(),
    )
    assert response.status_code == expected_code

    if response.status_code == 200:
        response_json = decamelize(response.json())
        pretty_print(response_json)
        return WorkflowInstanceStepModel(**response_json)

    return None


def api_evaluate_workflow_instance_step(
    api_get, path: WorkflowInstanceStepIdPath, expected_code: int = 200
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


def api_archive_workflow_instance_step_form(
    api_post, path: WorkflowInstanceStepIdPath, expected_code: int = 200
) -> Optional[WorkflowInstanceStepModel]:
    """
    Helper function to send API request for archiving the form associated with a
    workflow instance step and validating the response.
    """
    response = api_post(
        endpoint=f"/api/workflow/instance/steps/{path.workflow_instance_step_id}/archive_form"
    )
    assert response.status_code == expected_code

    if response.status_code == 200:
        step_evaluation_resp = decamelize(response.json())
        return WorkflowInstanceStepModel(**step_evaluation_resp)
    return None


def test_get_workflow_instance_steps(api_get, sequential_workflow_view_with_db):
    workflow_view = sequential_workflow_view_with_db

    response = api_get_all_workflow_instance_steps(
        api_get,
        GetWorkflowInstanceStepsRequest(workflow_instance_id=workflow_view.instance.id),
    )

    assert len(response.items) == len(workflow_view.instance.steps)

    # Verify the steps are returned correctly
    for actual_step in response.items:
        expected_step = workflow_view.instance.get_instance_step(actual_step.id)
        assert expected_step
        assert actual_step == expected_step


def test_evaluate_workflow_instance_step(api_get, sequential_workflow_view_with_db):
    step_1_evaluation = api_evaluate_workflow_instance_step(
        api_get,
        WorkflowInstanceStepIdPath(workflow_instance_step_id="si-1"),
    )
    step_2_evaluation = api_evaluate_workflow_instance_step(
        api_get,
        WorkflowInstanceStepIdPath(workflow_instance_step_id="si-2"),
    )
    # sanity checks, workflow planner unit tests already have more thorough checks
    assert step_1_evaluation.selected_branch_id == "b-1"
    assert step_2_evaluation.selected_branch_id == None

    api_evaluate_workflow_instance_step(
        api_get,
        WorkflowInstanceStepIdPath(
            workflow_instance_step_id="this-step-shouldnt-exist",
        ),
        expected_code=404,
    )


def test_patch_workflow_instance_step(
    api_get, api_patch, sequential_workflow_view_with_db, vht_user_id
):
    step = WorkflowService.get_workflow_instance_step("si-1")

    assert step.assigned_to is None
    assert vht_user_id is not None

    response = api_patch_workflow_instance_step(
        api_patch,
        WorkflowInstanceStepIdPath(workflow_instance_step_id="si-1"),
        WorkflowInstanceStepPatchModel(assigned_to=vht_user_id),
    )
    assert response.assigned_to == vht_user_id

    # Check change persisted
    response = api_get_workflow_instance_step(
        api_get, WorkflowInstanceStepIdPath(workflow_instance_step_id="si-1")
    )
    assert response.assigned_to == vht_user_id

    api_patch_workflow_instance_step(
        api_patch,
        WorkflowInstanceStepIdPath(workflow_instance_step_id="si-1"),
        WorkflowInstanceStepPatchModel(
            assigned_to=-1000
        ),  # assumes user ID doesn't exit
        expected_code=404,
    )
    api_patch_workflow_instance_step(
        api_patch,
        WorkflowInstanceStepIdPath(workflow_instance_step_id="si-1"),
        WorkflowInstanceStepPatchModel(form_id="this-form-shouldnt-exist"),
        expected_code=404,
    )


def test_archive_workflow_instance_step_form(
    api_get, api_patch, sequential_workflow_view_with_db, form_with_db
):
    form = form_with_db

    step = WorkflowService.get_workflow_instance_step("si-1")
    step.form_id = form["id"]

    WorkflowService.upsert_workflow_instance_step(step)
    step = WorkflowService.get_workflow_instance_step("si-1")

    assert step.form_id == form["id"]
    assert step.form is not None
    assert step.form["archived"] == False

    response = api_archive_workflow_instance_step_form(
        api_patch,
        WorkflowInstanceStepIdPath(workflow_instance_step_id="si-1"),
    )
    assert response.form_id is None
    assert response.form is None

    # Check change persisted
    response = api_get_workflow_instance_step(
        api_get, WorkflowInstanceStepIdPath(workflow_instance_step_id="si-1")
    )
    assert response.form_id is None
    assert response.form is None

    # The pytest test session still has a transaction snapshot from before the API call.
    # The API (Flask process) updated the database in its own session.
    # Commit the test session to start a fresh transaction and see the latest DB values.
    crud.db_session.commit()

    form_orm = crud.read(FormOrm, id=form["id"])
    assert form_orm.archived == True


@pytest.fixture
def patient_id(create_patient, patient_info):
    """Create a patient and return its ID"""
    create_patient()
    return patient_info["id"]
