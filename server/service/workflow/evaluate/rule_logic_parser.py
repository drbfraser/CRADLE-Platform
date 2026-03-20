"""
Minimal parser to extract single-comparison variable logic from JsonLogic rules.

Used so the frontend can display "variable operator value" (e.g. patient.age >= 18)
during workflow instance runs without interpreting raw JsonLogic.
"""

from typing import Any, Optional

# JsonLogic comparison operators we support for the minimal single-comparison form
_SINGLE_COMPARISON_OPS = (">", "<", ">=", "<=", "==", "===", "!=")


def _get_var_from_node(node: Any) -> Optional[str]:
    """Extract variable tag from JsonLogic var node: {"var": "tag"} or {"var": ["tag", default]}."""
    if not isinstance(node, dict) or "var" not in node:
        return None
    var_val = node["var"]
    if isinstance(var_val, str):
        return var_val
    if isinstance(var_val, list) and len(var_val) > 0 and isinstance(var_val[0], str):
        return var_val[0]
    return None


def parse_single_comparison_from_rule(rule: Any) -> Optional[dict[str, Any]]:
    """
    Parse a JsonLogic rule that is a single comparison into variable logic.

    Supports only the minimal form: {"op": [{"var": "variable_tag"}, value]}
    e.g. {">": [{"var": "patient.age"}, 18]} -> {"variable_tag": "patient.age", "operator": ">", "value": 18}

    Returns None if the rule is not a simple single comparison (e.g. compound and/or, or invalid).
    """
    if rule is None:
        return None
    if isinstance(rule, str):
        import json

        try:
            rule = json.loads(rule)
        except (json.JSONDecodeError, TypeError):
            return None
    if not isinstance(rule, dict) or len(rule) != 1:
        return None
    op, args = next(iter(rule.items()))
    if op not in _SINGLE_COMPARISON_OPS or not isinstance(args, list) or len(args) != 2:
        return None
    var_node, value = args[0], args[1]
    variable_tag = _get_var_from_node(var_node)
    if variable_tag is None:
        return None
    return {
        "variable_tag": variable_tag,
        "operator": op,
        "value": value,
    }
