import pytest
from pydantic import ValidationError

from common.commonUtil import get_current_time
from tests.validation.test_rule_groups import (
    rule_group_with_invalid_json_logic_should_return_validation_error,
    rule_group_with_valid_fields_should_return_none,
)
from tests.validation.test_workflow_classifications import (
    workflow_classification_with_valid_fields_should_return_none,
    workflow_classification_with_wrong_name_type_should_return_validation_error,
)
from tests.validation.test_workflow_template_steps import (
    template_step_with_invalid_form_should_return_validation_error,
    template_step_with_valid_fields_should_return_none,
)
from validation.workflow_templates import WorkflowTemplateWithStepsAndClassification

"""Template steps to be used"""
VALID_WORKFLOW_TEMPLATE_STEP = template_step_with_valid_fields_should_return_none
INVALID_WORKFLOW_TEMPLATE_STEP = (
    template_step_with_invalid_form_should_return_validation_error
)

"""Workflow classifications to be used"""
VALID_WORKFLOW_CLASSIFICATION = (
    workflow_classification_with_valid_fields_should_return_none
)
INVALID_WORKFLOW_CLASSIFICATION = (
    workflow_classification_with_wrong_name_type_should_return_validation_error
)

"""Rule group used for initial condition"""
VALID_RULE_GROUP = rule_group_with_valid_fields_should_return_none
INVALID_RULE_GROUP = rule_group_with_invalid_json_logic_should_return_validation_error

ID = "workflow-template-example-01"
NAME = "Workflow Template Model Example"
DESCRIPTION = "Workflow Template Model Example"
ARCHIVED = True
DATE_CREATED = get_current_time()
LAST_EDITED = get_current_time()
LAST_EDITED_BY = 1345344
VERSION = "0"


workflow_template_with_valid_fields_should_return_none = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "archived": ARCHIVED,
    "date_created": DATE_CREATED,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "version": VERSION,
    "initial_condition_id": VALID_RULE_GROUP["id"],
    "initial_condition": VALID_RULE_GROUP,
    "classification_id": VALID_WORKFLOW_CLASSIFICATION["id"],
    "classification": VALID_WORKFLOW_CLASSIFICATION,
    "steps": [VALID_WORKFLOW_TEMPLATE_STEP],
}

workflow_template_with_valid_missing_fields_should_return_none = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "archived": ARCHIVED,
    "date_created": DATE_CREATED,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "version": VERSION,
    "initial_condition_id": "",
    "initial_condition": None,
    "classification_id": "",
    "classification": None,
    "steps": [],
}

workflow_template_with_multiple_valid_steps_should_return_none = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "archived": ARCHIVED,
    "date_created": DATE_CREATED,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "version": VERSION,
    "initial_condition_id": VALID_RULE_GROUP["id"],
    "initial_condition": VALID_RULE_GROUP,
    "classification_id": VALID_WORKFLOW_CLASSIFICATION["id"],
    "classification": VALID_WORKFLOW_CLASSIFICATION,
    "steps": [VALID_WORKFLOW_TEMPLATE_STEP, VALID_WORKFLOW_TEMPLATE_STEP],
}

workflow_template_with_missing_last_edited_by_field_should_return_none = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "archived": ARCHIVED,
    "date_created": DATE_CREATED,
    "last_edited": None,
    "last_edited_by": None,
    "version": VERSION,
    "initial_condition_id": VALID_RULE_GROUP["id"],
    "initial_condition": VALID_RULE_GROUP,
    "classification_id": VALID_WORKFLOW_CLASSIFICATION["id"],
    "classification": VALID_WORKFLOW_CLASSIFICATION,
    "steps": [VALID_WORKFLOW_TEMPLATE_STEP, VALID_WORKFLOW_TEMPLATE_STEP],
}

workflow_template_with_invalid_condition_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "archived": ARCHIVED,
    "date_created": DATE_CREATED,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "version": VERSION,
    "initial_condition_id": INVALID_RULE_GROUP["id"],
    "initial_condition": INVALID_RULE_GROUP,
    "classification_id": VALID_WORKFLOW_CLASSIFICATION["id"],
    "classification": VALID_WORKFLOW_CLASSIFICATION,
    "steps": [VALID_WORKFLOW_TEMPLATE_STEP],
}

workflow_template_with_invalid_classification_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "archived": ARCHIVED,
    "date_created": DATE_CREATED,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "version": VERSION,
    "initial_condition_id": VALID_RULE_GROUP["id"],
    "initial_condition": VALID_RULE_GROUP,
    "classification_id": INVALID_WORKFLOW_CLASSIFICATION["id"],
    "classification": INVALID_WORKFLOW_CLASSIFICATION,
    "steps": [VALID_WORKFLOW_TEMPLATE_STEP],
}

workflow_template_with_invalid_steps_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "archived": ARCHIVED,
    "date_created": DATE_CREATED,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "version": VERSION,
    "initial_condition_id": VALID_RULE_GROUP["id"],
    "initial_condition": VALID_RULE_GROUP,
    "classification_id": VALID_WORKFLOW_CLASSIFICATION["id"],
    "classification": VALID_WORKFLOW_CLASSIFICATION,
    "steps": [VALID_WORKFLOW_TEMPLATE_STEP, INVALID_WORKFLOW_TEMPLATE_STEP],
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (workflow_template_with_valid_fields_should_return_none, None),
        (workflow_template_with_valid_missing_fields_should_return_none, None),
        (workflow_template_with_multiple_valid_steps_should_return_none, None),
        (workflow_template_with_missing_last_edited_by_field_should_return_none, None),
        (
            workflow_template_with_invalid_condition_should_return_validation_error,
            ValidationError,
        ),
        (
            workflow_template_with_invalid_classification_should_return_validation_error,
            ValidationError,
        ),
        (
            workflow_template_with_invalid_steps_should_return_validation_error,
            ValidationError,
        ),
    ],
)
def test_workflow_templates(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            WorkflowTemplateWithStepsAndClassification(**json)
    else:
        try:
            WorkflowTemplateWithStepsAndClassification(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error from {e}") from e
