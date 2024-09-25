"""
empty message

Revision ID: 5df0e66fee22
Revises: 1a82dffadaab
Create Date: 2020-06-07 01:06:43.336604

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "5df0e66fee22"
down_revision = "1a82dffadaab"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint(
        None,
        "patient_facility",
        ["patientId", "healthFacilityName"],
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "patient_facility", type_="unique")
    # ### end Alembic commands ###
