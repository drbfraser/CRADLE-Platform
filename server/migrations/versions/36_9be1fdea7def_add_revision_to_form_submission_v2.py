"""
Add revision to form submission v2

Revision ID: 36_9be1fdea7def
Revises: 35_4b4c2f599782
Create Date: 2026-10-21

"""

import sqlalchemy as sa
from alembic import op

revision = "36_9be1fdea7def"
down_revision = "35_4b4c2f599782"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "form_submission_v2",
        sa.Column("revision", sa.Integer(), nullable=False, server_default="1"),
    )


def downgrade():
    op.drop_column("form_submission_v2", "revision")
