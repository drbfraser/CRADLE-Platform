from __future__ import annotations

import logging
from typing import Any, Callable, Dict, Protocol, Type

LOGGER = logging.getLogger(__name__)


class MarshalCallable(Protocol):
    def __call__(self, obj: Any, shallow: bool, if_include_versions: bool) -> dict: ...


class UnmarshalCallable(Protocol):
    def __call__(self, data: dict) -> Any: ... 


class MarshalAdapter:
    """Adapts legacy helper signatures to (obj, shallow, if_include_versions)."""

    __slots__ = ("_helper", "_mode")

    def __init__(self, helper: Callable, mode: str) -> None:
        self._helper = helper
        self._mode = mode  # "", "S", "V", or "SV"

    def __call__(self, obj: Any, shallow: bool, if_include_versions: bool) -> dict:
        """
        Adapts the legacy helper's signature to (obj, shallow, if_include_versions).

        The mode parameter is used to determine the signature of the helper:

        - ""   : helper expects (obj)
        - "S"  : helper expects (obj, shallow)
        - "V"  : helper expects (obj, if_include_versions)
        - "SV" : helper expects (obj, shallow, if_include_versions)

        If the mode is unknown, a ValueError is raised.

        :param obj: The object to be marshalled
        :param shallow: If True, omit nested relationships
        :param if_include_versions: If True, include language versions in marshalled output
        :return: The marshalled object dictionary
        :raises ValueError: If the mode is unknown
        """
        m = self._mode
        if m == "":
            return self._helper(obj)
        if m == "S":
            return self._helper(obj, shallow)
        if m == "V":
            return self._helper(obj, if_include_versions)
        if m == "SV":
            return self._helper(obj, shallow, if_include_versions)
        raise ValueError(f"unknown adapter mode {m!r}")


_marshal: Dict[Type[Any], MarshalCallable] = {}
_unmarshal: Dict[Type[Any], UnmarshalCallable] = {}
_type_labels: Dict[Type[Any], str] = {}


def register_legacy(
    model: Type[Any], *, marshal_helper: Callable, marshal_mode: str, unmarshal_helper: Callable | None = None, type_label: str = None
) -> None:
    if marshal_helper is not None:
        _marshal[model] = MarshalAdapter(marshal_helper, marshal_mode)
    if unmarshal_helper is not None:
        _unmarshal[model] = unmarshal_helper
    if type_label:
        _type_labels[model] = type_label


def get_marshal(model: Type[Any]) -> MarshalCallable:
    return _marshal.get(model)

def get_unmarshal(model: Type[Any]) -> UnmarshalCallable | None:
    return _unmarshal.get(model)


def resolve_marshal_for_obj(obj: Any) -> MarshalCallable:
    fn = _marshal.get(type(obj))
    if fn is not None:
        return fn
    # tolerant fallback for SQLAlchemy proxies / import-path drift
    for cls, handler in _marshal.items():
        if isinstance(obj, cls):
            return handler
    return None


def get_type_label(model: Type[Any]) -> str:
    return _type_labels.get(model)
