import pytest
from pydantic import ValidationError

from validation.workflow_template_step_branches import WorkflowTemplateStepBranchModel

RULE_ID = "rule-group-example-01"
LOGIC = '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}'
RULES = (
    '{"rule1": {"field": "patient.age", "operator": "LESS_THAN", "value": 32},'
    '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
)


EXAMPLE_VALID_RULE = {"id": RULE_ID, "logic": LOGIC, "rules": RULES}

EXAMPLE_INVALID_RULE = {"id": RULE_ID, "logic": LOGIC, "rules": 1232}

ID = "branch-example-01"
TARGET_STEP_ID = "step-example-01"
STEP_ID = "step-example-02"

step_branch_with_valid_fields_should_return_none = {
    "id": ID,
    "target_step_id": TARGET_STEP_ID,
    "step_id": STEP_ID,
    "condition": EXAMPLE_VALID_RULE,
}

step_branch_with_valid_fields_and_no_condition_should_return_none = {
    "id": ID,
    "target_step_id": TARGET_STEP_ID,
    "step_id": STEP_ID,
    "condition": None,
}

step_branch_with_invalid_ID_should_return_validation_error = {
    "id": 3232,
    "target_step_id": TARGET_STEP_ID,
    "step_id": STEP_ID,
    "condition": EXAMPLE_VALID_RULE,
}

step_branch_with_invalid_rule_should_return_validation_error = {
    "id": ID,
    "target_step_id": TARGET_STEP_ID,
    "step_id": STEP_ID,
    "condition": EXAMPLE_INVALID_RULE,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (step_branch_with_valid_fields_should_return_none, None),
        (step_branch_with_valid_fields_and_no_condition_should_return_none, None),
        (step_branch_with_invalid_ID_should_return_validation_error, ValidationError),
        (step_branch_with_invalid_rule_should_return_validation_error, ValidationError),
    ],
)
def test_step_branches_with_valid_fields(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            WorkflowTemplateStepBranchModel(**json)
    else:
        try:
            WorkflowTemplateStepBranchModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error from {e}") from e
