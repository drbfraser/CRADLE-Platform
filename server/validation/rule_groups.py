from json import JSONDecodeError
import json
from pydantic import field_validator

from validation import CradleBaseModel


# TODO: Change rule group example when format is specified
class RuleGroupExample:
    id = "rule-group-example-01"
    logic = (
        "{'logical_operator': 'AND': {'rule1': 'rules.rule1', 'rule2': 'rules.rule2'}}"
    )
    rules = {
        "'rule1': {'field': 'patient.age', operator: 'LESS_THAN', 'value': 32},"
        " 'rule2': {'field': 'patient.bpm', 'operator': 'GREATER_THAN', 'value': 164}},}"
    }

    example_01: {"id": id, "logic": logic, "rules": rules}


class RuleGroupModel(CradleBaseModel, extra="forbid"):
    id: str
    logic = str
    rules = str

    """
    Raises an error if the logic or rules attributes of a rule group is not in JSON
    """

    @field_validator("rules", mode="after")
    @classmethod
    def validate_rules(cls, rules: str) -> str:
        try:
            json.loads(rules)

        except JSONDecodeError:
            raise ValueError("rules attribute must be a JSON string")

        return rules

    @field_validator("logic", mode="after")
    @classmethod
    def validate_logic(cls, logic: str) -> str:
        try:
            json.loads(logic)

        except JSONDecodeError:
            raise ValueError("logic attribute must be a JSON string")

        return logic

    # TODO: Add validators to determine if logic and rules are in the correct format
