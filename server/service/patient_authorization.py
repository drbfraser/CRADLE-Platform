from typing import Optional

import data.db_operations as crud
from common.user_utils import UserDict
from enums import RoleEnum
from models import PatientAssociationsOrm


def can_access_patient(user: UserDict, patient_id: str) -> bool:
    role = user.get("role")

    if role in {
        RoleEnum.ADMIN.value,
        RoleEnum.HCW.value,
        RoleEnum.CHO.value,
    }:
        return True

    if role != RoleEnum.VHT.value:
        return False

    user_id = _get_user_id(user)
    if user_id is None:
        return False

    return _association_exists(patient_id, user_id)


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
