import pytest
from pydantic import ValidationError

from common.commonUtil import get_current_time
from tests.validation.test_forms import (
    form_missing_required_field_questions_should_throw_exception,
    form_with_valid_fields_should_return_none,
)
from tests.validation.test_rule_groups import (
    rule_group_with_invalid_json_logic_should_return_validation_error,
    rule_group_with_valid_fields_should_return_none,
)
from validation.workflow_instance_steps import WorkflowInstanceStepModel

VALID_FORM = form_with_valid_fields_should_return_none
INVALID_FORM = form_missing_required_field_questions_should_throw_exception

VALID_RULE_GROUP = rule_group_with_valid_fields_should_return_none
INVALID_RULE_GROUP = rule_group_with_invalid_json_logic_should_return_validation_error

ID = "workflow-instance-step-example-01"
NAME = "Workflow Instance Step Example"
TITLE = "Workflow Instance Step Example"
START_DATE = get_current_time()
LAST_EDITED = get_current_time()
COMPLETION_DATE = get_current_time()
EXPECTED_COMPLETION = get_current_time()
STATUS = "Active"
DATA = '{"answers": {"number": "123"}}'
TRIGGERED_BY = "workflow-instance-step-example-02"
ASSIGNED_TO = 13432

instance_step_with_valid_fields_should_return_none = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "last_edited": LAST_EDITED,
    "completion_date": COMPLETION_DATE,
    "expected_completion": EXPECTED_COMPLETION,
    "status": STATUS,
    "data": DATA,
    "triggered_by": TRIGGERED_BY,
    "form_id": VALID_FORM["id"],
    "form": VALID_FORM,
    "assigned_to": ASSIGNED_TO,
    "workflow_instance_id": "workflow-instance-example-01",
    "condition_id": VALID_RULE_GROUP["id"],
    "condition": VALID_RULE_GROUP
}

instance_step_with_valid_missing_fields_should_return_none = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "last_edited": None,
    "completion_date": None,
    "expected_completion": None,
    "status": STATUS,
    "data": None,
    "triggered_by": TRIGGERED_BY,
    "form_id": VALID_FORM["id"],
    "form": None,
    "assigned_to": None,
    "workflow_instance_id": "workflow-instance-example-01",
    "condition_id": VALID_RULE_GROUP["id"],
    "condition": VALID_RULE_GROUP
}

instance_step_with_invalid_condition_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "last_edited": LAST_EDITED,
    "completion_date": COMPLETION_DATE,
    "expected_completion": EXPECTED_COMPLETION,
    "status": STATUS,
    "data": DATA,
    "triggered_by": TRIGGERED_BY,
    "form_id": VALID_FORM["id"],
    "form": VALID_FORM,
    "assigned_to": ASSIGNED_TO,
    "workflow_instance_id": "workflow-instance-example-01",
    "condition_id": INVALID_RULE_GROUP["id"],
    "condition": INVALID_RULE_GROUP
}

instance_step_with_invalid_data_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "last_edited": LAST_EDITED,
    "completion_date": COMPLETION_DATE,
    "expected_completion": EXPECTED_COMPLETION,
    "status": STATUS,
    "data": "Hello", # Not valid JSON
    "triggered_by": TRIGGERED_BY,
    "form_id": VALID_FORM["id"],
    "form": VALID_FORM,
    "assigned_to": ASSIGNED_TO,
    "workflow_instance_id": "workflow-instance-example-01",
    "condition_id": VALID_RULE_GROUP["id"],
    "condition": VALID_RULE_GROUP
}

instance_step_with_invalid_edit_date_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "last_edited": START_DATE - 100,
    "completion_date": COMPLETION_DATE,
    "expected_completion": EXPECTED_COMPLETION,
    "status": STATUS,
    "data": DATA,
    "triggered_by": TRIGGERED_BY,
    "form_id": VALID_FORM["id"],
    "form": VALID_FORM,
    "assigned_to": ASSIGNED_TO,
    "workflow_instance_id": "workflow-instance-example-01",
    "condition_id": VALID_RULE_GROUP["id"],
    "condition": VALID_RULE_GROUP
}

instance_step_with_invalid_completion_date_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "last_edited": LAST_EDITED,
    "completion_date": START_DATE - 100,
    "expected_completion": EXPECTED_COMPLETION,
    "status": STATUS,
    "data": DATA,
    "triggered_by": TRIGGERED_BY,
    "form_id": VALID_FORM["id"],
    "form": VALID_FORM,
    "assigned_to": ASSIGNED_TO,
    "workflow_instance_id": "workflow-instance-example-01",
    "condition_id": VALID_RULE_GROUP["id"],
    "condition": VALID_RULE_GROUP
}

instance_step_with_invalid_status_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "start_date": START_DATE,
    "last_edited": LAST_EDITED,
    "completion_date": COMPLETION_DATE,
    "expected_completion": EXPECTED_COMPLETION,
    "status": "Hello",
    "data": DATA,
    "triggered_by": TRIGGERED_BY,
    "form_id": VALID_FORM["id"],
    "form": VALID_FORM,
    "assigned_to": ASSIGNED_TO,
    "workflow_instance_id": "workflow-instance-example-01",
    "condition_id": VALID_RULE_GROUP["id"],
    "condition": VALID_RULE_GROUP
}

@pytest.mark.parametrize(
    "json, expectation",
    [
        (instance_step_with_valid_fields_should_return_none, None),
        (instance_step_with_valid_missing_fields_should_return_none, None),
        (instance_step_with_invalid_condition_should_return_validation_error, ValidationError),
        (instance_step_with_invalid_data_should_return_validation_error, ValidationError),
        (instance_step_with_invalid_edit_date_should_return_validation_error, ValidationError),
        (instance_step_with_invalid_completion_date_should_return_validation_error, ValidationError),
        (instance_step_with_invalid_status_should_return_validation_error, ValidationError),
    ]
)
def test_workflow_instance_steps(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            WorkflowInstanceStepModel(**json)
    else:
        try:
            WorkflowInstanceStepModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error from {e}") from e
