import json
from typing import Any, Set, Union


class JsonLogicParser:
    """
    Parser for extracting variables from JsonLogic expressions.

    JsonLogic uses {"var": "path.to.variable"} to reference variables.
    This parser recursively traverses JsonLogic expressions to find all
    variable references.
    """

    def __init__(self):
        """Initialize the parser with an empty variables set."""
        self.variables: Set[str] = set()

    def extract_variables(self, rule: Union[str, dict]) -> Set[str]:
        """
        Extract all variable references from a JsonLogic rule.

        Args:
            rule: JsonLogic rule as a JSON string or dictionary

        Returns:
            Set of variable paths referenced in the rule

        Raises:
            ValueError: If the rule is invalid JSON or malformed

        """
        self.variables = set()

        if isinstance(rule, str):
            try:
                rule = json.loads(rule)
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON in rule: {e}")

        if not isinstance(rule, (dict, list)):
            raise ValueError(f"Rule must be a dict or list, got {type(rule)}")

        self._traverse(rule)

        return self.variables

    def _traverse(self, node: Any) -> None:
        """
        Recursively traverse a JsonLogic expression to find variables.

        Args:
            node: Current node in the JsonLogic expression tree

        """
        if isinstance(node, dict):
            if "var" in node:
                var_value = node["var"]
                if isinstance(var_value, str):
                    self.variables.add(var_value)
                elif isinstance(var_value, list) and len(var_value) > 0:
                    if isinstance(var_value[0], str):
                        self.variables.add(var_value[0])
            for value in node.values():
                self._traverse(value)

        elif isinstance(node, list):
            for item in node:
                self._traverse(item)


def extract_variables_from_rule(rule: Union[str, dict]) -> Set[str]:
    """
    Wrapper function to extract variables from a JsonLogic rule.

    Args:
        rule: JsonLogic rule as a JSON string or dictionary

    Returns:
        Set of variable paths referenced in the rule

    """
    parser = JsonLogicParser()
    return parser.extract_variables(rule)


def validate_rule_syntax(rule: Union[str, dict]) -> bool:
    """
    Validate that a rule is valid JsonLogic syntax.

    Args:
        rule: JsonLogic rule to validate

    Returns:
        True if valid, False otherwise

    """
    try:
        if isinstance(rule, str):
            rule = json.loads(rule)

        if not isinstance(rule, (dict, list)):
            return False

        parser = JsonLogicParser()
        parser.extract_variables(rule)
        return True

    except (ValueError, json.JSONDecodeError, TypeError):
        return False
