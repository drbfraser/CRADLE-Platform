from typing import Optional

import data.db_operations as crud
from common.user_utils import UserDict
from enums import RoleEnum
from models import PatientAssociationsOrm, SupervisesTable


def can_access_patient(user: UserDict, patient_id: str) -> bool:
    role = user.get("role")

    if role == RoleEnum.ADMIN.value:
        return True

    if role == RoleEnum.HCW.value:
        facility_name = user.get("health_facility_name")
        if not facility_name:
            return False
        return _association_exists(
            patient_id=patient_id,
            facility_name=facility_name,
        )

    user_id = _get_user_id(user)
    if user_id is None:
        return False

    if role == RoleEnum.CHO.value:
        return _association_exists(
            patient_id=patient_id,
            user_id=user_id,
        ) or _supervised_vht_association_exists(user_id, patient_id)

    if role == RoleEnum.VHT.value:
        return _association_exists(
            patient_id=patient_id,
            user_id=user_id,
        )

    return False


def _association_exists(
    patient_id: str,
    facility_name: Optional[str] = None,
    user_id: Optional[int] = None,
) -> bool:
    query = crud.db_session.query(PatientAssociationsOrm.id).filter(
        PatientAssociationsOrm.patient_id == patient_id
    )
    if facility_name is not None:
        query = query.filter(
            PatientAssociationsOrm.health_facility_name == facility_name
        )
    if user_id is not None:
        query = query.filter(PatientAssociationsOrm.user_id == user_id)
    return query.first() is not None


def _supervised_vht_association_exists(cho_id: int, patient_id: str) -> bool:
    return (
        crud.db_session.query(PatientAssociationsOrm.id)
        .join(
            SupervisesTable,
            PatientAssociationsOrm.user_id == SupervisesTable.c.vht_id,
        )
        .filter(
            PatientAssociationsOrm.patient_id == patient_id,
            SupervisesTable.c.cho_id == cho_id,
        )
        .first()
        is not None
    )


def _get_user_id(user: UserDict) -> Optional[int]:
    try:
        return int(user["id"])
    except (KeyError, TypeError, ValueError):
        return None
