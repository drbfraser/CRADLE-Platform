from unittest.mock import patch

from server.tests.helpers import (
    TIMESTAMP_TOMORROW,
    get_uuid,
    make_workflow_instance,
    make_workflow_instance_step,
)
from service.workflow.workflow_service import WorkflowService
from validation.workflow_models import WorkflowInstanceModel

# NOTE: Must match a Patient in the database at the time of the test! Otherwise FK
#       constraint fails
PATIENT_ID = "49300028161"


def test_workflow_service__upsert_workflow_instance():
    """
    Checks that WorkflowService.upsert_workflow_instance() updates last_edited.
    """
    workflow_id = get_uuid()
    step_id = get_uuid()

    step_dict = make_workflow_instance_step(
        id=step_id, workflow_instance_id=workflow_id
    )
    workflow_dict = make_workflow_instance(
        id=workflow_id, patient_id=PATIENT_ID, steps=[step_dict]
    )
    workflow = WorkflowInstanceModel(**workflow_dict)

    assert workflow.last_edited != TIMESTAMP_TOMORROW
    assert workflow.steps[0].last_edited != TIMESTAMP_TOMORROW

    with patch(
        "service.workflow.workflow_service.get_current_time",
        return_value=TIMESTAMP_TOMORROW,
    ):
        WorkflowService.upsert_workflow_instance(workflow)

    upserted_workflow = WorkflowService.get_workflow_instance(workflow_id)
    assert upserted_workflow is not None

    assert upserted_workflow.id == workflow_id
    assert upserted_workflow.last_edited == TIMESTAMP_TOMORROW
    assert upserted_workflow.steps[0].id == step_id
    assert upserted_workflow.steps[0].last_edited == TIMESTAMP_TOMORROW
