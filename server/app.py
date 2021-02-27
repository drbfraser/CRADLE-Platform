"""
    @File: app.py
    @ Description:
    - This file is the main entry point for the server
    - It's main job is to initilize all of its connections including:
      * Connect to database
      * Serve React App
      * Initilize server routes
      * Start Flask server
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.realpath(__file__)))

import config
import routes
from flask_jwt_extended import JWTManager



app = config.app

#The manager allows us to add more pieces of information into the jwt token
jwt = JWTManager(app)

#To-Do: Create a whitelist that may be appended to, to increase the number of ids that are used
#to represent admin
@jwt.user_claims_loader
def add_claims_to_jwt(identity):
    isAdmin = False
    if(identity["userId"] == 1):
        isAdmin = True
    return{'is_admin' : isAdmin}

routes.init(config.api)

host = "0.0.0.0"
port = os.environ.get("PORT")

if port is None:
    port = 5000
    print("PORT environment variable not found. Using default ({}).".format(port))
else:
    print("PORT environment variable found:", port)

print("Binding to " + host + ":" + port)

import models  # needs to be after db instance



if __name__ == "__main__":
    app.run(debug=True, host=host, port=port)
