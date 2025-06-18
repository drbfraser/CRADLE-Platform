import pytest
from pydantic import ValidationError

from validation.rule_groups import RuleGroupModel

ID = "rule-group-example-01"
LOGIC = '{"logical_operator": "AND", "rules": {"rule1": "rules.rule1", "rule2": "rules.rule2"}}'
RULES = (
    '{"rule1": {"field": "patient.age", "operator": "LESS_THAN", "value": 32},'
    '"rule2": {"field": "patient.bpm", "operator": "GREATER_THAN", "value": 164}}'
)


rule_group_with_valid_fields_should_return_none = {
    "id": ID,
    "logic": LOGIC,
    "rules": RULES,
}

rule_group_with_invalid_json_logic_should_return_validation_error = {
    "id": ID,
    "logic": "Hello",
    "rules": RULES,
}

rule_group_with_invalid_json_rule_should_return_validation_error = {
    "id": ID,
    "logic": LOGIC,
    "rules": "AHHHHHHHHH!",
}

rule_group_with_invalid_id_type_should_return_validation_error = {
    "id": 1231,
    "logic": LOGIC,
    "rules": RULES,
}

rule_group_with_invalid_logic_type_should_return_validation_error = {
    "id": ID,
    "logic": 1331,
    "rules": RULES,
}

rule_group_with_invalid_rule_type_should_return_validation_error = {
    "id": ID,
    "logic": LOGIC,
    "rules": 1431,
}

rule_group_with_missing_field_should_return_validation_error = {
    "id": ID,
    "logic": LOGIC,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (rule_group_with_valid_fields_should_return_none, None),
        (
            rule_group_with_invalid_json_logic_should_return_validation_error,
            ValidationError,
        ),
        (
            rule_group_with_invalid_json_rule_should_return_validation_error,
            ValidationError,
        ),
        (
            rule_group_with_invalid_id_type_should_return_validation_error,
            ValidationError,
        ),
        (
            rule_group_with_invalid_logic_type_should_return_validation_error,
            ValidationError,
        ),
        (
            rule_group_with_invalid_rule_type_should_return_validation_error,
            ValidationError,
        ),
        (rule_group_with_missing_field_should_return_validation_error, ValidationError),
    ],
)
def test_rule_group_validation(json, expectation):
    if expectation:
        with pytest.raises(expectation):
            RuleGroupModel(**json)

    else:
        try:
            RuleGroupModel(**json)
        except ValidationError as e:
            raise AssertionError(f"Unexpected validation error from {e}") from e
