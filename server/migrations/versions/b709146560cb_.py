"""
empty message

Revision ID: b709146560cb
Revises: 767282df9ea8
Create Date: 2020-03-06 04:09:24.658150

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "b709146560cb"
down_revision = "767282df9ea8"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "patient_facility",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("patientId", sa.String(length=50), nullable=False),
        sa.Column("healthFacilityName", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(
            ["healthFacilityName"],
            ["healthfacility.healthFacilityName"],
        ),
        sa.ForeignKeyConstraint(
            ["patientId"],
            ["patient.patientId"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("patient_facility")
    # ### end Alembic commands ###
