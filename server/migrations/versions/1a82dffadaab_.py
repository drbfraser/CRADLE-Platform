"""
empty message

Revision ID: 1a82dffadaab
Revises: c1e8120fe80e
Create Date: 2020-04-08 20:12:57.799402

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "1a82dffadaab"
down_revision = "c1e8120fe80e"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("healthfacility", sa.Column("about", sa.Text(), nullable=True))
    op.add_column(
        "healthfacility",
        sa.Column(
            "facilityType",
            sa.Enum("HCF_2", "HCF_3", "HCF_4", "HOSPITAL", name="facilitytypeenum"),
            nullable=True,
        ),
    )
    op.add_column(
        "healthfacility",
        sa.Column("location", sa.String(length=50), nullable=True),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("healthfacility", "location")
    op.drop_column("healthfacility", "facilityType")
    op.drop_column("healthfacility", "about")
    # ### end Alembic commands ###
