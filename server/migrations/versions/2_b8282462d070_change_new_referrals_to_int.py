"""
change new_referrals to int

Revision ID: 2_b8282462d070
Revises: 1_09521d0d6f0d
Create Date: 2025-01-10 21:04:56.584312

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "2_b8282462d070"
down_revision = "1_09521d0d6f0d"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "health_facility",
        "new_referrals",
        existing_type=mysql.VARCHAR(length=50),
        type_=sa.BigInteger(),
        existing_nullable=True,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "health_facility",
        "new_referrals",
        existing_type=sa.BigInteger(),
        type_=mysql.VARCHAR(length=50),
        existing_nullable=True,
    )
    # ### end Alembic commands ###
