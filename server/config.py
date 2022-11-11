import os
import datetime
import json
from flask_cors import CORS
from flask import Flask, request, send_from_directory
from flask_restful import Resource, Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from environs import Env
import environs
from flask_bcrypt import Bcrypt
from flasgger import Swagger
import logging.config

# Versioning system follows : https://semver.org/
app_version = "1.0.0"

basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    env = Env()
    env.read_env()

    try:
        db_user = env("DB_USERNAME")
        db_pw = env("DB_PASSWORD")
        db_hostname = env("DB_HOSTNAME")
        db_port = env("DB_PORT")
        db_name = env("DB_NAME")
        JWT_SECRET_KEY = env("JWT_SECRET_KEY")

    except environs.EnvError:
        print(
            "******************************************************************************************"
        )
        print(
            "DB_USERNAME, DB_PASSWORD, DB_HOSTNAME, DB_PORT, OR DB_NAME environment variable not set"
        )
        print(
            "******************************************************************************************"
        )

    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{db_user}:{db_pw}@{db_hostname}:{db_port}/{db_name}"  # ex: 'mysql+pymysql://root:123456@localhost:3306/cradle'

    print("SQLALCHEMY_DATABASE_URI: " + SQLALCHEMY_DATABASE_URI)

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(days=7)
    LOGGING = {
        "version": 1,
        "disable_existing_loggers":False,
        "filters": {
            "backend_filter": {"backend_module": "backend"},
            "request_id": {
                '()': 'utils.RequestIdFilter',
             }
        },
        "formatters": {
            "standard": {"format": "%(asctime)s %(name)-12s %(levelname) -8s %(request_id)s - %(message)s"},
            "compact": {"format": "%(asctime)s %(message)s"}
        },
        "handlers":{
            "console":{
                "class": "logging.StreamHandler",
                "level": "DEBUG",
                "formatter": "standard",
                "filters": ['request_id'],
                "stream": "ext://sys.stdout",#print to CLI
            },
            "file":{
                "class": "logging.handlers.TimedRotatingFileHandler",
                "level": "DEBUG",
                "filename": "/var/log/cradle-application.log",
                "when": "D",
                "interval": 1,
                "formatter": "standard" #print to file
            }
        },
        "loggers": {
            "": {"handlers": ["console","file"], "level":"DEBUG"},
            "flask": {"level":"INFO"},
            "sqlalchemy": {"level":"INFO"},
            "werkzeug":{"level":"INFO"},
        }
    }


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, set):
            return list(o)
        if isinstance(o, datetime.datetime):
            return str(o)
        return json.JSONEncoder.default(self, o)


FLASK_APP = "app.py"

app = Flask(__name__, static_folder="../client/build")
app.config["SWAGGER"] = {"openapi": "3.0.2"}
app.config["PROPAGATE_EXCEPTIONS"] = True
app.config["BASE_URL"] = ""
app.config["UPLOAD_FOLDER"] = "/uploads"
app.config["MAX_CONTENT_LENGTH"] = 64 * 1e6
swagger = Swagger(app)

CORS(app)
api = Api(app)
app.config.from_object(Config)

flask_bcrypt = Bcrypt(app)
jwt = JWTManager(app)
app.json_encoder = JSONEncoder

db = SQLAlchemy(app)
migrate = Migrate(app, db, compare_type=True)
ma = Marshmallow(app)



