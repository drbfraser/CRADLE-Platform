from flask import abort, g
from sqlalchemy.orm import Query

import data.db_operations as crud
from common import user_utils
from enums import RoleEnum
from service.patient_authorization import (
    can_access_patient,
    can_assign_existing_patient,
    scope_query_to_accessible_patients,
)


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


def load_authorized_patient_resource(resource_model, resource_id):
    resource = crud.read(resource_model, id=resource_id)
    if resource is None:
        abort(404, description="Patient resource not found.")
    require_patient_access(resource.patient_id)
    return resource


def require_existing_patient_assignment() -> dict:
    current_user = user_utils.get_current_user_from_jwt()
    if not can_assign_existing_patient(current_user):
        abort(403, description="Not authorized to assign an existing patient.")
    mark_authorization_checked()
    return current_user


def scope_patient_query(
    query: Query, patient_id_column, user: user_utils.UserDict
) -> Query:
    query = scope_query_to_accessible_patients(query, patient_id_column, user)
    mark_authorization_checked()
    return query
