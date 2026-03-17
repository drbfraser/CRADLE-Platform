"""
Add unique constraint for workflow_template (classification_id, version)

Revision ID: 27_f4c1e2b8a9d0
Revises: 26_9c2a5b3e1f74
Create Date: 2026-03-15 14:10:00.000000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "27_f4c1e2b8a9d0"
down_revision = "26_9c2a5b3e1f74"
branch_labels = None
depends_on = None

CONSTRAINT_NAME = "uq_workflow_template_classification_version"


def _constraint_exists(table: str, constraint_name: str) -> bool:
    bind = op.get_bind()
    result = bind.execute(
        sa.text(
            "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS "
            "WHERE TABLE_SCHEMA = DATABASE() "
            "AND TABLE_NAME = :table "
            "AND CONSTRAINT_NAME = :constraint_name"
        ),
        {"table": table, "constraint_name": constraint_name},
    )
    return result.scalar() > 0


def _has_duplicate_versions() -> bool:
    bind = op.get_bind()
    result = bind.execute(
        sa.text(
            "SELECT COUNT(*) "
            "FROM ("
            "  SELECT classification_id, version "
            "  FROM workflow_template "
            "  WHERE classification_id IS NOT NULL "
            "  GROUP BY classification_id, version "
            "  HAVING COUNT(*) > 1"
            ") AS dup"
        )
    )
    return result.scalar() > 0


def upgrade():
    if _constraint_exists("workflow_template", CONSTRAINT_NAME):
        return

    if _has_duplicate_versions():
        raise RuntimeError(
            "Cannot add unique constraint on workflow_template(classification_id, version): "
            "duplicate classification/version rows exist."
        )

    op.create_unique_constraint(
        CONSTRAINT_NAME,
        "workflow_template",
        ["classification_id", "version"],
    )


def downgrade():
    if _constraint_exists("workflow_template", CONSTRAINT_NAME):
        op.drop_constraint(CONSTRAINT_NAME, "workflow_template", type_="unique")
