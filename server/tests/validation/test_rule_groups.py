import pytest
from pydantic import ValidationError

from validation.rule_groups import RuleGroupModel

ID = "rule-group-example-01"

RULE = '{"and": [{"<": [{"var": "patient.age"}, 32]}, {">": [{"var": "bpm"}, 164]}]}'
DATA_SOURCES = '["$patient.age"]'


rule_group_with_valid_fields_should_return_none = {
    "id": ID,
    "rule": RULE,
    "data_sources": DATA_SOURCES,
}

rule_group_with_invalid_json_rule_should_return_validation_error = {
    "id": ID,
    "rule": "Hello",
    "data_sources": DATA_SOURCES,
}

rule_group_with_invalid_json_datasource_format_should_return_validation_error = {
    "id": ID,
    "rule": RULE,
    "data_sources": "AHHHHHHHHH!",
}

rule_group_with_invalid_id_type_should_return_validation_error = {
    "id": 1231,
    "rule": RULE,
    "data_sources": DATA_SOURCES,
}

rule_group_with_invalid_rule_type_should_return_validation_error = {
    "id": ID,
    "rule": 1331,
    "data_sources": DATA_SOURCES,
}

rule_group_with_invalid_datasource_type_should_return_validation_error = {
    "id": ID,
    "rule": RULE,
    "data_sources": 1431,
}

rule_group_with_missing_field_should_return_validation_error = {
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
            rule_group_with_invalid_json_datasource_format_should_return_validation_error,
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
        (
            rule_group_with_invalid_datasource_type_should_return_validation_error,
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
