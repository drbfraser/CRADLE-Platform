"""
change newReferral column type

Revision ID: daacd2c90e9e
Revises: 3bfa752b60d2
Create Date: 2021-11-08 15:26:50.129359

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "daacd2c90e9e"
down_revision = "3bfa752b60d2"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "healthfacility",
        "newReferrals",
        existing_type=mysql.INTEGER(display_width=11),
        type_=sa.String(length=50),
        existing_nullable=True,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "healthfacility",
        "newReferrals",
        existing_type=sa.String(length=50),
        type_=mysql.INTEGER(display_width=11),
        existing_nullable=True,
    )
    # ### end Alembic commands ###
