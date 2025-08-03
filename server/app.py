#! /usr/bin/env python3

# We do not care about sorting the imports(or their location) in this file because it could lead to import errors
# ruff: noqa: I001
"""
@File: app.py
@ Description:
- This file is the main entry point for the server
- It's main job is to initialize all of its connections including:
  * Connect to database
  * Serve React App
  * Initialize server routes
  * Start Flask server
"""

import sys
import os
import json

sys.path.append(os.path.dirname(os.path.realpath(__file__)))

import application
import logging
from config import Config
from logging.config import dictConfig
from flask import Response, request
from werkzeug.exceptions import HTTPException
from humps import camelize
from api.resources import api

dictConfig(Config.LOGGING)
LOGGER = logging.getLogger(__name__)

app = application.create_app()

# Register Blueprints
app.register_api(api)

host = "0.0.0.0"
port = os.environ.get("PORT")

if port is None:
    port = 5000
    print(f"PORT environment variable not found. Using default ({port}).")
else:
    print("PORT environment variable found:", port)

print("Binding to " + host + ":" + port)


@app.errorhandler(HTTPException)
def handle_http_exception(e):
    """
    Return JSON instead of HTML for HTTP errors.
    """
    response: Response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps(
        {
            "code": e.code,
            "name": e.name,
            "description": e.description,
        }
    )
    response.content_type = "application/json"
    return response


@app.after_request
def convert_response_body_to_camel_case(response: Response):
    """
    Intercepts responses and converts keys to camel case.
    """
    if request.path.startswith(("/openapi", "/apidocs")):
        return response

    if response.mimetype == "application/json":
        response_body = camelize(json.loads(response.data))
        response.data = json.dumps(response_body)
    return response


if __name__ == "__main__":
    app.run(debug=True, host=host, port=port)
