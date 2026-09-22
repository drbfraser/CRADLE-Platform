from functools import wraps

from common import user_utils


def roles_required(accepted_roles):
    """Restrict endpoint access to users whose role is in accepted_roles, returning 401 otherwise."""

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
