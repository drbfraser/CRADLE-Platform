import os

def _set_default_db_env() -> None:

    defaults = {
        "DB_USERNAME": "user",
        "DB_PASSWORD": "password",
        "DB_HOSTNAME": "localhost",
        "DB_PORT": "5432",
        "DB_NAME": "testdb",
    }

    for key, value in defaults.items():
        os.environ.setdefault(key, value)

    os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")


_set_default_db_env()
