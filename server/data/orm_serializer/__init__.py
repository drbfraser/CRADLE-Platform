# serializers/__init__.py
"""
Public API for the serializers package.

Exports a small, stable surface:
- marshal / unmarshal
- marshal_with_type (compat shim; deprecated)
- marshal_template_to_single_version
- marshal_patient_pregnancy_summary / marshal_patient_medical_history
- model_to_dict (kept for now; consider deprecating)

Everything else stays internal (core.py, utils.py, patients.py, records.py, forms.py,
questions.py, workflows.py). We use lazy imports to avoid heavy module import
costs and to reduce the chance of circulars during refactors.
"""

from __future__ import annotations

from importlib import import_module
from typing import Any, Type
import warnings

__version__ = "0.1.0"

__all__ = [
    "marshal",
    "unmarshal",
    "marshal_with_type",
    "marshal_template_to_single_version",
    "marshal_patient_pregnancy_summary",
    "marshal_patient_medical_history",
    "model_to_dict",
]

# ---- Lazy thin wrappers over internal modules --------------------------------

def marshal(obj: Any, *, shallow: bool = False, include_versions: bool = False) -> dict:
    """Serialize an ORM/model to a JSON-ready dict."""
    return import_module(".core", __name__).marshal(
        obj, shallow=shallow, include_versions=include_versions
    )

def unmarshal(model_cls: Type[Any], data: dict) -> Any:
    """Construct an ORM/model from a dict."""
    return import_module(".core", __name__).unmarshal(model_cls, data)

def model_to_dict(obj: Any) -> dict:
    """Dictionary view for models (legacy). Prefer `marshal`."""
    return import_module(".core", __name__).model_to_dict(obj)

def marshal_with_type(obj: Any, *, shallow: bool = False) -> dict:
    """Compat shim; prefer `marshal(..., include_type=True)`."""
    warnings.warn(
        "serializers.marshal_with_type is deprecated; use "
        "serializers.marshal(..., include_type=True).",
        DeprecationWarning,
        stacklevel=2,
    )
    # If core still has a dedicated impl, use it; otherwise fall back.
    core = import_module(".core", __name__)
    if hasattr(core, "marshal_with_type"):
        return core.marshal_with_type(obj, shallow=shallow)
    d = core.marshal(obj, shallow=shallow)  # type: ignore[no-untyped-call]
    d["__type__"] = obj.__class__.__name__
    return d

def marshal_template_to_single_version(template: Any, version: str) -> dict:
    """Form-template → one language/version view."""
    return import_module(".forms", __name__).marshal_template_to_single_version(template, version)

def marshal_patient_pregnancy_summary(patient: Any) -> dict:
    """Patient summary focused on pregnancy info."""
    return import_module(".patients", __name__).marshal_patient_pregnancy_summary(patient)

def marshal_patient_medical_history(patient: Any) -> dict:
    """Patient medical history view."""
    return import_module(".patients", __name__).marshal_patient_medical_history(patient)

# ---- Private / legacy escape hatches (warn loudly) ----------------------------

# Map of deprecated attribute -> (module, attribute)
_DEPRECATED_ATTRS = {
    # This was effectively private; keep it reachable for a cycle, but warn.
    "marshal_question_to_single_version": (".questions", "_marshal_question_to_single_version"),
}

def __getattr__(name: str) -> Any:  # PEP 562: module-level getattr
    if name in _DEPRECATED_ATTRS:
        mod_path, attr = _DEPRECATED_ATTRS[name]
        warnings.warn(
            f"`serializers.{name}` is private and will be removed. "
            f"Call the public API instead.",
            DeprecationWarning,
            stacklevel=2,
        )
        return getattr(import_module(mod_path, __name__), attr)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
