"""
empty message

Revision ID: ced944a17e66
Revises: 760c99261b86
Create Date: 2020-02-15 19:41:42.659044

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "ced944a17e66"
down_revision = "760c99261b86"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "reading",
        sa.Column("urineTest", sa.String(length=50), nullable=True),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("reading", "urineTest")
    # ### end Alembic commands ###
