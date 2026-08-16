"""Pytest configuration for form_utils unit tests."""

import logging.config
import os

# CI unit tests do not set DB env vars; defaults must exist before importing form_utils.
_DB_DEFAULTS = {
    "DB_USERNAME": "user",
    "DB_PASSWORD": "password",
    "DB_HOSTNAME": "localhost",
    "DB_PORT": "3306",
    "DB_NAME": "testdb",
    "FLASK_ENV": "testing",
    "TESTING": "1",
}
for _key, _value in _DB_DEFAULTS.items():
    os.environ.setdefault(_key, _value)

# Avoid writing to /var/log/application.log during local unit test runs.
_original_dict_config = logging.config.dictConfig


def _dict_config_without_file_handler(config):
    patched = dict(config)
    handlers = dict(patched.get("handlers", {}))
    handlers.pop("file", None)
    patched["handlers"] = handlers

    for logger_cfg in patched.get("loggers", {}).values():
        if "handlers" in logger_cfg:
            logger_cfg["handlers"] = [
                handler for handler in logger_cfg["handlers"] if handler != "file"
            ]

    _original_dict_config(patched)


logging.config.dictConfig = _dict_config_without_file_handler
