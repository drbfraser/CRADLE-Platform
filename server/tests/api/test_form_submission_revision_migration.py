from importlib import import_module

from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine, text


def test_revision_migration_preserves_existing_submissions():
    migration = import_module(
        "migrations.versions.36_9be1fdea7def_add_revision_to_form_submission_v2"
    )
    engine = create_engine("sqlite://")
    with engine.begin() as connection:
        connection.execute(
            text("CREATE TABLE form_submission_v2 (id TEXT PRIMARY KEY)")
        )
        connection.execute(
            text("INSERT INTO form_submission_v2 (id) VALUES ('existing')")
        )
        with Operations.context(MigrationContext.configure(connection)):
            migration.upgrade()
        connection.execute(text("INSERT INTO form_submission_v2 (id) VALUES ('new')"))
        assert connection.execute(
            text("SELECT id, revision FROM form_submission_v2 ORDER BY id")
        ).fetchall() == [("existing", 1), ("new", 1)]
    engine.dispose()
