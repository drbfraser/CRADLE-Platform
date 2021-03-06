from functools import wraps

from flask import Flask
from flask import jsonify

from flask_jwt_extended import create_access_token
# from flask_jwt_extended import get_jwt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import verify_jwt_in_request

from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import get_jwt_claims


# Here is a custom decorator that verifies the JWT is present in the request,
# as well as insuring that the JWT has a claim indicating that this user is
# an administrator
# def admin_required():
#     print("got here")
#     def wrapper(fn):
#         @wraps(fn)
#         def decorator(*args, **kwargs):
#             verify_jwt_in_request()
#             identity = get_jwt_identity()
#             if identity["roles"] == 'ADMIN':
#                 return fn(*args, **kwargs)
#             else:
#                 return jsonify({'msg' : 'Admins only!'}), 403

#         return decorator

#     return wrapper


def roles_required(listOfRoles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            identity = get_jwt_identity()
            flag = False
            for item in listOfRoles:
                if item.name in identity['roles']:
                    flag = True
            if flag:
                return fn(*args, **kwargs)
            else:
                return {'Error' : 'This user does not have the required privilege'}, 401
        return decorator

    return wrapper