"""empty message

Revision ID: b4263a7016f6
Revises: ced944a17e66
Create Date: 2020-02-22 09:10:40.713841

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'b4263a7016f6'
down_revision = 'ced944a17e66'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('patient', 'block')
    op.drop_column('patient', 'tank')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('patient', sa.Column('tank', mysql.VARCHAR(length=20), nullable=True))
    op.add_column('patient', sa.Column('block', mysql.VARCHAR(length=20), nullable=True))
    # ### end Alembic commands ###
