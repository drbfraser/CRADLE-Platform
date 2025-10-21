import importlib
import os
import types

import pytest

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
def _stub_marshmallow_and_invariants(
    monkeypatch: pytest.MonkeyPatch, marshal_mod
) -> None:
    """
    Replace DB-bound Marshmallow schemas and side-effectful invariants with stubs.
    ----
    `data.marshal.__load()` asks `get_schema_for_model()` for a Marshmallow
    SQLAlchemy schema tied to Flask-SQLAlchemy's `db.session`. Calling
    `schema().load(data)` then requires an active Flask app context + DB.
    That's integration territory, not unit testing.

    What this fixture does
    ----------------------
    `data.marshal.get_schema_for_model` to return a tiny schema
    factory whose `.load()` wraps the input dict into a `types.SimpleNamespace`.
    No Flask, no DB, no validation—just attribute access.
    """

    class _StubSchema:
        """Minimal stand-in for a Marshmallow schema (no validation, no DB)."""

        def dump(self, obj):  # pragma: no cover - trivial
            return obj

        def load(self, data: dict):
            return types.SimpleNamespace(**data)

    def _fake_get_schema_for_model(_model_cls):
        """
        Return a factory callable that behaves like a schema class.

        `__load()` calls:
            schema = get_schema_for_model(ModelClass)
            return schema().load(d)

        So we return a "class-like" callable where `schema()` yields an object
        exposing `.load(...)`.
        """
        return lambda: _StubSchema()

    # Route schema resolution to the stub so schema().load(...) never touches Flask/DB.
    monkeypatch.setattr(marshal_mod, "get_schema_for_model", _fake_get_schema_for_model)

    # Kill DB side-effects during unmarshal of readings.
    monkeypatch.setattr(
        marshal_mod.invariant, "resolve_reading_invariants", lambda _x: None
    )
