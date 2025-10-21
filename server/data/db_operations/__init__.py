"""
db_operations package facade.

This module exposes a *curated, stable API* for database operations at the
package level so callers can do:

    import data.db_operations as crud
    crud.create(...)
    crud.read(...)
    crud.read_patient_list(..
Under the hood, functions live in feature-focused submodules (e.g.,
`common_crud`, `patient_queries`, `workflow_management`). We *re-export*
a selected set of names at the package level and lazy-load them on first use.
This keeps imports fast, avoids circular dependencies, and provides a single,
consistent import path for application code.

How to add a new public function
--------------------------------
1) Implement it in the appropriate submodule (e.g., `patient_queries.py`).
2) Add an entry to `_EXPORTS` below mapping the public name to
   `(submodule_name, attribute_name)`.
3) Add the public name to `__all__`.

NOTE: Do *not* export internal helpers or names that start with underscores.

Example usage
-------------
    import data.db_operations as crud

    user = crud.read("User", id=123)
    crud.create("Patient", data=payload)
"""

from __future__ import annotations

from typing import Any, Dict, Tuple, TypeVar

import config

db_session = config.db.session

M = TypeVar("M")
S = TypeVar("S")

# ---------------------------
# Public API surface (curated)
# ---------------------------
__all__ = [
    # common_crud
    "create",
    "create_model",
    "create_all",
    "read",
    "read_all",
    "find",
    "update",
    "merge",
    "delete",
    "delete_by",
    "delete_all",
    # form_queries
    "read_form_template_language_versions",
    "read_questions",
    # patient_queries
    "read_admin_patient",
    "read_patient_all_records",
    "read_patient_current_medical_record",
    "read_patient_list",
    "read_patients",
    "read_patient_timeline",
    "read_readings",
    "read_medical_records",
    # phone_utils
    "get_all_relay_phone_numbers",
    "is_phone_number_relay",
    # pregnancy_medical_utils
    "has_conflicting_pregnancy_record",
    # referral_queries
    "read_referral_list",
    "read_referrals_or_assessments",
    # stats_queries
    "get_days_with_readings",
    "get_export_data",
    "get_referred_patients",
    "get_sent_referrals",
    "get_total_color_readings",
    "get_total_readings_completed",
    "get_unique_patients_with_readings",
    # supervision
    "add_vht_to_supervise",
    "get_supervised_vhts",
    # workflow_management
    "read_workflow_classifications",
    "read_workflow_templates",
    "read_workflow_instances",
    "read_workflows_in_collection",
    "read_rule_group",
    "read_instance_steps",
    "read_template_steps",
    "delete_workflow_step_branch",
    "delete_workflow_step",
    "delete_workflow",
    "delete_workflow_classification",
    # session accessor
    "db_session",
    # Optional: expose submodules for advanced/namespaced access
    "common_crud",
    "form_queries",
    "patient_queries",
    "referral_queries",
    "stats_queries",
    "workflow_management",
    "supervision",
    "phone_utils",
    "pregnancy_medical_utils",
]

# Map: public_name -> (submodule_name, attribute_name or None to return the module)
# If two submodules export the same function name, *do not* alias both here.
# Rename at the source or choose a single public name to avoid ambiguity.
_EXPORTS: Dict[str, Tuple[str, str | None]] = {
    # ------- common_crud -------
    "create": ("common_crud", "create"),
    "create_model": ("common_crud", "create_model"),
    "create_all": ("common_crud", "create_all"),
    "read": ("common_crud", "read"),
    "read_all": ("common_crud", "read_all"),
    "find": ("common_crud", "find"),
    "update": ("common_crud", "update"),
    "delete": ("common_crud", "delete"),
    "delete_by": ("common_crud", "delete_by"),
    "delete_all": ("common_crud", "delete_all"),
    # ------- form_queries -------
    "read_form_template_language_versions": (
        "form_queries",
        "read_form_template_language_versions",
    ),
    "read_questions": ("form_queries", "read_questions"),
    # ------- patient_queries -------
    "read_admin_patient": ("patient_queries", "read_admin_patient"),
    "read_patient_all_records": ("patient_queries", "read_patient_all_records"),
    "read_patient_current_medical_record": (
        "patient_queries",
        "read_patient_current_medical_record",
    ),
    "read_patient_list": ("patient_queries", "read_patient_list"),
    "read_patients": ("patient_queries", "read_patients"),
    "read_patient_timeline": ("patient_queries", "read_patient_timeline"),
    "read_readings": ("patient_queries", "read_readings"),
    "read_medical_records": ("patient_queries", "read_medical_records"),
    # ------- phone_utils -------
    "get_all_relay_phone_numbers": ("phone_utils", "get_all_relay_phone_numbers"),
    "is_phone_number_relay": ("phone_utils", "is_phone_number_relay"),
    # ------- pregnancy_medical_utils -------
    "has_conflicting_pregnancy_record": (
        "pregnancy_medical_utils",
        "has_conflicting_pregnancy_record",
    ),
    # ------- referral_queries -------
    "read_referral_list": ("referral_queries", "read_referral_list"),
    "read_referrals_or_assessments": (
        "referral_queries",
        "read_referrals_or_assessments",
    ),
    # ------- stats_queries -------
    "get_days_with_readings": ("stats_queries", "get_days_with_readings"),
    "get_export_data": ("stats_queries", "get_export_data"),
    "get_referred_patients": ("stats_queries", "get_referred_patients"),
    "get_sent_referrals": ("stats_queries", "get_sent_referrals"),
    "get_total_color_readings": ("stats_queries", "get_total_color_readings"),
    "get_total_readings_completed": ("stats_queries", "get_total_readings_completed"),
    "get_unique_patients_with_readings": (
        "stats_queries",
        "get_unique_patients_with_readings",
    ),
    # ------- supervision -------
    "add_vht_to_supervise": ("supervision", "add_vht_to_supervise"),
    "get_supervised_vhts": ("supervision", "get_supervised_vhts"),
    # ------- workflow_management -------
    "read_workflow_classifications": (
        "workflow_management",
        "read_workflow_classifications",
    ),
    "read_workflow_templates": ("workflow_management", "read_workflow_templates"),
    "read_workflow_instances": ("workflow_management", "read_workflow_instances"),
    "read_workflows_in_collection": (
        "workflow_management",
        "read_workflows_in_collection",
    ),
    "read_rule_group": ("workflow_management", "read_rule_group"),
    "read_instance_steps": ("workflow_management", "read_instance_steps"),
    "read_template_steps": ("workflow_management", "read_template_steps"),
    "delete_workflow_step_branch": (
        "workflow_management",
        "delete_workflow_step_branch",
    ),
    "delete_workflow_step": ("workflow_management", "delete_workflow_step"),
    "delete_workflow": ("workflow_management", "delete_workflow"),
    "delete_workflow_classification": (
        "workflow_management",
        "delete_workflow_classification",
    ),
    # ------- submodule escape hatch (return module objects) -------
    "common_crud": ("common_crud", None),
    "form_queries": ("form_queries", None),
    "patient_queries": ("patient_queries", None),
    "referral_queries": ("referral_queries", None),
    "stats_queries": ("stats_queries", None),
    "workflow_management": ("workflow_management", None),
    "supervision": ("supervision", None),
    "phone_utils": ("phone_utils", None),
    "pregnancy_medical_utils": ("pregnancy_medical_utils", None),
}


def __getattr__(name: str) -> Any:
    """
    Lazy attribute loader (PEP 562).

    Called when `data.db_operations.<name>` is accessed and `<name>` is not
    found in the module globals. We look up `<name>` in `_EXPORTS`, import the
    target submodule on demand, and return either the submodule object or a
    specific attribute from it.

    Special-cased:
        - "db_session": we resolve from `config.db.session` at access time.
    """
    if name == "db_session":
        # Resolve on demand to avoid importing application config during module import.
        from . import config as _config

        return _config.db.session

    try:
        submodule, attr = _EXPORTS[name]
    except KeyError as exc:
        raise AttributeError(f"module '{__name__}' has no attribute '{name}'") from exc

    mod = __import__(f"{__name__}.{submodule}", fromlist=[submodule])
    return getattr(mod, attr) if attr else mod


def __dir__() -> list[str]:
    """
    Provide a helpful dir() for interactive exploration and IDEs.
    Includes curated public names plus any already-loaded globals.
    """
    return sorted(set(list(globals().keys()) + list(__all__)))
