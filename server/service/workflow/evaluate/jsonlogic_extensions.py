"""
Custom JsonLogic operations and rule normalization for workflow branch conditions.

Blockly emits date literals as {"date": "YYYY-MM-DD"}; we normalize those to ISO
strings so comparisons work against coerced variable values.

String helpers (contains, startsWith, endsWith, length) accept an optional third
boolean argument for case-insensitive matching (default: false).
"""

from __future__ import annotations

import re
from typing import Any

_ISO_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

_custom_ops_registered = False


def _as_str(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def _case_insensitive(value: bool | None) -> bool:
    return bool(value)


def _compare_strings(
    haystack: Any, needle: Any, *, case_insensitive: bool, check: str
) -> bool:
    left = _as_str(haystack)
    right = _as_str(needle)
    if case_insensitive:
        left = left.lower()
        right = right.lower()
    if check == "contains":
        return right in left
    if check == "startsWith":
        return left.startswith(right)
    if check == "endsWith":
        return left.endswith(right)
    raise ValueError(f"Unknown string check: {check}")


def _op_contains(haystack: Any, needle: Any, case_insensitive: bool = False) -> bool:
    return _compare_strings(
        haystack, needle, case_insensitive=_case_insensitive(case_insensitive), check="contains"
    )


def _op_starts_with(haystack: Any, prefix: Any, case_insensitive: bool = False) -> bool:
    return _compare_strings(
        haystack, prefix, case_insensitive=_case_insensitive(case_insensitive), check="startsWith"
    )


def _op_ends_with(haystack: Any, suffix: Any, case_insensitive: bool = False) -> bool:
    return _compare_strings(
        haystack, suffix, case_insensitive=_case_insensitive(case_insensitive), check="endsWith"
    )


def _op_length(value: Any) -> int:
    return len(_as_str(value))


def normalize_rule_literals(node: Any) -> Any:
    """
    Rewrite Blockly-style date literals to plain ISO date strings.

    {"date": "2024-01-15"} -> "2024-01-15"

    Only dicts whose sole key is ``date`` with a YYYY-MM-DD string value are
    converted, so nested operator trees are normalized recursively.
    """
    if isinstance(node, dict):
        if set(node.keys()) == {"date"} and isinstance(node["date"], str):
            if _ISO_DATE_RE.match(node["date"]):
                return node["date"]
        return {key: normalize_rule_literals(value) for key, value in node.items()}
    if isinstance(node, list):
        return [normalize_rule_literals(item) for item in node]
    return node


def register_custom_operations() -> None:
    """Register workflow-specific JsonLogic operations (idempotent)."""
    global _custom_ops_registered
    if _custom_ops_registered:
        return

    from json_logic import operations

    operations["contains"] = _op_contains
    operations["startsWith"] = _op_starts_with
    operations["endsWith"] = _op_ends_with
    operations["length"] = _op_length

    _custom_ops_registered = True


# Register when this module is imported so jsonLogic picks up custom ops.
register_custom_operations()
