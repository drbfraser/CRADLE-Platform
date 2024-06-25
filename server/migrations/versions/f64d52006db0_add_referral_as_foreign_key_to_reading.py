"""Add referral as foreign key to Reading

Revision ID: f64d52006db0
Revises: 4396381edcbf
Create Date: 2023-07-15 05:52:02.679087

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "f64d52006db0"
down_revision = "4396381edcbf"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "reading", sa.Column("referral_id", sa.String(length=50), nullable=True)
    )
    op.create_foreign_key(None, "reading", "referral", ["referral_id"], ["id"])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "reading", type_="foreignkey")
    op.drop_column("reading", "referral_id")
    # ### end Alembic commands ###
