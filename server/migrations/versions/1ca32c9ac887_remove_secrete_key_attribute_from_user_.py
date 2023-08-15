"""REMOVE SECRETE KEY ATTRIBUTE FROM USER TABLE

Revision ID: 1ca32c9ac887
Revises: 8c78f37e4e98
Create Date: 2023-08-13 17:49:16.181425

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '1ca32c9ac887'
down_revision = '8c78f37e4e98'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'secretKey')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('secretKey', mysql.VARCHAR(length=64), nullable=True))
    # ### end Alembic commands ###
