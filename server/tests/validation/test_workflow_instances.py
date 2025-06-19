import pytest
from pydantic import ValidationError

from common.commonUtil import get_current_time
from tests.validation.test_workflow_instance_steps import (
    instance_step_with_invalid_data_should_return_validation_error,
    instance_step_with_valid_fields_should_return_none,
)
from validation.workflow_instances import WorkflowInstanceModel

VALID_INSTANCE_STEP = instance_step_with_valid_fields_should_return_none
INVALID_INSTANCE_STEP = instance_step_with_invalid_data_should_return_validation_error

ID = "workflow-instance-example-01"
NAME = "Workflow Instance Example"
TITLE = "Workflow Instance Example"
START_DATE = get_current_time()
CURRENT_STEP_ID = "workflow-instance-step-example-01"
LAST_EDITED = get_current_time()
LAST_EDITED_BY = 1243
COMPLETION_DATE = get_current_time()
STATUS = "Active"
WORK_TEMPLATE_ID = "workflow-template-example-01"
PATIENT_ID = "patient-example-01"
STEPS = [VALID_INSTANCE_STEP, VALID_INSTANCE_STEP]

workflow_instance_with_valid_fields_should_return_none = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "current_step_id": CURRENT_STEP_ID,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "completion_date": COMPLETION_DATE,
    "status": STATUS,
    "workflow_template_id": WORK_TEMPLATE_ID,
    "patient_id": PATIENT_ID,
    "steps": STEPS,
}

workflow_instance_with_no_steps_should_return_none = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "current_step_id": CURRENT_STEP_ID,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "completion_date": COMPLETION_DATE,
    "status": STATUS,
    "workflow_template_id": WORK_TEMPLATE_ID,
    "patient_id": PATIENT_ID,
    "steps": [],
}

workflow_instance_with_valid_missing_template_id_should_return_none = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "current_step_id": CURRENT_STEP_ID,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "completion_date": COMPLETION_DATE,
    "status": STATUS,
    "workflow_template_id": None,
    "patient_id": PATIENT_ID,
    "steps": STEPS,
}

workflow_instance_with_valid_missing_dates_should_return_none = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "current_step_id": CURRENT_STEP_ID,
    "last_edited": None,
    "last_edited_by": None,
    "completion_date": None,
    "status": STATUS,
    "workflow_template_id": None,
    "patient_id": PATIENT_ID,
    "steps": STEPS,
}

workflow_instance_with_invalid_edit_date_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "current_step_id": CURRENT_STEP_ID,
    "last_edited": START_DATE-100,
    "last_edited_by": LAST_EDITED_BY,
    "completion_date": COMPLETION_DATE,
    "status": STATUS,
    "workflow_template_id": None,
    "patient_id": PATIENT_ID,
    "steps": STEPS,
}

workflow_instance_with_invalid_completion_date_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "current_step_id": CURRENT_STEP_ID,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "completion_date": START_DATE - 100,
    "status": STATUS,
    "workflow_template_id": WORK_TEMPLATE_ID,
    "patient_id": PATIENT_ID,
    "steps": STEPS,
}

workflow_instance_with_missing_patient_id_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "current_step_id": CURRENT_STEP_ID,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "completion_date": COMPLETION_DATE,
    "status": STATUS,
    "workflow_template_id": WORK_TEMPLATE_ID,
    "patient_id": None,
    "steps": STEPS,
}

workflow_instance_with_invalid_step_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "current_step_id": CURRENT_STEP_ID,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "completion_date": COMPLETION_DATE,
    "status": STATUS,
    "workflow_template_id": WORK_TEMPLATE_ID,
    "patient_id": PATIENT_ID,
    "steps": [VALID_INSTANCE_STEP, INVALID_INSTANCE_STEP],
}

workflow_instance_with_invalid_status_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "current_step_id": CURRENT_STEP_ID,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "completion_date": COMPLETION_DATE,
    "status": "Hello",
    "workflow_template_id": WORK_TEMPLATE_ID,
    "patient_id": PATIENT_ID,
    "steps": STEPS,
}

@pytest.mark.parametrize(
    "json, expectation",
    [
        (workflow_instance_with_valid_fields_should_return_none, None),
        (workflow_instance_with_no_steps_should_return_none, None),
        (workflow_instance_with_valid_missing_template_id_should_return_none, None),
        (workflow_instance_with_valid_missing_dates_should_return_none, None),
        (workflow_instance_with_invalid_edit_date_should_return_validation_error, ValidationError),
        (workflow_instance_with_invalid_completion_date_should_return_validation_error, ValidationError),
        (workflow_instance_with_missing_patient_id_should_return_validation_error, ValidationError),
        (workflow_instance_with_invalid_step_should_return_validation_error, ValidationError),
        (workflow_instance_with_invalid_status_should_return_validation_error, ValidationError),
    ]
)
def test_workflow_instances(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            WorkflowInstanceModel(**json)

    else:
        try:
            WorkflowInstanceModel(**json)
        except Exception as e:
            raise AssertionError(f"Unexpected validation error from {e}") from e
