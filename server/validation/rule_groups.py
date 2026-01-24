import json
from typing import Optional

from pydantic import field_validator

from validation import CradleBaseModel


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
        try:
            json.loads(rule)
        except json.JSONDecodeError:
            raise ValueError("rule attribute must be a JSON string")
        return rule

    # TODO: Add validators to determine if rule is in the correct format
