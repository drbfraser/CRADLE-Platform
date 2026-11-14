"""
Add patient_number column to patient

Revision ID: 40_add_patient_number
Revises: 39_add_allowed_values
"""

import sqlalchemy as sa
from alembic import op

revision = "40_add_patient_number"
down_revision = "39_add_allowed_values"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "patient", sa.Column("patient_number", sa.String(length=50), nullable=True)
    )
    op.create_index(
        op.f("ix_patient_patient_number"), "patient", ["patient_number"], unique=False
    )

    # Patients created on mobile have the user-entered ID as their key, so it
    # becomes their patient number. Patients created on the web have a generated
    # UUID key and no user-entered ID, so their patient number is left empty.
    op.get_bind().execute(
        sa.text(
            "UPDATE patient SET patient_number = id "
            "WHERE id NOT REGEXP "
            "'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'"
        )
    )


def downgrade():
    op.drop_index(op.f("ix_patient_patient_number"), table_name="patient")
    op.drop_column("patient", "patient_number")
