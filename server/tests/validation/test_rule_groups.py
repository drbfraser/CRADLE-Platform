import json

import pytest
from pydantic import ValidationError

from validation.rule_groups import RuleGroupModel

ID = "rule-group-example-01"

RULE = '{"and": [{"<": [{"var": "patient.age"}, 32]}, {">": [{"var": "bpm"}, 164]}]}'


rule_group_with_valid_fields_should_return_none = {
    "id": ID,
    "rule": RULE,
}

rule_group_with_invalid_json_rule_should_return_validation_error = {
    "id": ID,
    "rule": "Hello",
}

rule_group_with_invalid_id_type_should_return_validation_error = {
    "id": 1231,
    "rule": RULE,
}

rule_group_with_invalid_rule_type_should_return_validation_error = {
    "id": ID,
    "rule": 1331,
}

rule_group_with_missing_field_is_allowed = {
    "id": ID,
    "rule": RULE,
}


@pytest.mark.parametrize(
    "json, expectation",
    [
        (rule_group_with_valid_fields_should_return_none, None),
        (
            rule_group_with_invalid_json_rule_should_return_validation_error,
            ValidationError,
        ),
        (
            rule_group_with_invalid_id_type_should_return_validation_error,
            ValidationError,
        ),
        (
            rule_group_with_invalid_rule_type_should_return_validation_error,
            ValidationError,
        ),
        (rule_group_with_missing_field_is_allowed, None),
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
            
@pytest.mark.parametrize(
    "rule",
    [
        None,
        123,
        "hello",
        True,
        [],
        [1, 2],
    ],
)
def test_reject_non_object_root(rule):
    with pytest.raises(ValidationError):
        RuleGroupModel(
            id="test-rule",
            rule=json.dumps(rule),
        )


@pytest.mark.parametrize(
    "rule",
    [
        {"==": [None, "Yes"]},
        {"==": [{"var": "patient.age"}, None]},
        {
            "and": [
                {">": [{"var": "patient.age"}, 18]},
                {"==": [None, "Yes"]},
            ]
        },
        {"!": None},
    ],
)
def test_reject_null_operands(rule):
    with pytest.raises(ValidationError):
        RuleGroupModel(
            id="test-rule",
            rule=json.dumps(rule),
        )


@pytest.mark.parametrize(
    "rule",
    [
        {"==": [{"var": "patient.age"}, 18]},
        {
            "and": [
                {"<": [{"var": "patient.age"}, 32]},
                {">": [{"var": "bpm"}, 164]},
            ]
        },
        {">": [{"var": "patient.age"}, 200]}, #accept medically wrong but well-formed rules 
    ],
)
def test_accept_well_formed_rules(rule):
    rule_string = json.dumps(rule)

    model = RuleGroupModel(
        id="test-rule",
        rule=rule_string,
    )

    assert model.rule == rule_string
