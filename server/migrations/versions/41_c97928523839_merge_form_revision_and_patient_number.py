"""
Merge form revision and patient number migrations

Revision ID: 41_c97928523839
Revises: 36_9be1fdea7def, 40_add_patient_number
Create Date: 2026-11-12

"""

revision = "41_c97928523839"
down_revision = ("36_9be1fdea7def", "40_add_patient_number")
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
