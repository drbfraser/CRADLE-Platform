import logging
from functools import wraps

from authentication import cognito
from common import user_utils
from data import crud
from enums import RoleEnum
from models import PatientAssociationsOrm

LOGGER = logging.getLogger(__name__)


def roles_required(accepted_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # Ensure that user is first and foremost actually logged in
            username = cognito.get_username_from_jwt()
            user_dict = user_utils.get_user_dict_from_username(username)
            user_has_permissions = False

            # Check that one of the accepted roles is in the JWT.
            for role in accepted_roles:
                if role.value == user_dict.get("role"):
                    user_has_permissions = True

            if user_has_permissions:
                return fn(*args, **kwargs)
            return {
                "message": "This user does not have the required privileges",
            }, 401

        return decorator

    return wrapper


# def patient_association_required():
#     def wrapper(fn):
#         @wraps(fn)
#         def decorator(patient_id, *args, **kwargs):
#             verify_jwt_in_request()

#             identity = get_jwt_identity()
#             user_role = identity["role"]
#             if user_role in (RoleEnum.VHT.value, RoleEnum.HCW.value):
#                 user_id = identity["userId"]
#                 if not crud.read(
#                     PatientAssociations, patientId=patient_id, userId=user_id
#                 ):
#                     # TODO: convert print statement to system logging
#                     current_time = datetime.now().strftime("%H:%M:%S")
#                     print(
#                         f"User {user_id} accessed patient {patient_id} at {current_time}"
#                     )
#                     return {"message": "Unauthorized to access this patient."}, 403

#             return fn(patient_id, *args, **kwargs)

#         return decorator

#     return wrapper


def patient_association_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(patient_id, *args, **kwargs):
            cognito.verify_access_token()

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
                    return {"message": "Unauthorized to access this patient."}, 403

            return fn(patient_id, *args, **kwargs)

        return decorator

    return wrapper


def public_endpoint(function):
    """
    mark an endpoint handler as one that does not require login
    """
    function.is_public_endpoint = True
    return function
