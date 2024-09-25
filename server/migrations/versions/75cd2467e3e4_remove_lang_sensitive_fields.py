"""
remove lang sensitive fields

Revision ID: 75cd2467e3e4
Revises: d8919ab26a06
Create Date: 2022-04-09 08:25:57.768517

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "75cd2467e3e4"
down_revision = "d8919ab26a06"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("question", "questionText")
    op.drop_column("question", "mcOptions")
    op.drop_column("question_lang_version", "questionText")
    op.drop_column("question_lang_version", "mcOptions")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "question_lang_version", sa.Column("mcOptions", mysql.TEXT(), nullable=False),
    )
    op.add_column(
        "question_lang_version", sa.Column("questionText", mysql.TEXT(), nullable=False),
    )
    op.add_column("question", sa.Column("mcOptions", mysql.TEXT(), nullable=False))
    op.add_column("question", sa.Column("questionText", mysql.TEXT(), nullable=False))
    # ### end Alembic commands ###
