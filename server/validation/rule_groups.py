import json

from pydantic import field_validator

from validation import CradleBaseModel


def contains_null(value: object) -> bool:
    if value is None:
        return True
    if isinstance(value, dict):
        return any(contains_null(item) for item in value.values())
    if isinstance(value, list):
        return any(contains_null(item) for item in value)
    return False


class RuleGroupExample:
    id = "rule-group-example-01"
    rule = (
        '{"and": [{"<": [{"var": "patient.age"}, 32]}, {">": [{"var": "bpm"}, 164]}]}'
    )

    example_01 = {"id": id, "rule": rule}


class RuleGroupModel(CradleBaseModel, extra="forbid"):
    id: str
    rule: str

    """
    Raises an error if the rule attribute is present but not a valid JSON string.
    Variables are extracted dynamically from the rule at evaluation time.
    """

    @field_validator("rule", mode="after")
    @classmethod
    def validate_rule(cls, rule: str) -> str:
        """Raise if rule is not valid JSON, is not an object, or contains null."""
        try:
            parsed_rule = json.loads(rule)
        except json.JSONDecodeError:
            raise ValueError("rule attribute must be a JSON string")
        if not isinstance(parsed_rule, dict):
            raise ValueError("rule must be a JSON object")
        if contains_null(parsed_rule):
            raise ValueError("rule must not contain null values")
        return rule
