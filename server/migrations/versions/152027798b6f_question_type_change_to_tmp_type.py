"""question type change to tmp type

Revision ID: 152027798b6f
Revises: e6f5494b9217
Create Date: 2022-04-06 09:36:39.232683

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "152027798b6f"
down_revision = "e6f5494b9217"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "question",
        "questionType",
        existing_type=mysql.ENUM(
            "INTEGER",
            "DECIMAL",
            "STRING",
            "MULTIPLE_CHOICE",
            "MULTIPLE_SELECT",
            "DATE",
            "TIME",
            "DATETIME",
        ),
        type_=sa.Text(),
        existing_nullable=False,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "question",
        "questionType",
        existing_type=sa.Text(),
        type_=mysql.ENUM(
            "INTEGER",
            "DECIMAL",
            "STRING",
            "MULTIPLE_CHOICE",
            "MULTIPLE_SELECT",
            "DATE",
            "TIME",
            "DATETIME",
        ),
        existing_nullable=False,
    )
    # ### end Alembic commands ###
