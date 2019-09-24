import os
import datetime
import json
from flask_cors import CORS
from flask import Flask, request
from flask_restful import Resource, Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager

from flask_bcrypt import Bcrypt

basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    #SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:huangkeyi.0416@localhost:3306/cradle' # ex: 'mysql+pymysql://root:123456@localhost:3306/mydb'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'test-cradle.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT_SECRET_KEY= os.environ.get('SECRET')
    JWT_SECRET_KEY = 'very secret'
    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(days=1) 

class JSONEncoder(json.JSONEncoder):

    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, set):
            return list(o)
        if isinstance(o, datetime.datetime):
            return str(o)
        return json.JSONEncoder.default(self, o)


FLASK_APP = 'app.py'
FLASK_DEBUG=1

app = Flask(__name__)
CORS(app)
api = Api(app)
app.config.from_object(Config)

flask_bcrypt = Bcrypt(app)
jwt = JWTManager(app)
app.json_encoder = JSONEncoder

db = SQLAlchemy(app)
migrate = Migrate(app, db)
ma = Marshmallow(app)
