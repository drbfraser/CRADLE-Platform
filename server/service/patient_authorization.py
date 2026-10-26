from typing import Optional

from sqlalchemy import exists, false
from sqlalchemy.orm import Query

import data.db_operations as crud
from common.user_utils import UserDict
from enums import RoleEnum, StrEnum
from models import PatientAssociationsOrm

UNRESTRICTED_PATIENT_ROLES = {
    RoleEnum.ADMIN.value,
    RoleEnum.HCW.value,
    RoleEnum.CHO.value,
}
EXISTING_PATIENT_ASSIGNMENT_ROLES = {
    RoleEnum.ADMIN.value,
    RoleEnum.HCW.value,
    RoleEnum.CHO.value,
}


class ReferralAction(StrEnum):
    CREATE = "create"
    ASSESS = "assess"
    CANCEL = "cancel"
    MARK_NOT_ATTENDED = "mark_not_attended"


ALL_ROLES = frozenset(role.value for role in RoleEnum)

# Intentionally apply relaxed rules for now as to not break existing functionality.
# This can be restricted further once policy rules are finalized.
REFERRAL_ACTION_ROLES = {
    ReferralAction.CREATE: ALL_ROLES,
    ReferralAction.ASSESS: ALL_ROLES,
    ReferralAction.CANCEL: ALL_ROLES,
    ReferralAction.MARK_NOT_ATTENDED: ALL_ROLES,
}


def can_assign_existing_patient(user: UserDict) -> bool:
    return user.get("role") in EXISTING_PATIENT_ASSIGNMENT_ROLES


def can_perform_referral_action(user: UserDict, action: ReferralAction) -> bool:
    return user.get("role") in REFERRAL_ACTION_ROLES[action]


def can_access_patient(user: UserDict, patient_id: str) -> bool:
    role = user.get("role")

    if role in UNRESTRICTED_PATIENT_ROLES:
        return True

    if role != RoleEnum.VHT.value:
        return False

    user_id = _get_user_id(user)
    if user_id is None:
        return False

    return _association_exists(patient_id, user_id)


def scope_query_to_accessible_patients(
    query: Query,
    patient_id_column,
    user: UserDict,
) -> Query:
    role = user.get("role")
    if role in UNRESTRICTED_PATIENT_ROLES:
        return query
    if role != RoleEnum.VHT.value:
        return query.filter(false())

    user_id = _get_user_id(user)
    if user_id is None:
        return query.filter(false())

    return query.filter(
        exists()
        .where(PatientAssociationsOrm.patient_id == patient_id_column)
        .where(PatientAssociationsOrm.user_id == user_id)
    )


def _association_exists(
    patient_id: str,
    user_id: int,
) -> bool:
    return (
        crud.db_session.query(PatientAssociationsOrm.id)
        .filter(
            PatientAssociationsOrm.patient_id == patient_id,
            PatientAssociationsOrm.user_id == user_id,
        )
        .first()
        is not None
    )


def _get_user_id(user: UserDict) -> Optional[int]:
    try:
        return int(user["id"])
    except (KeyError, TypeError, ValueError):
        return None
