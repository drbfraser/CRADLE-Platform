import os
from flask_cors import CORS
from flask import Flask, request
from flask_restful import Resource, Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow

basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{username}:{password}@localhost:3306/{db_name}' # ex: 'mysql+pymysql://root:123456@localhost:3306/mydb'
    # SQLALCHEMY_DATABASE_URI = 'sqlite:////test-cradle.db'


FLASK_APP = 'app.py'
FLASK_DEBUG=1

app = Flask(__name__)
CORS(app)
api = Api(app)
app.config.from_object(Config)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
ma = Marshmallow(app)
