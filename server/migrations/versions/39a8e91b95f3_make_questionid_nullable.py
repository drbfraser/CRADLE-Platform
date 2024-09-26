"""
make questionId nullable

Revision ID: 39a8e91b95f3
Revises: 55b2e2abd300
Create Date: 2022-03-22 06:58:29.267023

"""

from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "39a8e91b95f3"
down_revision = "55b2e2abd300"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column("question", "questionId", existing_type=mysql.TEXT(), nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "question",
        "questionId",
        existing_type=mysql.TEXT(),
        nullable=False,
    )
    # ### end Alembic commands ###
