"""Change default value for visibleCondition

Revision ID: 47_92e818bd7db3
Revises: 46_03eb65e086d0
Create Date: 2022-03-18 05:42:03.184018

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "47_92e818bd7db3"
down_revision = "46_03eb65e086d0"
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
