import logging
from functools import wraps

from common import user_utils
import data.db_operations as crud
from enums import RoleEnum
from models import PatientAssociationsOrm

LOGGER = logging.getLogger(__name__)


def roles_required(accepted_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # Ensure that user is first and foremost actually logged in
            current_user = user_utils.get_current_user_from_jwt()
            user_has_permissions = False

            # Check that one of the accepted roles is in the JWT.
            for role in accepted_roles:
                if role.value == current_user.get("role"):
                    user_has_permissions = True

            if user_has_permissions:
                return fn(*args, **kwargs)
            return {
                "message": "This user does not have the required privileges",
            }, 401

        return decorator

    return wrapper


def patient_association_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(patient_id, *args, **kwargs):
            current_user = user_utils.get_current_user_from_jwt()
            user_role = current_user["role"]
            if user_role == RoleEnum.VHT.value:  # Changed the condition here
                user_id = current_user["id"]
                if not crud.read(
                    PatientAssociationsOrm,
                    patientId=patient_id,
                    userId=user_id,
                ):
                    LOGGER.info(
                        "User accessed patient's record",
                        extra={
                            "user_id": user_id,
                            "patient_id": patient_id,
                        },
                    )
                    return {"message": "Not authorized to access this patient."}, 403

            return fn(patient_id, *args, **kwargs)

        return decorator

    return wrapper
