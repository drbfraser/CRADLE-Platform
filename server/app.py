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
import json

sys.path.append(os.path.dirname(os.path.realpath(__file__)))

import config
import routes

import logging
from config import Config
from logging.config import dictConfig
from flask_jwt_extended import (
    get_jwt_identity,
    verify_jwt_in_request,
)
from flask import request, jsonify

dictConfig(Config.LOGGING)
LOGGER = logging.getLogger(__name__)

app = config.app
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

@app.before_request
def log_request_details():
    '''
    middleware function for logging changes made by users
    '''

    if len(request.data) == 0:
        return

    try:
        verify_jwt_in_request() 
        requestor_info = get_jwt_identity()
    except:
        requestor_data = {}

    req_data = json.loads(request.data.decode('utf-8'))
    print(type(req_data), req_data)

    requst_data = {}
    for key in req_data:
        if "password" in key.lower():
            continue
        else:
            requst_data[key] = req_data[key]
    extra = {
        "Request Information": requst_data,
        "Requestor Information": requestor_data
    }
    message = f"Accessing Endpoint: {request.endpoint}"
    LOGGER.info(message, extra=extra)

if __name__ == "__main__":
    app.run(debug=True, host=host, port=port)

