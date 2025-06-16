import pytest

from pydantic import ValidationError

from validation.workflow_template_steps import WorkflowTemplateStepModel
from common.commonUtil import get_current_time
from tests.validation.test_rule_groups import (
    rule_group_with_valid_fields_should_return_none,
    rule_group_with_invalid_json_logic_should_return_validation_error,
)
from tests.validation.test_workflow_template_step_branches import (
    step_branch_with_valid_fields_should_return_none,
    step_branch_with_invalid_ID_should_return_validation_error,
)
from tests.validation.test_form_templates import (
    template_with_valid_fields_and_one_question_should_return_none,
    template_with_valid_fields_and_no_question_should_return_none,
    template_missing_required_field_classification_should_throw_exception,
)

# # Example rule groups used
# RULE_ID = "rule-group-example-01"
# LOGIC = '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}'
# RULES = ('{"rule1": {"field": "patient.age", "operator": "LESS_THAN", "value": 32},'
#          '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}')


EXAMPLE_VALID_RULE = rule_group_with_valid_fields_should_return_none

EXAMPLE_INVALID_RULE = rule_group_with_invalid_json_logic_should_return_validation_error

# # Example branches used
# BRANCH_ID = "branch-example-01"
# TARGET_STEP_ID = "step-example-01"
# STEP_ID = "step-example-02"
#
# VALID_STEP_WITH_CONDITION = {
#     "id": BRANCH_ID,
#     "target_step_id": TARGET_STEP_ID,
#     "step_id": STEP_ID,
#     "condition": EXAMPLE_VALID_RULE,
# }
#
# VALID_STEP_WITH_NO_CONDITION = {
#     "id": BRANCH_ID,
#     "target_step_id": TARGET_STEP_ID,
#     "step_id": STEP_ID,
#     "condition": EXAMPLE_VALID_RULE,
# }
#
# INVALID_STEP_WITH_CONDITION = {
#     "id": BRANCH_ID,
#     "target_step_id": TARGET_STEP_ID,
#     "step_id": STEP_ID,
#     "condition": EXAMPLE_INVALID_RULE,
# }

VALID_BRANCH_WITH_CONDITION = step_branch_with_valid_fields_should_return_none
INVALID_BRANCH_WITH_CONDITION = (
    step_branch_with_invalid_ID_should_return_validation_error
)

# # Example Form template used
# CLASSIFICATION = {"id": "123", "name": "example_name"}
# VERSION = "V1"
# FORM_ID = "asdsd-sdsw1231"
# DATE_CREATED = 1551447833
# LANGUAGE = "ENGLISH"
#
# root_question = {
#     "id": "root_question",
#     "category_index": None,  # root question has to have first category_index as None
#     "num_max": None,
#     "num_min": None,
#     "question_index": 1,
#     "lang_versions": [
#         {
#             "lang": LANGUAGE,
#             "mc_options": [{"mc_id": 0, "opt": "england"}],
#             "question_text": "what's your nation",
#         },
#     ],
#     "question_type": "MULTIPLE_CHOICE",
#     "required": True,
#     "string_max_length": None,
#     "units": None,
#     "visible_condition": [
#         {"answers": {"mc_id_array": [0]}, "question_index": 0, "relation": "EQUAL_TO"},
#     ],
# }
#
# template_with_valid_fields_and_one_question_should_return_none = {
#     "id": FORM_ID,
#     "classification": CLASSIFICATION,
#     "questions": [root_question],
#     "version": VERSION,
#     "date_created": DATE_CREATED,
# }

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
TITLE = "Heart Rate Check"
EXPECTED_COMPLETION = get_current_time()
LAST_EDITED = get_current_time()
LAST_EDITED_BY = 1345344

template_step_with_valid_fields_should_return_none = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
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
    "title": TITLE,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
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
    "title": TITLE,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": None,
    "last_edited_by": LAST_EDITED_BY,
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
    "title": TITLE,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
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
    "title": TITLE,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
    "form_id": INVALID_FORM_WITH_QUESTION["id"],
    "form": INVALID_FORM_WITH_QUESTION,
    "workflow_template_id": "workflow-template-example-01",
    "condition_id": EXAMPLE_VALID_RULE["id"],
    "condition": EXAMPLE_VALID_RULE,
}

template_step_with_invalid_condition_should_return_validation_error = {
    "id": ID,
    "name": NAME,
    "title": TITLE,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
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
    "title": TITLE,
    "expected_completion": EXPECTED_COMPLETION,
    "last_edited": LAST_EDITED,
    "last_edited_by": LAST_EDITED_BY,
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
