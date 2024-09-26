"""
three way patient associations

Revision ID: d41dc6eb7f5d
Revises: 30101cf360db
Create Date: 2020-07-12 09:16:13.785918

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "d41dc6eb7f5d"
down_revision = "30101cf360db"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "patient_associations",
        sa.Column("patientId", sa.String(length=50), nullable=False),
        sa.Column("healthFacilityName", sa.String(length=50), nullable=False),
        sa.Column("userId", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["healthFacilityName"],
            ["healthfacility.healthFacilityName"],
        ),
        sa.ForeignKeyConstraint(
            ["patientId"],
            ["patient.patientId"],
        ),
        sa.ForeignKeyConstraint(
            ["userId"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("patientId", "healthFacilityName", "userId"),
    )
    op.drop_table("patient_facility")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "patient_facility",
        sa.Column(
            "id",
            mysql.VARCHAR(collation="utf8mb4_general_ci", length=50),
            nullable=False,
        ),
        sa.Column(
            "patientId",
            mysql.VARCHAR(collation="utf8mb4_general_ci", length=50),
            nullable=False,
        ),
        sa.Column(
            "healthFacilityName",
            mysql.VARCHAR(collation="utf8mb4_general_ci", length=50),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["healthFacilityName"],
            ["healthfacility.healthFacilityName"],
            name="patient_facility_ibfk_1",
        ),
        sa.ForeignKeyConstraint(
            ["patientId"],
            ["patient.patientId"],
            name="patient_facility_ibfk_2",
        ),
        sa.PrimaryKeyConstraint("id"),
        mysql_collate="utf8mb4_general_ci",
        mysql_default_charset="utf8mb4",
        mysql_engine="InnoDB",
    )
    op.create_index(
        "patientId",
        "patient_facility",
        ["patientId", "healthFacilityName"],
        unique=True,
    )
    op.drop_table("patient_associations")
    # ### end Alembic commands ###
