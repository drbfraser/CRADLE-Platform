import datetime
import json
import logging.config
import os
from functools import lru_cache
from typing import ClassVar

import environs
from environs import Env
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_openapi3.models.info import Info
from flask_openapi3.openapi import OpenAPI as FlaskOpenAPI
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

# Versioning system follows : https://semver.org/
app_version = "1.0.0"


class Config:
    env = Env()
    env.read_env()

    try:
        db_user = env("DB_USERNAME")
        db_pw = env("DB_PASSWORD")
        db_hostname = env("DB_HOSTNAME")
        db_port = env("DB_PORT")
        db_name = env("DB_NAME")
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

    # ex: 'mysql+pymysql://root:123456@localhost:3306/cradle'

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{db_user}:{db_pw}@{db_hostname}:{db_port}/{db_name}"
    )

    print(f"SQLALCHEMY_DATABASE_URI: {SQLALCHEMY_DATABASE_URI}")

    LOGGING: ClassVar = {
        "version": 1,
        "disable_existing_loggers": False,
        "filters": {
            "backend_filter": {"backend_module": "backend"},
            "request_id": {
                "()": "common.request_id_utils.RequestIdFilter",
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


class TestConfig(Config):
    env = Env()
    env.read_env()

    try:
        db_user = env("DB_USERNAME")
        db_pw = env("DB_PASSWORD")
        db_port = env("DB_PORT")
    except environs.EnvError:
        print(
            "******************************************************************************************",
        )
        print(
            "DB_USERNAME, DB_PASSWORD, and DB_PORT environment variable not set",
        )
        print(
            "******************************************************************************************",
        )

    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{db_user}:{db_pw}@cradle_mysql_test_db:{db_port}/testing_cradle"


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, set):
            return list(o)
        if isinstance(o, datetime.datetime):
            return str(o)
        return json.JSONEncoder.default(self, o)


def setup_logging():
    is_testing = os.environ.get("TESTING", "False").lower() == "true"

    if is_testing:
        logging_config = Config.LOGGING.copy()
        logging_config["handlers"] = {"console": logging_config["handlers"]["console"]}
        logging_config["loggers"] = {
            "": {"handlers": ["console"], "level": "DEBUG"},
            "flask": {"level": "INFO"},
            "sqlalchemy": {"level": "INFO"},
            "werkzeug": {"level": "INFO"},
        }
        logging.config.dictConfig(logging_config)
    else:
        logging.config.dictConfig(Config.LOGGING)

    return logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_logger():
    return setup_logging()


API_DOCS_TITLE = "Cradle-Platform REST API"
jwt_security = {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}

db = SQLAlchemy(
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

migrate = Migrate()
ma = Marshmallow()

app = FlaskOpenAPI(
    import_name=__name__,
    static_folder="../client/build",
    doc_prefix="/apidocs",
    info=Info(title=API_DOCS_TITLE, version=app_version),
    security_schemes={"jwt": jwt_security},
)
app.config["PROPAGATE_EXCEPTIONS"] = True
app.config["BASE_URL"] = ""
app.config["UPLOAD_FOLDER"] = "/uploads"
app.config["MAX_CONTENT_LENGTH"] = 64 * 1e6
CORS(app, supports_credentials=True)
app.config.from_object(Config)
app.json_encoder = JSONEncoder
db.init_app(app)
migrate.init_app(app, db, compare_type=True)
ma.init_app(app)
