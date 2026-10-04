from flask import abort, g

from common import user_utils
from enums import RoleEnum
from service.patient_authorization import can_access_patient


def mark_authorization_checked() -> None:
    g.authorization_checked = True


def require_role(*accepted_roles: RoleEnum) -> dict:
    current_user = user_utils.get_current_user_from_jwt()
    accepted_role_values = {role.value for role in accepted_roles}
    if current_user["role"] not in accepted_role_values:
        abort(403, description="This user does not have the required privileges.")
    mark_authorization_checked()
    return current_user


def require_admin_or_self(target_user_id: int) -> None:
    current_user = user_utils.get_current_user_from_jwt()
    if (
        current_user["role"] != RoleEnum.ADMIN.value
        and current_user["id"] != target_user_id
    ):
        abort(403, description="Not authorized to access this user.")
    mark_authorization_checked()


def require_patient_access(patient_id: str) -> None:
    current_user = user_utils.get_current_user_from_jwt()
    if not can_access_patient(current_user, patient_id):
        abort(403, description="Not authorized to access this patient.")
    mark_authorization_checked()
