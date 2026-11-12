from importlib import import_module
from pathlib import Path

import pytest
from alembic.migration import MigrationContext
from alembic.operations import Operations
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine, text


def test_migrations_have_one_head():
    scripts = ScriptDirectory(str(Path(__file__).resolve().parents[2] / "migrations"))
    assert len(scripts.get_heads()) == 1


@pytest.mark.parametrize(
    "current, missing",
    [
        ("36_9be1fdea7def", "40_add_patient_number"),
        ("40_add_patient_number", "36_9be1fdea7def"),
    ],
)
def test_merge_migration_connects_both_upgrade_paths(current, missing):
    scripts = ScriptDirectory(str(Path(__file__).resolve().parents[2] / "migrations"))
    pending = [
        migration.revision
        for migration in scripts.iterate_revisions(
            "41_c97928523839", current, implicit_base=True
        )
    ]
    assert "41_c97928523839" in pending
    assert missing in pending
    assert current not in pending


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
