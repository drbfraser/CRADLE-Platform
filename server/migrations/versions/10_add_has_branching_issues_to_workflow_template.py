"""
Add has_branching_issues flag to workflow_template

Revision ID: 10_add_has_branching_issues
Revises: 9_54251029538f
Create Date: 2026-07-05

"""

import sqlalchemy as sa
from alembic import op

revision = "10_add_has_branching_issues"
down_revision = "9_54251029538f"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "workflow_template",
        sa.Column(
            "has_branching_issues",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade():
    op.drop_column("workflow_template", "has_branching_issues")
