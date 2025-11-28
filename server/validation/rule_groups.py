import json
from typing import Optional, Union

from pydantic import field_validator

from enums import StrEnum
from validation import CradleBaseModel


class RuleGroupExample:
    id = "rule-group-example-01"
    rule = (
        '{"and": [{"<": [{"var": "patient.age"}, 32]}, {">": [{"var": "bpm"}, 164]}]}'
    )
    data_sources = '["$patient.age"]'

    example_01 = {"id": id, "rule": rule, "data_sources": data_sources}


class RuleGroupModel(CradleBaseModel, extra="forbid"):
    id: str
    rule: str
    data_sources: Optional[str] = None

    """
    Raises an error if the rule or data_sources attributes are present but not valid JSON strings.
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
    def validate_datasources(cls, data_sources: Optional[str]) -> Optional[str]:
        if data_sources in (None, ""):
            return data_sources
        try:
            json.loads(data_sources)
        except json.JSONDecodeError:
            raise ValueError(
                "data_sources attribute must be a JSON string when provided"
            )
        return data_sources

    # TODO: Add validators to determine if rule and data_sources are in the correct format


# TODO: Move to a more relevant location, maybe in variable resolver?
class VariableResolutionStatus(StrEnum):
    """Status codes for variable resolution"""

    RESOLVED = "RESOLVED"
    # TODO: Can add more statuses as needed (e.g., DATABASE_ERROR)


class VariableResolution(CradleBaseModel):
    var: str
    value: Union[int, float, str, bool]
    status: VariableResolutionStatus
