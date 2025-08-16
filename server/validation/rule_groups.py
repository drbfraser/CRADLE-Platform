import json

from pydantic import field_validator

from validation import CradleBaseModel


class RuleGroupExample:
    id = "rule-group-example-01"
    rule = "{\"and\": [{\"<\": [{\"var\": \"$patient.age\"}, 32]}, {\">\": [{\"var\": \"bpm\"}, 164]}]}",
    data_sources = "[\"$patient.age\"]"

    example_01 = {"id": id, "rule": rule, "data_sources": data_sources}


class RuleGroupModel(CradleBaseModel, extra="forbid"):
    id: str
    rule: str
    data_sources: str

    """
    Raises an error if the rule or data_sources attributes of a rule group is not in JSON
    """

    @field_validator("rule", mode="after")
    @classmethod
    def validate_rule(cls, rule: str) -> str:
        try:
            json.loads(rule)

        except json.JSONDecodeError:
            raise ValueError("rule attribute must be a JSON string")

        return rule

    @field_validator("data_sources", mode="after")
    @classmethod
    def validate_datasources(cls, data_sources: str) -> str:
        try:
            json.loads(data_sources)

        except json.JSONDecodeError:
            raise ValueError("data_sources attribute must be a JSON string")

        return data_sources

    # TODO: Add validators to determine if rule and data_sources are in the correct format
