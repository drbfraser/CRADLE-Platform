"""
use snake case for follow_up table and columns

Revision ID: 85_b06fe66ca2b4
Revises: 84_a78c469e5207
Create Date: 2024-11-03 22:54:55.740613

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "85_b06fe66ca2b4"
down_revision = "84_a78c469e5207"
branch_labels = None
depends_on = None


def upgrade():
    op.rename_table(old_table_name="followup",
                    new_table_name="follow_up")

    op.alter_column(table_name="follow_up",
                    column_name="followUpInstructions",
                    new_column_name="follow_up_instructions",
                    existing_type=sa.Text(),
                    existing_nullable=True)
    op.alter_column(table_name="follow_up",
                    column_name="specialInvestigations",
                    new_column_name="special_investigations",
                    existing_type=sa.Text(),
                    existing_nullable=True)
    op.alter_column(table_name="follow_up",
                    column_name="medicationPrescribed",
                    new_column_name="medication_prescribed",
                    existing_type=sa.Text(),
                    existing_nullable=True)
    op.alter_column(table_name="follow_up",
                    column_name="dateAssessed",
                    new_column_name="date_assessed",
                    existing_type=sa.BigInteger(),
                    existing_nullable=False)
    op.alter_column(table_name="follow_up",
                    column_name="followupNeeded",
                    new_column_name="follow_up_needed",
                    existing_type=sa.Boolean(),
                    existing_nullable=True)
    op.alter_column(table_name="follow_up",
                    column_name="healthcareWorkerId",
                    new_column_name="healthcare_worker_id",
                    existing_type=sa.Integer(),
                    existing_nullable=False)
    op.alter_column(table_name="follow_up",
                    column_name="patientId",
                    new_column_name="patient_id",
                    existing_type=sa.String(length=50),
                    existing_nullable=False)
    # ### end Alembic commands ###


def downgrade():
    op.rename_table(old_table_name="follow_up",
                    new_table_name="followup")

    op.alter_column(table_name="follow_up",
                    column_name="follow_up_instructions",
                    new_column_name="followUpInstructions",
                    existing_type=sa.Text(),
                    existing_nullable=True)
    op.alter_column(table_name="follow_up",
                    column_name="special_investigations",
                    new_column_name="specialInvestigations",
                    existing_type=sa.Text(),
                    existing_nullable=True)
    op.alter_column(table_name="follow_up",
                    column_name="medication_prescribed",
                    new_column_name="medicationPrescribed",
                    existing_type=sa.Text(),
                    existing_nullable=True)
    op.alter_column(table_name="follow_up",
                    column_name="date_assessed",
                    new_column_name="dateAssessed",
                    existing_type=sa.BigInteger(),
                    existing_nullable=False)
    op.alter_column(table_name="follow_up",
                    column_name="follow_up_needed",
                    new_column_name="followupNeeded",
                    existing_type=sa.Boolean(),
                    existing_nullable=True)
    op.alter_column(table_name="follow_up",
                    column_name="healthcare_worker_id",
                    new_column_name="healthcareWorkerId",
                    existing_type=sa.Integer(),
                    existing_nullable=False)
    op.alter_column(table_name="follow_up",
                    column_name="patient_id",
                    new_column_name="patientId",
                    existing_type=sa.String(length=50),
                    existing_nullable=False)



    # ### end Alembic commands ###
