"""Merge migration heads

Revision ID: 013cf68cd68c
Revises: 25_workflow_vars, 27_a3b5c7d9e1f2
Create Date: 2026-02-12 10:01:01.846721

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '013cf68cd68c'
down_revision = ('25_workflow_vars', '27_a3b5c7d9e1f2')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
