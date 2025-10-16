import json
from enum import Enum
from typing import Any, Dict, List, Set

from json_logic import jsonLogic

from service.workflow.evaluate.jsonlogic_parser import (
    extract_variables_from_rule,
)


class RuleStatus(str, Enum):
    """Possible status values for rule and branch evaluation"""

    TRUE = "TRUE"
    FALSE = "FALSE"
    NOT_ENOUGH_DATA = "NOT_ENOUGH_DATA"
    NO_MATCH = "NO_MATCH"


def _flatten_to_nested(flat_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert flat dict with dot notation to nested dict

    Examples:
        Input:  {"patient.age": 25, "patient.name": "John"}
        Output: {"patient": {"age": 25, "name": "John"}}

    """
    nested = {}
    for key, value in flat_dict.items():
        parts = key.split(".")
        current = nested
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        current[parts[-1]] = value
    return nested

# TODO: Remove when $ is no longer used in variable names or datasource keys

def _strip_dollar_from_vars(rule: Any) -> Any:
    """
    Recursively strip $ only from var operator values, not from other values.

    Examples:
        {"==": [{"var": "$price"}, "$100"]} → {"==": [{"var": "price"}, "$100"]}
        {"and": [{"var": "$x"}, {"var": "$y"}]} → {"and": [{"var": "x"}, {"var": "y"}]}

    """
    if isinstance(rule, dict):
        result = {}
        for key, value in rule.items():
            if key == "var":
                if isinstance(value, str) and value.startswith("$"):
                    result[key] = value.lstrip("$")
                elif isinstance(value, list) and len(value) > 0:
                    if isinstance(value[0], str) and value[0].startswith("$"):
                        result[key] = [value[0].lstrip("$")] + value[1:]
                    else:
                        result[key] = value
                else:
                    result[key] = value
            else:
                result[key] = _strip_dollar_from_vars(value)
        return result

    if isinstance(rule, list):
        return [_strip_dollar_from_vars(item) for item in rule]

    return rule


class RuleEvaluationResult:
    """Result of evaluating a rule"""

    def __init__(self, status: RuleStatus, missing_variables: Set[str] = None):
        self.status = status
        self.missing_variables = missing_variables or set()


class RulesEngineFacade:
    """
    An abstraction layer for the underlying Rules Engine Implementation
    """

    def __init__(self, rule: str, args: Dict[str, Any]):
        """
        Initializes the rules engine

        :param rule: a json object defining how we want to combine given list of rules
        :param args: dict of resolved datasources used in the rules
        :returns: an instance of RulesEngineFacade
        :rtype: RulesEngineFacade
        """
        self._rules_engine = RulesEngineImpl(rule, args)

    def evaluate(self, input: Dict[str, Any]) -> RuleEvaluationResult:
        """
        Evaluate the given rules

        :param input: an input data object
        :returns: RuleEvaluationResult with status and value
        :rtype: RuleEvaluationResult
        """
        return self._rules_engine.evaluate(input)


class RulesEngineImpl:
    """
    Rule Engine Implementation

    refer to:
    - https://github.com/maykinmedia/json-logic-py
    - https://jsonlogic.com/operations.html
    """

    def __init__(self, rule: str, args: Dict[str, Any]):
        self.args: Dict[str, Any] = args
        self.rule = self._parse_rules(rule)

    def _parse_rules(self, rule: str) -> Dict[str, Any]:
        """
        Attempt to deserialize a rule string into a rule object ready for evaluation

        :param rule: a string representing a rule
        :returns: a dict representing a rule
        :rtype: Dict
        :raises: ValueError
        """
        try:
            rule = json.loads(rule)
            return rule
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in rule: {e}")

    def evaluate(self, input: Dict[str, Any]) -> RuleEvaluationResult:
        """
        Evaluate a parsed rule and given input

        :param input: an input data object
        :returns: RuleEvaluationResult with status TRUE/FALSE/NOT_ENOUGH_DATA
        :rtype: RuleEvaluationResult
        """
        all_data = {**input, **self.args}

        cleaned_data = {k.lstrip("$"): v for k, v in all_data.items()}

        cleaned_rule = _strip_dollar_from_vars(self.rule)

        nested_data = _flatten_to_nested(cleaned_data)

        required_vars = extract_variables_from_rule(cleaned_rule)

        missing_vars = set()
        for var in required_vars:
            parts = var.split(".")
            current = nested_data
            found = True
            for part in parts:
                if isinstance(current, dict) and part in current:
                    current = current[part]
                else:
                    found = False
                    break

            if not found or current is None:
                missing_vars.add(var)

        if missing_vars:
            return RuleEvaluationResult(
                status=RuleStatus.NOT_ENOUGH_DATA, missing_variables=missing_vars
            )

        result = jsonLogic(cleaned_rule, nested_data)

        status = RuleStatus.TRUE if result else RuleStatus.FALSE
        return RuleEvaluationResult(status=status)


def evaluate_branches(
    branches: List[Dict[str, Any]],
    data: Dict[str, Any],
    datasources: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """
    Evaluate multiple branches with short-circuit logic.
    Stops at first TRUE or NOT_ENOUGH_DATA.

    :param branches: List of branch dicts with 'rule' and 'target_step_id'
    :param data: Available data for evaluation
    :param datasources: Optional datasources to merge with data
    :returns: Dict with 'status' and either 'branch' or 'missing_variables'
    """
    datasources = datasources or {}

    for branch in branches:
        rule = branch["rule"]

        facade = RulesEngineFacade(rule, datasources)
        result = facade.evaluate(data)

        if result.status == RuleStatus.NOT_ENOUGH_DATA:
            return {
                "status": RuleStatus.NOT_ENOUGH_DATA,
                "missing_variables": result.missing_variables,
            }

        if result.status == RuleStatus.TRUE:
            return {"status": RuleStatus.TRUE, "branch": branch}

    return {"status": RuleStatus.NO_MATCH}
