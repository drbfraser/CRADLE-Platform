"""
referral remove date of assessed, cancelled, notAttended, add lastEdited

Revision ID: 227cf4f3fa93
Revises: 8f5b3a1f78e2
Create Date: 2022-02-25 08:48:58.417743

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "227cf4f3fa93"
down_revision = "8f5b3a1f78e2"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("referral", sa.Column("lastEdited", sa.BigInteger(), nullable=False))
    op.drop_column("referral", "dateCancelled")
    op.drop_column("referral", "dateNotAttended")
    op.drop_column("referral", "dateAssessed")
    # ### end Alembic commands ###
    op.execute("UPDATE referral SET lastEdited = dateReferred")


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "referral",
        sa.Column(
            "dateAssessed",
            mysql.BIGINT(display_width=20),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "referral",
        sa.Column(
            "dateNotAttended",
            mysql.BIGINT(display_width=20),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "referral",
        sa.Column(
            "dateCancelled",
            mysql.BIGINT(display_width=20),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.drop_column("referral", "lastEdited")
    # ### end Alembic commands ###
