import pytest
from pydantic import ValidationError

from common.commonUtil import get_current_time
from tests.validation.test_form_templates import (
    template_missing_required_field_classification_should_throw_exception,
    template_with_valid_fields_and_no_question_should_return_none,
    template_with_valid_fields_and_one_question_should_return_none,
)
from tests.validation.test_rule_groups import (
    rule_group_with_invalid_json_rule_should_return_validation_error,
    rule_group_with_valid_fields_should_return_none,
)
from tests.validation.test_workflow_template_step_branches import (
    step_branch_with_invalid_ID_should_return_validation_error,
    step_branch_with_valid_fields_should_return_none,
)
from validation.workflow_template_steps import WorkflowTemplateStepModel

EXAMPLE_VALID_RULE = rule_group_with_valid_fields_should_return_none

EXAMPLE_INVALID_RULE = rule_group_with_invalid_json_rule_should_return_validation_error

VALID_BRANCH_WITH_CONDITION = step_branch_with_valid_fields_should_return_none
INVALID_BRANCH_WITH_CONDITION = (
    step_branch_with_invalid_ID_should_return_validation_error
)

VALID_FORM_WITH_QUESTION = (
    template_with_valid_fields_and_one_question_should_return_none
)
VALID_FORM_WITHOUT_QUESTION = (
    template_with_valid_fields_and_no_question_should_return_none
)
INVALID_FORM_WITH_QUESTION = (
    template_missing_required_field_classification_should_throw_exception
)

# Steps used to test
ID = "step-example-03"
NAME = "heart_rate_check"
DESCRIPTION = "Heart Rate Check"
EXPECTED_COMPLETION = get_current_time()
LAST_EDITED = get_current_time()

template_step_with_valid_fields_should_return_none = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "form_id": VALID_FORM_WITH_QUESTION["id"],
    "form": VALID_FORM_WITH_QUESTION,
    "workflow_template_id": "workflow-template-example-01",
    "condition_id": EXAMPLE_VALID_RULE["id"],
    "condition": EXAMPLE_VALID_RULE,
    "branches": [VALID_BRANCH_WITH_CONDITION],
}

template_step_with_valid_fields_and_multiple_branches_should_return_none = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "form_id": VALID_FORM_WITH_QUESTION["id"],
    "form": VALID_FORM_WITH_QUESTION,
    "workflow_template_id": "workflow-template-example-01",
    "condition_id": EXAMPLE_VALID_RULE["id"],
    "condition": EXAMPLE_VALID_RULE,
    "branches": [VALID_BRANCH_WITH_CONDITION, VALID_BRANCH_WITH_CONDITION],
}

template_step_with_valid_fields_and_no_branches_should_return_none = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": None,
    "form_id": VALID_FORM_WITHOUT_QUESTION["id"],
    "form": VALID_FORM_WITH_QUESTION,
    "workflow_template_id": "workflow-template-example-01",
    "condition_id": EXAMPLE_VALID_RULE["id"],
    "condition": EXAMPLE_VALID_RULE,
    "branches": [],
}

template_step_with_invalid_form_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "form_id": INVALID_FORM_WITH_QUESTION["id"],
    "form": INVALID_FORM_WITH_QUESTION,
    "workflow_template_id": "workflow-template-example-01",
    "condition_id": EXAMPLE_VALID_RULE["id"],
    "condition": EXAMPLE_VALID_RULE,
    "branches": [],
}

template_step_with_missing_field_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "form_id": INVALID_FORM_WITH_QUESTION["id"],
    "form": INVALID_FORM_WITH_QUESTION,
    "workflow_template_id": "workflow-template-example-01",
    "condition_id": EXAMPLE_VALID_RULE["id"],
    "condition": EXAMPLE_VALID_RULE,
}

template_step_with_invalid_condition_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "form_id": VALID_FORM_WITH_QUESTION["id"],
    "form": VALID_FORM_WITH_QUESTION,
    "workflow_template_id": "workflow-template-example-01",
    "condition_id": EXAMPLE_INVALID_RULE["id"],
    "condition": EXAMPLE_INVALID_RULE,
    "branches": [VALID_BRANCH_WITH_CONDITION, VALID_BRANCH_WITH_CONDITION],
}

template_step_with_invalid_branch_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "description": DESCRIPTION,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "form_id": VALID_FORM_WITH_QUESTION["id"],
    "form": VALID_FORM_WITH_QUESTION,
    "workflow_template_id": "workflow-template-example-01",
    "condition_id": EXAMPLE_INVALID_RULE["id"],
    "condition": EXAMPLE_INVALID_RULE,
    "branches": [VALID_BRANCH_WITH_CONDITION, INVALID_BRANCH_WITH_CONDITION],
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (template_step_with_valid_fields_should_return_none, None),
        (
            template_step_with_valid_fields_and_multiple_branches_should_return_none,
            None,
        ),
        (template_step_with_valid_fields_and_no_branches_should_return_none, None),
        (
            template_step_with_invalid_branch_should_return_validation_error,
            ValidationError,
        ),
        (
            template_step_with_invalid_condition_should_return_validation_error,
            ValidationError,
        ),
        (
            template_step_with_invalid_form_should_return_validation_error,
            ValidationError,
        ),
        (
            template_step_with_missing_field_should_return_validation_error,
            ValidationError,
        ),
    ],
)
def test_form_template_steps(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            WorkflowTemplateStepModel(**json)
    else:
        try:
            WorkflowTemplateStepModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error:{e}") from e
