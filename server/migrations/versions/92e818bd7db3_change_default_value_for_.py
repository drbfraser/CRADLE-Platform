"""Change default value for visibleCondition

Revision ID: 92e818bd7db3
Revises: 03eb65e086d0
Create Date: 2022-03-18 05:42:03.184018

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "92e818bd7db3"
down_revision = "03eb65e086d0"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "question",
        "visibleCondition",
        default=[],
    )


def downgrade():
    op.alter_column(
        "question",
        "visibleCondition",
        default={},
    )
