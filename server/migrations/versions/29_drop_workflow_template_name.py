"""
Drop workflow_template name column

Revision ID: 29_drop_workflow_template_name
Revises: 28_restore_workflow_names
Create Date: 2026-02-19 10:10:00.000000

"""

import sqlalchemy as sa
from alembic import op

revision = "29_drop_workflow_template_name"
down_revision = "28_restore_workflow_names"
branch_labels = None
depends_on = None


def _column_exists(table: str, column: str) -> bool:
    bind = op.get_bind()
    result = bind.execute(
        sa.text(
            "SELECT COUNT(*) FROM information_schema.COLUMNS "
            "WHERE TABLE_SCHEMA = DATABASE() "
            f"AND TABLE_NAME = '{table}' "
            f"AND COLUMN_NAME = '{column}'"
        )
    )
    return result.scalar() > 0


def upgrade():
    if _column_exists("workflow_template", "name"):
        op.drop_index(op.f("ix_workflow_template_name"), table_name="workflow_template")
        op.drop_column("workflow_template", "name")


def downgrade():
    if not _column_exists("workflow_template", "name"):
        op.add_column(
            "workflow_template",
            sa.Column("name", sa.String(length=200), nullable=True),
        )
        op.create_index(
            op.f("ix_workflow_template_name"),
            "workflow_template",
            ["name"],
            unique=False,
        )
