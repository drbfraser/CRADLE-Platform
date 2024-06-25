"""Add StringMaxLines column

Revision ID: 5d293042e3b7
Revises: bef7a571db37
Create Date: 2024-02-03 09:12:01.829004

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "5d293042e3b7"
down_revision = "bef7a571db37"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("question", sa.Column("stringMaxLines", sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("question", "stringMaxLines")
    # ### end Alembic commands ###
