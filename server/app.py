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

from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

import os
import routes

FLASK_APP = 'app.py'

app = Flask(__name__)
CORS(app)
api = Api(app)
app.config.from_object(Config)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# For Heroku configuration
port = os.environ.get('PORT')
host = None
if port is None:
    print('PORT environment variable not found. Using Flask default.')
else:
    print('PORT environment variable found:', port)
    print('Binding to host 0.0.0.0')
    host = '0.0.0.0'

routes.init(api)

import models # needs to be after db instance

if __name__ == '__main__':
    app.run(debug=True, host=host, port=port)

