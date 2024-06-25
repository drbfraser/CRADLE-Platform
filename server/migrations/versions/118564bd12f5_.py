"""empty message

Revision ID: 118564bd12f5
Revises: 711f817125f9
Create Date: 2020-07-16 12:57:47.833311

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "118564bd12f5"
down_revision = "711f817125f9"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("patient", "gestationalAgeValue")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "patient",
        sa.Column("gestationalAgeValue", mysql.VARCHAR(length=20), nullable=True),
    )
    # ### end Alembic commands ###
