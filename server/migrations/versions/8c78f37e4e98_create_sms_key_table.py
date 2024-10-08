"""
empty message

Revision ID: 8c78f37e4e98
Revises: 724f045b8d56
Create Date: 2023-08-01 03:46:22.660819

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "8c78f37e4e98"
down_revision = "724f045b8d56"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "sms_secret_key",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("secret_Key", sa.String(length=256), nullable=False),
        sa.Column("stale_date", sa.DateTime(), nullable=False),
        sa.Column("expiry_date", sa.DateTime(), nullable=False),
        sa.Column("userId", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["userId"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.alter_column(
        "user_phone_number",
        "id",
        existing_type=mysql.VARCHAR(length=50),
        type_=sa.String(length=36),
        existing_nullable=False,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "user_phone_number",
        "id",
        existing_type=sa.String(length=36),
        type_=mysql.VARCHAR(length=50),
        existing_nullable=False,
    )
    op.drop_table("sms_secret_key")
    # ### end Alembic commands ###
