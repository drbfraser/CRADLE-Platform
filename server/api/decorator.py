from datetime import datetime
from functools import wraps
from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt_identity,
)

import data.crud as crud
from models import PatientAssociations
from enums import RoleEnum


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
            user_role = identity["role"]
            if user_role in (RoleEnum.VHT.value, RoleEnum.HCW.value):
                user_id = identity["userId"]
                if not crud.read(
                    PatientAssociations, patientId=patient_id, userId=user_id
                ):
                    # TODO: convert print statement to system logging
                    current_time = datetime.now().strftime("%H:%M:%S")
                    print(
                        f"User {user_id} accessed patient {patient_id} at {current_time}"
                    )
                    return {"message": "Unauthorized to access this patient."}, 403

            return fn(patient_id, *args, **kwargs)

        return decorator

    return wrapper
