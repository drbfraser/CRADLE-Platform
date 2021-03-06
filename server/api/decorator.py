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

def roles_required(listOfRoles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):

            #Verify we have a JWT
            verify_jwt_in_request()
            identity = get_jwt_identity()
            flag = False

            #Check that at least one the roles required is in the JWT. 
            for item in listOfRoles:
                if item.name in identity['roles']:
                    flag = True
            if flag:
                return fn(*args, **kwargs)
            else:
                return {'Error' : 'This user does not have the required privilege'}, 401
                
        return decorator

    return wrapper