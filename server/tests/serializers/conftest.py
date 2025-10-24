# conftest.py
import importlib
import os
import types
from contextlib import nullcontext

import pytest

# Set environment variables for testing. Defaults are for MySQL
_DEFAULTS = {
    "DB_USERNAME": "user",
    "DB_PASSWORD": "password",
    "DB_HOSTNAME": "localhost",
    "DB_PORT": "3306",
    "DB_NAME": "testdb",
    "FLASK_ENV": "testing",
    "TESTING": "1",
}
for k, v in _DEFAULTS.items():
    os.environ.setdefault(k, v)


@pytest.fixture(scope="session")
def marshal_mod():
    """Late-import the marshal module after env is set."""
    return importlib.import_module("data.marshal")


@pytest.fixture(autouse=True)
def isolate_marshal_and_capture_schema_loads(
    monkeypatch: pytest.MonkeyPatch, marshal_mod
) -> list[dict]:
    """
    Helper fixture to isolate the marshal module from the DB and capture
    schema().load(...) calls made by it.

    Returns a list of dicts, where each dict contains the model name and
    data passed to schema().load(...).

    This fixture late-imports the marshal module after the environment is set,
    and then:

    - Routes schema resolution to a stub so schema().load(...) never touches
    Flask/DB.
    - Kills DB side-effects during unmarshal of readings.
    - Makes the schema_load_calls list visible to tests via the helper fixture
    below.

    This fixture is automatically used by all tests in this module.
    """
    schema_load_calls: list[dict] = []

    def _fake_get_schema_for_model(_model_cls):
        """
        Stub replacement for get_schema_for_model(_model_cls) that records
        each call to schema().load(...) with the model name and data passed in.
        """

        class _StubSchema:
            def dump(self, obj):  # pragma: no cover - trivial
                """
                Trivial implementation that just returns the input obj.

                :param obj: Any object to dump.
                :return: The input obj.
                """
                return obj

            def load(self, data: dict):
                """
                Load a model instance from ``dict`` using the model's Marshmallow schema.

                :param data: Field dictionary for the model.
                :return: Deserialized model instance.
                :raises MARSHMALLOW.ValidationError: If validation fails.
                """
                schema_load_calls.append(
                    {"__model__": _model_cls.__name__, **dict(data)}
                )
                return types.SimpleNamespace(**data)

        # __load expects a *class* it can call: schema().load(...)
        return lambda: _StubSchema()

    monkeypatch.setattr(
        marshal_mod, "db_session", types.SimpleNamespace(no_autoflush=nullcontext())
    )

    # Route schema resolution to the stub so schema().load(...) never touches Flask/DB.
    monkeypatch.setattr(marshal_mod, "get_schema_for_model", _fake_get_schema_for_model)

    # Kill DB side-effects during unmarshal of readings.
    monkeypatch.setattr(
        marshal_mod.invariant, "resolve_reading_invariants", lambda _x: None
    )

    # Make schema_load_calls visible to tests via the helper fixture below
    monkeypatch.setattr(
        marshal_mod, "_test_load_calls", schema_load_calls, raising=False
    )

    return {"schema_load_calls": schema_load_calls}


@pytest.fixture
def schema_load_calls(isolate_marshal_and_capture_schema_loads) -> list[dict]:
    """
    A fixture that captures and returns a list of dicts, where each dict
    contains the model name and data passed to schema().load(...)
    during the execution of tests in this module.

    This fixture is automatically used by all tests in this module,
    and is intended to be used as a helper to inspect the database
    interactions of the marshal module during tests.
    """
    return isolate_marshal_and_capture_schema_loads["schema_load_calls"]


@pytest.fixture
def schema_loads_by_model(schema_load_calls):
    """
    A fixture that returns a function that takes a model name and returns
    a list of dicts, where each dict contains the model name and data passed
    to schema().load() during the execution of tests in this module.

    The returned function can be used to inspect the database interactions
    of the marshal module during tests.

    :param schema_load_calls: A list of dicts, where each dict contains the model name
        and data passed to schema().load() during the execution of tests in this
        module.
    :return: A function that takes a model name and returns a list of dicts.
    """
    def _by(model_name: str) -> list[dict]:
        return [c for c in schema_load_calls if c.get("__model__") == model_name]
    return _by