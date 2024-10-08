"""
referral add notAttended field

Revision ID: 8f5b3a1f78e2
Revises: b62ebe3bee7a
Create Date: 2022-02-21 02:17:54.737417

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "8f5b3a1f78e2"
down_revision = "b62ebe3bee7a"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("referral", sa.Column("notAttended", sa.Boolean(), nullable=False))
    op.add_column(
        "referral",
        sa.Column("dateNotAttended", sa.BigInteger(), nullable=True),
    )
    op.add_column("referral", sa.Column("notAttendReason", sa.Text(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("referral", "notAttendReason")
    op.drop_column("referral", "dateNotAttended")
    op.drop_column("referral", "notAttended")
    # ### end Alembic commands ###
