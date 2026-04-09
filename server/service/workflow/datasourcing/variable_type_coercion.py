"""
Coerce resolved workflow variable values to catalogue types for JsonLogic rules.

On failure, logs a warning and returns None.
"""

from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from typing import Any, Optional

from enums import WorkflowVariableTypeEnum

logger = logging.getLogger(__name__)


def _coerce_integer(raw: Any, variable_tag: str) -> Optional[int]:
    if isinstance(raw, bool):
        return int(raw)
    if isinstance(raw, int):
        return raw
    if isinstance(raw, float):
        return int(raw)
    if isinstance(raw, str):
        s = raw.strip()
        if not s:
            return None
        try:
            return int(s, 10)
        except ValueError:
            logger.warning(
                "Integer coercion failed for variable %r: %r", variable_tag, raw
            )
            return None
    logger.warning(
        "Integer coercion failed for variable %r: unsupported type %s",
        variable_tag,
        type(raw).__name__,
    )
    return None


def _coerce_double(raw: Any, variable_tag: str) -> Optional[float]:
    if isinstance(raw, bool):
        return float(int(raw))
    if isinstance(raw, (int, float)):
        return float(raw)
    if isinstance(raw, str):
        s = raw.strip()
        if not s:
            return None
        try:
            return float(s)
        except ValueError:
            logger.warning(
                "Double coercion failed for variable %r: %r", variable_tag, raw
            )
            return None
    logger.warning(
        "Double coercion failed for variable %r: unsupported type %s",
        variable_tag,
        type(raw).__name__,
    )
    return None


def _coerce_string(raw: Any, variable_tag: str) -> Optional[str]:
    if raw is None:
        return None
    if isinstance(raw, str):
        return raw
    if isinstance(raw, (datetime, date)):
        return raw.isoformat()
    if isinstance(raw, (int, float, bool)):
        return str(raw)
    logger.warning(
        "String coercion failed for variable %r: unsupported type %s",
        variable_tag,
        type(raw).__name__,
    )
    return None


def _coerce_boolean(raw: Any, variable_tag: str) -> Optional[bool]:
    if isinstance(raw, bool):
        return raw
    if isinstance(raw, (int, float)):
        if raw == 0:
            return False
        if raw == 1:
            return True
        logger.warning(
            "Boolean coercion failed for variable %r: non-boolean numeric %r",
            variable_tag,
            raw,
        )
        return None
    if isinstance(raw, str):
        lowered = raw.strip().lower()
        if lowered in ("true", "1", "yes", "y"):
            return True
        if lowered in ("false", "0", "no", "n"):
            return False
        logger.warning("Boolean coercion failed for variable %r: %r", variable_tag, raw)
        return None
    logger.warning(
        "Boolean coercion failed for variable %r: unsupported type %s",
        variable_tag,
        type(raw).__name__,
    )
    return None


def _coerce_date(raw: Any, variable_tag: str) -> Optional[str]:
    """
    Normalize to an ISO 8601 calendar date (YYYY-MM-DD) or full datetime string
    when the value encodes a time component (e.g. system ``local-date-time``).
    """
    if raw is None:
        return None
    if isinstance(raw, datetime):
        return raw.date().isoformat()
    if isinstance(raw, date):
        return raw.isoformat()
    if isinstance(raw, str):
        s = raw.strip()
        if not s:
            return None
        # Already YYYY-MM-DD
        if len(s) == 10 and s[4] == "-" and s[7] == "-":
            return s
        try:
            parsed = datetime.fromisoformat(s.replace("Z", "+00:00"))
            return parsed.date().isoformat()
        except ValueError:
            pass
        logger.warning("Date coercion failed for variable %r: %r", variable_tag, raw)
        return None
    if isinstance(raw, (int, float)):
        ts = float(raw)
        # Heuristic: milliseconds vs seconds
        if ts > 1e12:
            ts = ts / 1000.0
        try:
            return datetime.fromtimestamp(ts, tz=timezone.utc).date().isoformat()
        except (OverflowError, OSError, ValueError):
            logger.warning(
                "Date coercion failed for variable %r: bad timestamp %r",
                variable_tag,
                raw,
            )
            return None
    logger.warning(
        "Date coercion failed for variable %r: unsupported type %s",
        variable_tag,
        type(raw).__name__,
    )
    return None


def coerce_resolved_value_for_rule(
    value: Any,
    expected: WorkflowVariableTypeEnum,
    variable_tag: str = "",
) -> Any:
    """
    Coerce a resolved value to ``expected`` for rule evaluation.

    :param value: Raw resolved value (not :data:`~service.workflow.datasourcing.data_sourcing.MISSING`)
    :param expected: Catalogue type
    :param variable_tag: Variable name for logging
    :returns: Coerced value, or ``None`` if input is ``None`` or coercion fails
    """
    if value is None:
        return None

    if expected == WorkflowVariableTypeEnum.COLLECTION:
        return value

    if expected == WorkflowVariableTypeEnum.INTEGER:
        return _coerce_integer(value, variable_tag)

    if expected == WorkflowVariableTypeEnum.DOUBLE:
        return _coerce_double(value, variable_tag)

    if expected == WorkflowVariableTypeEnum.STRING:
        return _coerce_string(value, variable_tag)

    if expected == WorkflowVariableTypeEnum.BOOLEAN:
        return _coerce_boolean(value, variable_tag)

    if expected == WorkflowVariableTypeEnum.DATE:
        return _coerce_date(value, variable_tag)

    return value
