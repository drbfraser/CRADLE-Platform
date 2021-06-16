"""add medical record table

Revision ID: 0363083ecb2c
Revises: a8ad53e6717c
Create Date: 2021-06-15 18:07:58.634166

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0363083ecb2c"
down_revision = "a8ad53e6717c"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "medical_record",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patientId", sa.String(length=50), nullable=False),
        sa.Column("information", sa.Text(), nullable=False),
        sa.Column("isDrugRecord", sa.Boolean(), nullable=False),
        sa.Column("dateCreated", sa.BigInteger(), nullable=False),
        sa.Column("lastEdited", sa.BigInteger(), nullable=False),
        sa.ForeignKeyConstraint(
            ["patientId"], ["patient.patientId"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("medical_record")
    # ### end Alembic commands ###
