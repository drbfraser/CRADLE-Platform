from functools import wraps
from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt_identity,
)

import data.crud as crud
from models import PatientAssociations, RoleEnum


def roles_required(accepted_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):

            # Ensure that user is first and foremost actually logged in
            verify_jwt_in_request()
            user_info = get_jwt_identity()
            user_has_permissions = False

            # Check that one of the accepted roles is in the JWT.
            for role in accepted_roles:
                if role.value == user_info["role"]:
                    user_has_permissions = True

            if user_has_permissions:
                return fn(*args, **kwargs)
            else:
                return {
                    "message": "This user does not have the required privilege"
                }, 401

        return decorator

    return wrapper


def patient_association_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(patient_id, *args, **kwargs):
            verify_jwt_in_request()

            identity = get_jwt_identity()
            if identity["role"] == RoleEnum.VHT.value:
                user_id = identity["userId"]
                if not crud.read(
                    PatientAssociations, patientId=patient_id, userId=user_id
                ):
                    return {"message": "Unauthorized to patient information."}, 401

            return fn(patient_id, *args, **kwargs)

        return decorator

    return wrapper
