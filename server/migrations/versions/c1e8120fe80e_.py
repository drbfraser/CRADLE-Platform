"""
empty message

Revision ID: c1e8120fe80e
Revises: 6fddb8c23bba
Create Date: 2020-03-29 05:22:46.633634

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "c1e8120fe80e"
down_revision = "6fddb8c23bba"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "healthfacility",
        sa.Column("healthFacilityPhoneNumber", sa.String(length=50), nullable=True),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("healthfacility", "healthFacilityPhoneNumber")
    # ### end Alembic commands ###