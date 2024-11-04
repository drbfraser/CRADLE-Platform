"""
form add name and category

Revision ID: 8eca43aa83a6
Revises: 39a8e91b95f3
Create Date: 2022-03-23 03:04:41.840129

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "8eca43aa83a6"
down_revision = "39a8e91b95f3"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("form", sa.Column("name", sa.Text(), nullable=False))
    op.add_column("form", sa.Column("category", sa.Text(), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("form", "category")
    op.drop_column("form", "name")
    # ### end Alembic commands ###