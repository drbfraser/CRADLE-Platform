"""
Add has_branching_issues flag to workflow_template

Revision ID: 33_add_has_branching_issues
Revises: 32_613305db5978
Create Date: 2026-07-10

"""

import sqlalchemy as sa
from alembic import op

revision = "33_add_has_branching_issues"
down_revision = "32_613305db5978"
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
