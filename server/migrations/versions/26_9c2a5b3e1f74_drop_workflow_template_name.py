"""
Drop workflow_template.name for classification-centric templates

Revision ID: 26_9c2a5b3e1f74
Revises: 25_workflow_vars
Create Date: 2026-02-21 11:30:00.000000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "26_9c2a5b3e1f74"
down_revision = "25_workflow_vars"
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


def _index_exists(table: str, index_name: str) -> bool:
    bind = op.get_bind()
    result = bind.execute(
        sa.text(
            "SELECT COUNT(*) FROM information_schema.STATISTICS "
            "WHERE TABLE_SCHEMA = DATABASE() "
            f"AND TABLE_NAME = '{table}' "
            f"AND INDEX_NAME = '{index_name}'"
        )
    )
    return result.scalar() > 0


def upgrade():
    if _index_exists("workflow_template", "ix_workflow_template_name"):
        op.drop_index("ix_workflow_template_name", table_name="workflow_template")

    if _column_exists("workflow_template", "name"):
        op.drop_column("workflow_template", "name")


def downgrade():
    if not _column_exists("workflow_template", "name"):
        op.add_column(
            "workflow_template",
            sa.Column("name", sa.String(length=200), nullable=True),
        )

    if not _index_exists("workflow_template", "ix_workflow_template_name"):
        op.create_index(
            "ix_workflow_template_name",
            "workflow_template",
            ["name"],
            unique=False,
        )
