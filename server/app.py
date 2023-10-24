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
import re
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


@app.after_request
def log_request_details(response):
    """
    middleware function for logging changes made by users
    """
    try:
        try:
            verify_jwt_in_request()
            requestor_data = get_jwt_identity()
        except:
            requestor_data = {}

        if len(request.data) == 0:
            req_data = request.args.to_dict()
        else:
            req_data = json.loads(request.data.decode("utf-8"))

        request_data = {}
        for key in req_data:
            if "password" in key.lower():
                continue
            else:
                request_data[key] = req_data[key]

        if response.status_code == 200:
            status_str = "Successful"
        else:
            status_str = "Unsuccessful"

        extra = {
            "Response Status": f"{response.status_code} ({status_str})",
            "Request Information": request_data,
            "Requestor Information": requestor_data,
        }

        message = f"Accessing Endpoint: {re.search(r'/api/.*', request.url).group(0)} Request Method: {request.method}"
        LOGGER.info(message, extra=extra)
    except:
        pass
    return response


if __name__ == "__main__":
    app.run(debug=True, host=host, port=port)
