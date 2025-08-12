"""Rename columns for rule_group and update types from TEXT to JSON

Revision ID: 0520a90e0303
Revises: 15_bf923c5cb3c3
Create Date: 2025-08-12 01:24:32.468246

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0520a90e0303'
down_revision = '15_bf923c5cb3c3'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "rule_group",
        "logic",
        new_column_name="rule",
        type_=sa.JSON,
        existing_type=sa.Text(),
        existing_nullable=True,
    )
    op.alter_column(
        "rule_group",
        "rules",
        new_column_name="data_sources",
        type_=sa.JSON,
        existing_type=sa.Text(),
        existing_nullable=True,
    )


def downgrade():
    op.alter_column(
        "rule_group",
        "rule",
        new_column_name="logic",
        type_=sa.Text(),
        existing_type=sa.JSON,
        existing_nullable=True,
    )
    op.alter_column(
        "rule_group",
        "data_sources",
        new_column_name="rules",
        type_=sa.Text(),
        existing_type=sa.JSON,
        existing_nullable=True,
    )

