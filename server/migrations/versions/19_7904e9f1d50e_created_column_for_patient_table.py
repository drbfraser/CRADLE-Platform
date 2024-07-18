"""created column for patient table

Revision ID: 19_7904e9f1d50e
Revises: 18_d41dc6eb7f5d
Create Date: 2020-07-18 21:16:28.644404

"""

from time import time

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "19_7904e9f1d50e"
down_revision = "18_d41dc6eb7f5d"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("patient", sa.Column("created", sa.BigInteger(), nullable=False))
    op.execute(f"UPDATE patient SET created = {int(time())}")
    op.execute(f"UPDATE patient SET lastEdited = {int(time())}")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("patient", "created")
    # ### end Alembic commands ###
