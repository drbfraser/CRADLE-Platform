from functools import wraps
from flask import Flask
from flask import jsonify
from flask_jwt_extended import create_access_token
from flask_jwt_extended import JWTManager
from flask_jwt_extended import verify_jwt_in_request
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import get_jwt_claims

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