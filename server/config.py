import datetime
import json
import logging.config
import os
from pathlib import Path
from typing import ClassVar

import environs
from environs import Env
from flasgger import Swagger
from flask import Flask
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

# Versioning system follows : https://semver.org/
app_version = "1.0.0"

basedir = Path(os.path.dirname(__file__)).resolve()


class Config:
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
            "******************************************************************************************",
        )
        print(
            "DB_USERNAME, DB_PASSWORD, DB_HOSTNAME, DB_PORT, OR DB_NAME environment variable not set",
        )
        print(
            "******************************************************************************************",
        )

    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{db_user}:{db_pw}@{db_hostname}:{db_port}/{db_name}"  # ex: 'mysql+pymysql://root:123456@localhost:3306/cradle'

    print("SQLALCHEMY_DATABASE_URI: " + SQLALCHEMY_DATABASE_URI)

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(days=7)
    LOGGING: ClassVar = {
        "version": 1,
        "disable_existing_loggers": False,
        "filters": {
            "backend_filter": {"backend_module": "backend"},
            "request_id": {
                "()": "utils.RequestIdFilter",
            },
        },
        "formatters": {
            "json_formatter": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "fmt": "%(asctime) %(name)-12s %(levelname)-8s %(request_id)s - %(message)s",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "DEBUG",
                "formatter": "json_formatter",
                "filters": ["request_id"],
                "stream": "ext://sys.stdout",  # print to CLI
            },
            "file": {
                "class": "logging.handlers.TimedRotatingFileHandler",
                "level": "DEBUG",
                "formatter": "json_formatter",
                "filename": "/var/log/application.log",  # print to file
                "when": "D",
                "interval": 1,
            },
        },
        "loggers": {
            "": {"handlers": ["console", "file"], "level": "DEBUG"},
            "flask": {"level": "INFO"},
            "sqlalchemy": {"level": "INFO"},
            "werkzeug": {"level": "INFO"},
        },
    }
    logging.config.dictConfig(LOGGING)
    logger = logging.getLogger(__name__)

    logger.debug("Debug message")
    logger.info("Info message")


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
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

CORS(app, supports_credentials=True)
api = Api(app)
app.config.from_object(Config)

app.json_encoder = JSONEncoder

db = SQLAlchemy(
    app,
    metadata=MetaData(
        naming_convention={
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s",
        }
    ),
)
migrate = Migrate(app, db, compare_type=True)
ma = Marshmallow(app)
