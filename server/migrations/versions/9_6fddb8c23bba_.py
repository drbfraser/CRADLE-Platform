"""empty message

Revision ID: 9_6fddb8c23bba
Revises: 8_b709146560cb
Create Date: 2020-03-09 21:50:20.923172

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "9_6fddb8c23bba"
down_revision = "8_b709146560cb"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "followup",
        sa.Column("dateFollowupNeededTill", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "followup",
        sa.Column(
            "followupFrequencyUnit",
            sa.Enum(
                "MINUTES",
                "HOURS",
                "DAYS",
                "WEEKS",
                "MONTHS",
                "YEARS",
                name="frequencyunitenum",
            ),
            nullable=True,
        ),
    )
    op.add_column(
        "followup", sa.Column("followupFrequencyValue", sa.Float(), nullable=True)
    )
    op.add_column(
        "followup", sa.Column("followupInstructions", sa.Text(), nullable=True)
    )
    op.drop_column("followup", "dateReviewNeeded")
    op.drop_column("followup", "followUpAction")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("followup", sa.Column("followUpAction", mysql.TEXT(), nullable=True))
    op.add_column(
        "followup",
        sa.Column("dateReviewNeeded", mysql.VARCHAR(length=50), nullable=True),
    )
    op.drop_column("followup", "followupInstructions")
    op.drop_column("followup", "followupFrequencyValue")
    op.drop_column("followup", "followupFrequencyUnit")
    op.drop_column("followup", "dateFollowupNeededTill")
    # ### end Alembic commands ###
