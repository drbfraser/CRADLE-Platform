from __future__ import annotations

import json
from typing import Any, Dict, Iterable, List, Optional, Union

Json = Dict[str, Any]
TemplateLike = Union[Json, Any]
StepLike = Union[Json, Any]
BranchLike = Union[Json, Any]

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
    out = {}
    for k in dir(obj):
        if not k.startswith("_"):
            try:
                v = getattr(obj, k)
            except Exception:
                continue
            if not callable(v):
                out[k] = v
    return out

def _iter_steps(template: TemplateLike) -> Iterable[StepLike]:
    t = _as_dict(template)
    return t.get("steps") or t.get("workflow_template_steps") or []

def _iter_branches(step: StepLike) -> Iterable[BranchLike]:
    s = _as_dict(step)
    return s.get("branches") or []

def _get_condition(branch: BranchLike) -> Optional[Json]:
    b = _as_dict(branch)
    cond = b.get("condition")
    if cond is None:
        return None
    c = _as_dict(cond)
    return {"id": c.get("id"), "rule": c.get("rule"), "data_sources": c.get("data_sources")}

def _parse_datasources(data_sources) -> List[str]:
    if data_sources is None:
        return []
    if isinstance(data_sources, str):
        try:
            ds = json.loads(data_sources)
            if isinstance(ds, list):
                return [str(x) for x in ds]
        except json.JSONDecodeError:
            return [s.strip() for s in data_sources.split(",") if s.strip()]
    if isinstance(data_sources, list):
        return [str(x) for x in data_sources]
    return []

def _normalize(token: str) -> str:
    token = token.strip()
    token = token.removeprefix("$")
    token = token.removeprefix(".")
    return token
