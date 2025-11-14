from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any, Dict, Iterable, Union

if TYPE_CHECKING:
    from validation.workflow_models import WorkflowTemplateModel

Json = Dict[str, Any]
TemplateLike = Union[Json, Any]
StepLike = Union[Json, Any]
BranchLike = Union[Json, Any]

log = logging.getLogger(__name__)


def _as_dict(obj: Any) -> Json:
    if obj is None:
        return {}
    for attr in ("model_dump", "dict"):
        if hasattr(obj, attr):
            try:
                return getattr(obj, attr)()
            except TypeError:
                return getattr(obj, attr)(mode="python")
    if isinstance(obj, dict):
        return obj

    out: Dict[str, Any] = {}
    for k in dir(obj):
        if k.startswith("_"):
            continue
        try:
            v = getattr(obj, k)
        except Exception as e:
            log.debug("Skipping attribute %s on %r: %s", k, obj, e)
            continue
        if callable(v):
            continue
        out[k] = v
    return out


def _iter_steps(template: WorkflowTemplateModel) -> Iterable[Any]:
    t = _as_dict(template)
    return t.get("steps") or t.get("workflow_template_steps") or []


def _iter_branches(step: Any) -> Iterable[Any]:
    s = _as_dict(step)
    return s.get("branches") or []


def _get_condition(branch: Any) -> Json | None:
    b = _as_dict(branch)
    cond = b.get("condition")
    if cond is None:
        return None
    c = _as_dict(cond)
    return {"id": c.get("id"), "rule": c.get("rule")}
