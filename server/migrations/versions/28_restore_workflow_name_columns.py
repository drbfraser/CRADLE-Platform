"""
Restore workflow name columns for classification and step

Revision ID: 28_restore_workflow_names
Revises: 27_drop_name_string_id
Create Date: 2026-02-19 08:50:00.000000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "28_restore_workflow_names"
down_revision = "27_drop_name_string_id"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "workflow_classification",
        sa.Column("name", sa.String(length=200), nullable=True),
    )
    op.create_index(
        op.f("ix_workflow_classification_name"),
        "workflow_classification",
        ["name"],
        unique=False,
    )

    op.add_column(
        "workflow_template_step",
        sa.Column("name", sa.String(length=200), nullable=True),
    )
    op.create_index(
        op.f("ix_workflow_template_step_name"),
        "workflow_template_step",
        ["name"],
        unique=False,
    )

    op.execute(
        sa.text(
            """
            UPDATE workflow_classification wc
            LEFT JOIN lang_version_v2 lv
                ON lv.string_id = wc.name_string_id AND lv.lang = 'English'
            SET wc.name = COALESCE(lv.text, wc.name_string_id, wc.id)
            WHERE wc.name IS NULL
            """
        )
    )

    op.execute(
        sa.text(
            """
            UPDATE workflow_template_step wts
            LEFT JOIN lang_version_v2 lv
                ON lv.string_id = wts.name_string_id AND lv.lang = 'English'
            SET wts.name = COALESCE(lv.text, wts.name_string_id, wts.id)
            WHERE wts.name IS NULL
            """
        )
    )

    op.alter_column(
        "workflow_classification",
        "name",
        existing_type=sa.String(length=200),
        nullable=False,
    )
    op.alter_column(
        "workflow_template_step",
        "name",
        existing_type=sa.String(length=200),
        nullable=False,
    )

    op.drop_index(
        op.f("ix_workflow_classification_name_string_id"),
        table_name="workflow_classification",
    )
    op.drop_column("workflow_classification", "name_string_id")

    op.drop_index(
        op.f("ix_workflow_template_step_name_string_id"),
        table_name="workflow_template_step",
    )
    op.drop_column("workflow_template_step", "name_string_id")


def downgrade():
    op.add_column(
        "workflow_classification",
        sa.Column("name_string_id", sa.String(length=50), nullable=True),
    )
    op.create_index(
        op.f("ix_workflow_classification_name_string_id"),
        "workflow_classification",
        ["name_string_id"],
        unique=False,
    )

    op.add_column(
        "workflow_template_step",
        sa.Column("name_string_id", sa.String(length=50), nullable=True),
    )
    op.create_index(
        op.f("ix_workflow_template_step_name_string_id"),
        "workflow_template_step",
        ["name_string_id"],
        unique=False,
    )

    op.drop_index(
        op.f("ix_workflow_template_step_name"), table_name="workflow_template_step"
    )
    op.drop_column("workflow_template_step", "name")

    op.drop_index(
        op.f("ix_workflow_classification_name"), table_name="workflow_classification"
    )
    op.drop_column("workflow_classification", "name")
