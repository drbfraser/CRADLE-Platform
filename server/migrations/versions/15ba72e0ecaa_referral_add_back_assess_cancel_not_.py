"""
referral add back assess cancel not attend timestamp

Revision ID: 15ba72e0ecaa
Revises: ec7658947424
Create Date: 2022-04-17 07:18:38.817316

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "15ba72e0ecaa"
down_revision = "ec7658947424"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()

    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("referral", sa.Column("dateAssessed", sa.BigInteger(), nullable=True))
    connection.execute(
        "UPDATE referral r SET r.dateAssessed = r.dateAssessedBackUp ",
    )
    op.drop_column("referral", "dateAssessedBackUp")
    op.add_column(
        "referral",
        sa.Column("dateCancelled", sa.BigInteger(), nullable=True),
    )
    op.add_column(
        "referral",
        sa.Column("dateNotAttended", sa.BigInteger(), nullable=True),
    )
    # ### end Alembic commands ###


def downgrade():
    connection = op.get_bind()

    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "referral",
        sa.Column("dateAssessedBackUp", sa.BigInteger(), nullable=True),
    )
    connection.execute(
        "UPDATE referral r SET r.dateAssessedBackUp = r.dateAssessed ",
    )
    op.drop_column("referral", "dateNotAttended")
    op.drop_column("referral", "dateCancelled")
    op.drop_column("referral", "dateAssessed")
    # ### end Alembic commands ###
