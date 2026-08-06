"""
Add translation support to workflows.

Adds name_string_id/description_string_id pointer columns (into the existing
shared lang_version_v2 table) to workflow_classification, workflow_template,
and workflow_template_step, backfilling existing plain-text values as
English translations before dropping the old plain columns. Also adds
workflow_instance.lang to record which language an instance's name/
description snapshot was resolved in - workflow_instance/workflow_instance_step
otherwise keep their plain text columns untouched (see Phase 0 decisions in
the workflow-language-support plan: instances snapshot one language rather
than tracking live translations).

Revision ID: 33_workflow_lang_support
Revises: 32_613305db5978
Create Date: 2026-07-31
"""

import uuid

import sqlalchemy as sa
from alembic import op

revision = "33_workflow_lang_support"
down_revision = "32_613305db5978"
branch_labels = None
depends_on = None


def _column_exists(table: str, column: str) -> bool:
    bind = op.get_bind()
    result = bind.execute(
        sa.text(
            "SELECT COUNT(*) FROM information_schema.COLUMNS "
            "WHERE TABLE_SCHEMA = DATABASE() "
            "AND TABLE_NAME = :table AND COLUMN_NAME = :column"
        ),
        {"table": table, "column": column},
    )
    return result.scalar() > 0


def _index_exists(table: str, index_name: str) -> bool:
    bind = op.get_bind()
    result = bind.execute(
        sa.text(
            "SELECT COUNT(*) FROM information_schema.STATISTICS "
            "WHERE TABLE_SCHEMA = DATABASE() "
            "AND TABLE_NAME = :table AND INDEX_NAME = :index_name"
        ),
        {"table": table, "index_name": index_name},
    )
    return result.scalar() > 0


def _backfill_lang_text(
    bind, table: str, id_column: str, text_column: str, string_id_column: str
) -> None:
    """
    For every row in `table`, create an English lang_version_v2 row for its
    existing `text_column` value and point `string_id_column` at it.
    """
    rows = bind.execute(
        sa.text(f"SELECT {id_column}, {text_column} FROM {table}")
    ).fetchall()

    for row_id, text_value in rows:
        string_id = str(uuid.uuid4())
        bind.execute(
            sa.text(
                "INSERT INTO lang_version_v2 (string_id, lang, text) "
                "VALUES (:string_id, 'English', :text)"
            ),
            {"string_id": string_id, "text": text_value},
        )
        bind.execute(
            sa.text(
                f"UPDATE {table} SET {string_id_column} = :string_id "
                f"WHERE {id_column} = :row_id"
            ),
            {"string_id": string_id, "row_id": row_id},
        )


def upgrade():
    bind = op.get_bind()

    # --- Add new nullable pointer columns (+ instance lang) ---
    if not _column_exists("workflow_classification", "name_string_id"):
        op.add_column(
            "workflow_classification",
            sa.Column("name_string_id", sa.String(length=50), nullable=True),
        )
    if not _column_exists("workflow_template", "description_string_id"):
        op.add_column(
            "workflow_template",
            sa.Column("description_string_id", sa.String(length=50), nullable=True),
        )
    if not _column_exists("workflow_template_step", "name_string_id"):
        op.add_column(
            "workflow_template_step",
            sa.Column("name_string_id", sa.String(length=50), nullable=True),
        )
    if not _column_exists("workflow_template_step", "description_string_id"):
        op.add_column(
            "workflow_template_step",
            sa.Column("description_string_id", sa.String(length=50), nullable=True),
        )
    if not _column_exists("workflow_instance", "lang"):
        op.add_column(
            "workflow_instance",
            sa.Column(
                "lang", sa.String(length=50), nullable=False, server_default="English"
            ),
        )

    # --- Backfill existing plain text into lang_version_v2 rows ---
    _backfill_lang_text(bind, "workflow_classification", "id", "name", "name_string_id")
    _backfill_lang_text(
        bind, "workflow_template", "id", "description", "description_string_id"
    )
    _backfill_lang_text(bind, "workflow_template_step", "id", "name", "name_string_id")
    _backfill_lang_text(
        bind, "workflow_template_step", "id", "description", "description_string_id"
    )

    # --- Tighten new columns to NOT NULL now that every row has a value ---
    op.alter_column(
        "workflow_classification",
        "name_string_id",
        existing_type=sa.String(length=50),
        nullable=False,
    )
    op.alter_column(
        "workflow_template",
        "description_string_id",
        existing_type=sa.String(length=50),
        nullable=False,
    )
    op.alter_column(
        "workflow_template_step",
        "name_string_id",
        existing_type=sa.String(length=50),
        nullable=False,
    )
    op.alter_column(
        "workflow_template_step",
        "description_string_id",
        existing_type=sa.String(length=50),
        nullable=False,
    )

    # --- Drop the old plain columns (and their indexes) ---
    if _index_exists("workflow_classification", "ix_workflow_classification_name"):
        op.drop_index(
            "ix_workflow_classification_name", table_name="workflow_classification"
        )
    if _column_exists("workflow_classification", "name"):
        op.drop_column("workflow_classification", "name")

    if _column_exists("workflow_template", "description"):
        op.drop_column("workflow_template", "description")

    if _index_exists("workflow_template_step", "ix_workflow_template_step_name"):
        op.drop_index(
            "ix_workflow_template_step_name", table_name="workflow_template_step"
        )
    if _column_exists("workflow_template_step", "name"):
        op.drop_column("workflow_template_step", "name")
    if _column_exists("workflow_template_step", "description"):
        op.drop_column("workflow_template_step", "description")

    # --- Index on name_string_id, matching FormClassificationOrmV2's ---
    if not _index_exists(
        "workflow_classification", "ix_workflow_classification_name_string_id"
    ):
        op.create_index(
            "ix_workflow_classification_name_string_id",
            "workflow_classification",
            ["name_string_id"],
            unique=False,
        )


def downgrade():
    bind = op.get_bind()

    if _index_exists(
        "workflow_classification", "ix_workflow_classification_name_string_id"
    ):
        op.drop_index(
            "ix_workflow_classification_name_string_id",
            table_name="workflow_classification",
        )

    # --- Re-add old plain columns ---
    if not _column_exists("workflow_classification", "name"):
        op.add_column(
            "workflow_classification",
            sa.Column("name", sa.String(length=200), nullable=True),
        )
    if not _column_exists("workflow_template", "description"):
        op.add_column(
            "workflow_template",
            sa.Column("description", sa.Text(), nullable=True),
        )
    if not _column_exists("workflow_template_step", "name"):
        op.add_column(
            "workflow_template_step",
            sa.Column("name", sa.String(length=200), nullable=True),
        )
    if not _column_exists("workflow_template_step", "description"):
        op.add_column(
            "workflow_template_step",
            sa.Column("description", sa.Text(), nullable=True),
        )

    # --- Populate restored columns from lang_version_v2 (English) ---
    bind.execute(
        sa.text(
            "UPDATE workflow_classification wc "
            "JOIN lang_version_v2 lv "
            "ON lv.string_id = wc.name_string_id AND lv.lang = 'English' "
            "SET wc.name = lv.text"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE workflow_template wt "
            "JOIN lang_version_v2 lv "
            "ON lv.string_id = wt.description_string_id AND lv.lang = 'English' "
            "SET wt.description = lv.text"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE workflow_template_step wts "
            "JOIN lang_version_v2 lv "
            "ON lv.string_id = wts.name_string_id AND lv.lang = 'English' "
            "SET wts.name = lv.text"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE workflow_template_step wts "
            "JOIN lang_version_v2 lv "
            "ON lv.string_id = wts.description_string_id AND lv.lang = 'English' "
            "SET wts.description = lv.text"
        )
    )

    # --- Tighten restored columns back to NOT NULL ---
    op.alter_column(
        "workflow_classification",
        "name",
        existing_type=sa.String(length=200),
        nullable=False,
    )
    op.alter_column(
        "workflow_template", "description", existing_type=sa.Text(), nullable=False
    )
    op.alter_column(
        "workflow_template_step",
        "name",
        existing_type=sa.String(length=200),
        nullable=False,
    )
    op.alter_column(
        "workflow_template_step",
        "description",
        existing_type=sa.Text(),
        nullable=False,
    )

    # --- Recreate original indexes ---
    if not _index_exists("workflow_classification", "ix_workflow_classification_name"):
        op.create_index(
            "ix_workflow_classification_name",
            "workflow_classification",
            ["name"],
            unique=False,
        )
    if not _index_exists("workflow_template_step", "ix_workflow_template_step_name"):
        op.create_index(
            "ix_workflow_template_step_name",
            "workflow_template_step",
            ["name"],
            unique=False,
        )

    # --- Drop new pointer columns ---
    if _column_exists("workflow_classification", "name_string_id"):
        op.drop_column("workflow_classification", "name_string_id")
    if _column_exists("workflow_template", "description_string_id"):
        op.drop_column("workflow_template", "description_string_id")
    if _column_exists("workflow_template_step", "name_string_id"):
        op.drop_column("workflow_template_step", "name_string_id")
    if _column_exists("workflow_template_step", "description_string_id"):
        op.drop_column("workflow_template_step", "description_string_id")

    # --- Drop workflow_instance.lang ---
    if _column_exists("workflow_instance", "lang"):
        op.drop_column("workflow_instance", "lang")
