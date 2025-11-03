from typing import Any

from .registry import (
    get_marshal,
    get_type_label,
    resolve_marshal_for_obj,
)
from .utils import __pre_process


def marshal(obj: Any, shallow: bool = False, if_include_versions: bool = False) -> dict:
    fn = get_marshal(type(obj)) or resolve_marshal_for_obj(obj)
    if fn:
        return fn(obj, shallow, if_include_versions)  # unified call
    d = vars(obj).copy()
    __pre_process(d)
    return d


def marshal_with_type(obj: Any, shallow: bool = False) -> dict:
    label = get_type_label(type(obj)) or "other"
    effective_shallow = True if label == "form" else shallow
    d = marshal(obj, shallow=effective_shallow)
    d["type"] = label
    return d


# def unmarshal(m: Type[Any], d: dict) -> Any:
#     fn = get_unmarshal(m)
#     if fn:
#         return fn(d)
#     schema = get_schema_for_model(m)
#     return schema().load(d)
