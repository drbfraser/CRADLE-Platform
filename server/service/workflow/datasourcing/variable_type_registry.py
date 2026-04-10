"""
Expected types for workflow variables: catalogue tags plus path-based inference.

Used during rule evaluation to coerce values to stable JsonLogic-friendly types.
"""

from __future__ import annotations

from typing import Dict

from enums import WorkflowVariableTypeEnum
from service.workflow.datasourcing.data_sourcing import (
    WORKFLOW_VARIABLE_NAMESPACE,
    VariablePath,
)

T = WorkflowVariableTypeEnum

# Matches migration 28 (basic patient) + 29 (system context) + 30 (collection/workflow).
# Keep in sync with Alembic seeds when adding variables.
BUILTIN_VARIABLE_TYPE_MAP: Dict[str, WorkflowVariableTypeEnum] = {
    # --- migration 28 ---
    "patient.id": T.STRING,
    "patient.name": T.STRING,
    "patient.sex": T.STRING,
    "patient.date_of_birth": T.DATE,
    "patient.is_exact_date_of_birth": T.BOOLEAN,
    "patient.age": T.INTEGER,
    "patient.is_pregnant": T.BOOLEAN,
    "patient.household_number": T.STRING,
    "patient.zone": T.STRING,
    "patient.village_number": T.STRING,
    "patient.is_archived": T.BOOLEAN,
    # --- migration 29 (local-date-time is string after migration 30) ---
    "local-date": T.DATE,
    "local-time": T.STRING,
    "local-date-time": T.STRING,
    "current-user.id": T.INTEGER,
    "current-user.name": T.STRING,
    "current-user.username": T.STRING,
    "current-user.email": T.STRING,
    "current-user.health_facility_name": T.STRING,
    "current-user.role": T.STRING,
    # --- migration 30 (also covered by path inference) ---
    "vitals.size": T.INTEGER,
    "vitals[latest].systolic_blood_pressure": T.INTEGER,
    "vitals[latest].diastolic_blood_pressure": T.INTEGER,
    "vitals[latest].heart_rate": T.INTEGER,
    "vitals[latest].date_taken": T.INTEGER,
    "pregnancies[latest].start_date": T.INTEGER,
    "all_wf[latest].status": T.STRING,
    "wf.info.status": T.STRING,
    "wf.info.start_date": T.INTEGER,
}

COLLECTION_NAMESPACES = frozenset(
    {
        "vitals",
        "pregnancies",
        "referrals",
        "assessments",
        "forms",
        "all_wf",
    }
)

# wf.info.* metadata (workflow_instance marshaled fields).
_WF_INFO_FIELD_TYPES: Dict[str, WorkflowVariableTypeEnum] = {
    "start_date": T.INTEGER,
    "completion_date": T.INTEGER,
    "last_edited": T.INTEGER,
    "current_step_id": T.STRING,
    "status": T.STRING,
    "name": T.STRING,
    "description": T.STRING,
    "id": T.STRING,
    "workflow_template_id": T.STRING,
    "patient_id": T.STRING,
}

# vitals / reading dict leaves (marshaled ORM).
_VITAL_FIELDS: Dict[str, WorkflowVariableTypeEnum] = {
    "systolic_blood_pressure": T.INTEGER,
    "diastolic_blood_pressure": T.INTEGER,
    "heart_rate": T.INTEGER,
    "date_taken": T.INTEGER,
    "last_edited": T.INTEGER,
    "is_flagged_for_follow_up": T.BOOLEAN,
}

_URINE_FIELDS: Dict[str, WorkflowVariableTypeEnum] = {
    "leukocytes": T.STRING,
    "nitrites": T.STRING,
    "glucose": T.STRING,
    "protein": T.STRING,
    "blood": T.STRING,
}

_PREGNANCY_FIELDS: Dict[str, WorkflowVariableTypeEnum] = {
    "id": T.INTEGER,
    "start_date": T.INTEGER,
    "end_date": T.INTEGER,
    "outcome": T.STRING,
    "last_edited": T.INTEGER,
    "patient_id": T.STRING,
}

# all_wf: marshaled workflow_instance (shallow).
_ALL_WF_FIELDS: Dict[str, WorkflowVariableTypeEnum] = {
    "start_date": T.INTEGER,
    "completion_date": T.INTEGER,
    "last_edited": T.INTEGER,
    "status": T.STRING,
    "name": T.STRING,
    "description": T.STRING,
    "id": T.STRING,
    "workflow_template_id": T.STRING,
    "patient_id": T.STRING,
    "current_step_id": T.STRING,
}


def _infer_from_field_path(
    namespace: str, field_path: list[str]
) -> WorkflowVariableTypeEnum | None:
    if not field_path:
        return None

    if namespace == "reading":
        if field_path[0] == "urine_test" and len(field_path) >= 2:
            return _URINE_FIELDS.get(field_path[-1])
        return _VITAL_FIELDS.get(field_path[-1])

    if (
        namespace == WORKFLOW_VARIABLE_NAMESPACE
        and field_path[0] == "info"
        and len(field_path) >= 2
    ):
        key = field_path[-1]
        return _WF_INFO_FIELD_TYPES.get(key)

    if namespace == "vitals":
        if field_path[0] == "urine_test" and len(field_path) >= 2:
            return _URINE_FIELDS.get(field_path[-1])
        return _VITAL_FIELDS.get(field_path[-1])

    if namespace == "pregnancies":
        return _PREGNANCY_FIELDS.get(field_path[-1])

    if namespace == "pregnancy":
        return _PREGNANCY_FIELDS.get(field_path[-1])

    if namespace == "all_wf":
        return _ALL_WF_FIELDS.get(field_path[-1])

    if namespace in ("referrals", "assessments", "forms"):
        # Phase 4 placeholders; extend when resolvers return stable shapes.
        return None

    return None


def infer_expected_type_from_tag(tag: str) -> WorkflowVariableTypeEnum | None:
    """
    Infer a catalogue type from variable syntax when a row is not in the DB map.

    Handles collection size, ``wf.info.*``, and common collection field leaves.
    """
    vp = VariablePath.from_string(tag)
    if vp is None:
        return None

    if vp.namespace in COLLECTION_NAMESPACES:
        if vp.collection_index is None and vp.field_path == ["size"]:
            return T.INTEGER
        return _infer_from_field_path(vp.namespace, vp.field_path)

    if (
        vp.namespace == WORKFLOW_VARIABLE_NAMESPACE
        and vp.collection_index is None
        and vp.field_path
        and vp.field_path[0] != "info"
    ):
        # Dynamic wf.<field_tag> — JSON values may be any; skip coercion.
        return None

    return _infer_from_field_path(vp.namespace, vp.field_path)


def get_expected_type_for_variable(tag: str) -> WorkflowVariableTypeEnum | None:
    """
    Return the expected type for a variable tag, or None if coercion should be skipped.

    Order: built-in catalogue map (from seeds), then path inference.
    """
    direct = BUILTIN_VARIABLE_TYPE_MAP.get(tag)
    if direct is not None:
        return direct
    return infer_expected_type_from_tag(tag)


def register_builtin_variable_type(
    tag: str, variable_type: WorkflowVariableTypeEnum
) -> None:
    """Register or override a type (primarily for tests)."""
    BUILTIN_VARIABLE_TYPE_MAP[tag] = variable_type
