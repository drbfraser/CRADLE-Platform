"""
Change question type to enum

Revision ID: 03eb65e086d0
Revises: c2893bc8d86e
Create Date: 2022-03-18 05:10:53.130656

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "03eb65e086d0"
down_revision = "c2893bc8d86e"
branch_labels = None
depends_on = None


def upgrade():
    op.get_bind()

    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("question", "questionType")
    op.add_column(
        "question",
        sa.Column(
            "questionType",
            sa.Enum(
                "INTEGER",
                "DECIMAL",
                "STRING",
                "MULTIPLE_CHOICE",
                "MULTIPLE_SELECT",
                "DATE",
                "TIME",
                "DATETIME",
                name="questiontypeenum",
            ),
            nullable=False,
        ),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("question", "questionType")
    op.add_column("question", sa.Column("questionType", mysql.TEXT(), nullable=False))
    # ### end Alembic commands ###
