"""
Add phone number and secret key to user

Revision ID: cf9e5bcce121
Revises: f532e4055de0
Create Date: 2022-09-29 19:29:42.581853

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "cf9e5bcce121"
down_revision = "f532e4055de0"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("user", sa.Column("phoneNumber", sa.String(length=15), nullable=True))
    op.add_column("user", sa.Column("secretKey", sa.String(length=64), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("user", "secretKey")
    op.drop_column("user", "phoneNumber")
    # ### end Alembic commands ###
