"""
Add archiving to form submission v2

Revision ID: 32_613305db5978
Revises: 31_76866e61db26
Create Date: 2026-04-21 02:37:15.357000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "32_613305db5978"
down_revision = "31_76866e61db26"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "form_submission_v2", sa.Column("archived", sa.Boolean(), nullable=True)
    )
    # fill existing records with default value of False (0)
    op.execute("UPDATE form_submission_v2 SET archived = 0")
    op.alter_column("form_submission_v2", "archived", nullable=False)


def downgrade():
    op.drop_column("form_submission_v2", "archived")
