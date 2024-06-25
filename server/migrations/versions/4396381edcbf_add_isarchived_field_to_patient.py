"""add isArchived field to patient

Revision ID: 4396381edcbf
Revises: cf9e5bcce121
Create Date: 2022-10-23 05:34:39.515867

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "4396381edcbf"
down_revision = "cf9e5bcce121"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("patient", sa.Column("isArchived", sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("patient", "isArchived")
    # ### end Alembic commands ###
