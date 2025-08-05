"""
Rename columns for rule_group and update types from TEXT to JSON

Revision ID: 14_abef0fa92b5d
Revises: 13_b6ff0a713e0e
Create Date: 2025-08-05 03:54:50.769654

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '14_abef0fa92b5d'
down_revision = '13_b6ff0a713e0e'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "rule_group",
        "logic",
        new_column_name='rule',
        type_=sa.JSON,
        existing_type=sa.Text(),
        existing_nullable=True,
    )
    op.alter_column(
        "rule_group",
        "rules",
        new_column_name='data_sources',
        type_=sa.JSON,
        existing_type=sa.Text(),
        existing_nullable=True,
    )

def downgrade():
    op.alter_column(
        "rule_group",
        "rule",
        new_column_name='logic',
        type_=sa.Text(),
        existing_type=sa.JSON,
        existing_nullable=True,
    )
    op.alter_column(
        "rule_group",
        "data_sources",
        new_column_name='rules',
        type_=sa.Text(),
        existing_type=sa.JSON,
        existing_nullable=True,
    )
