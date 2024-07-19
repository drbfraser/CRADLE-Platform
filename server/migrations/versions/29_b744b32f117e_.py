"""add pregnancy table

Revision ID: b744b32f117e
Revises: a8ad53e6717c
Create Date: 2021-06-15 4:26

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "b744b32f117e"
down_revision = "a8ad53e6717c"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "pregnancy",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patientId", sa.String(length=50), nullable=False),
        sa.Column("startDate", sa.BigInteger(), nullable=False),
        sa.Column(
            "defaultTimeUnit",
            sa.Enum("MONTHS", "WEEKS", name="gestationalageunitenum"),
            nullable=True,
        ),
        sa.Column("endDate", sa.BigInteger(), nullable=True),
        sa.Column("outcome", sa.Text(), nullable=True),
        sa.Column("lastEdited", sa.BigInteger(), nullable=False),
        sa.ForeignKeyConstraint(
            ["patientId"], ["patient.patientId"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("pregnancy")
    # ### end Alembic commands ###
