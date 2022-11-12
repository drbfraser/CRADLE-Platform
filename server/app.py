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

import logging
from config import Config
from logging.config import dictConfig

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


if __name__ == "__main__":
    app.run(debug=True, host=host, port=port)
