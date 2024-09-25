"""
add-date-field-booleans

Revision ID: 9ca5f8290e19
Revises: 5d293042e3b7
Create Date: 2024-02-22 07:31:23.320427

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "9ca5f8290e19"
down_revision = "5d293042e3b7"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "question", sa.Column("allowFutureDates", sa.Boolean(), nullable=False),
    )
    op.add_column("question", sa.Column("allowPastDates", sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("question", "allowPastDates")
    op.drop_column("question", "allowFutureDates")
    # ### end Alembic commands ###
