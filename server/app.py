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

app = config.app
routes.init(config.api)

# For Heroku configuration
port = os.environ.get("PORT")
host = None
if port is None:
    print("PORT environment variable not found. Using Flask default.")
else:
    print("PORT environment variable found:", port)
    print("Binding to host 0.0.0.0")
    host = "0.0.0.0"

import models  # needs to be after db instance

app.config["SWAGGER"]["openapi"] = "3.0.2"

if "-prod" in sys.argv:
    port = 8040
    host = "::"
    app.config["BASE_URL"] = "https://cmpt373.csil.sfu.ca:8048/"
else:
    app.config["BASE_URL"] = "http://localhost:5000/"

if __name__ == "__main__":
    app.run(debug=True, host=host, port=port)
