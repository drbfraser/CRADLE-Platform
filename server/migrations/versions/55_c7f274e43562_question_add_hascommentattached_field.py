"""question add hasCommentAttached field

Revision ID: c7f274e43562
Revises: 8eca43aa83a6
Create Date: 2022-03-24 02:48:55.069808

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "c7f274e43562"
down_revision = "8eca43aa83a6"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "question", sa.Column("hasCommentAttached", sa.Boolean(), nullable=False)
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("question", "hasCommentAttached")
    # ### end Alembic commands ###
