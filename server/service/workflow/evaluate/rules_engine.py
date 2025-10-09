import json
from typing import Any, Dict, Set

from json_logic import jsonLogic
from server.service.workflow.evaluate.jsonlogic_parser import (
    extract_variables_from_rule,
)


def _flatten_to_nested(flat_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Convert flat dict with dot notation to nested dict"""
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


class RuleEvaluationResult:
    """Result of evaluating a rule"""

    def __init__(
        self, status: str, value: Any = None, missing_variables: Set[str] = None
    ):
        self.status = status
        self.value = value
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
        self.__rules_engine = RulesEngineImpl(rule, args)

    def evaluate(self, input: Dict[str, Any]) -> RuleEvaluationResult:
        """
        Evaluate the given rules

        :param input: an input data object
        :returns: RuleEvaluationResult with status and value
        :rtype: RuleEvaluationResult
        """
        return self.__rules_engine.evaluate(input)


class RulesEngineImpl:
    """
    Rule Engine Implementation

    refer to:
    - https://github.com/maykinmedia/json-logic-py
    - https://jsonlogic.com/operations.html
    """

    def __init__(self, rule: str, args: Dict[str, Any]):
        self.args: Dict[str, Any] = args
        self.rule = self.__parse_rules(rule)

    def __parse_rules(self, rule: str) -> Dict:
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

    def evaluate(self, input: Dict) -> RuleEvaluationResult:
        """
        Evaluate a parsed rule and given input

        :param input: an input data object
        :returns: RuleEvaluationResult with status TRUE/FALSE/NOT_ENOUGH_DATA
        :rtype: RuleEvaluationResult
        """
        all_data = {**input, **self.args}

        cleaned_data = {k.lstrip("$"): v for k, v in all_data.items()}

        rule_str = json.dumps(self.rule)
        cleaned_rule_str = rule_str.replace('"$', '"')
        cleaned_rule = json.loads(cleaned_rule_str)

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
                status="NOT_ENOUGH_DATA", missing_variables=missing_vars
            )

        result = jsonLogic(cleaned_rule, nested_data)

        status = "TRUE" if result else "FALSE"
        return RuleEvaluationResult(status=status, value=result)


def evaluate_branches(
    branches: list, data: Dict[str, Any], datasources: Dict[str, Any] = None
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

        if result.status == "NOT_ENOUGH_DATA":
            return {
                "status": "NOT_ENOUGH_DATA",
                "missing_variables": result.missing_variables,
            }

        if result.status == "TRUE":
            return {"status": "TRUE", "branch": branch}

    return {"status": "NO_MATCH", "message": "No branches matched"}
