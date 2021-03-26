from functools import wraps
from flask import Flask
from flask import jsonify
from flask_jwt_extended import (
    create_access_token,
    JWTManager,
    verify_jwt_in_request,
    get_jwt_identity,
    get_jwt_claims,
)


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
