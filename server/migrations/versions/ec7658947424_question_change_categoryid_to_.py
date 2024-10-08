"""
question change categoryid to categoryIndex

Revision ID: ec7658947424
Revises: 3b0691f5ce8e
Create Date: 2022-04-16 11:22:59.766719

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "ec7658947424"
down_revision = "3b0691f5ce8e"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("question", sa.Column("categoryIndex", sa.Integer(), nullable=True))
    op.drop_constraint("fk_question_category_id_id", "question", type_="foreignkey")
    op.drop_index("ix_question_categoryId", table_name="question")
    op.drop_column("question", "categoryId")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "question",
        sa.Column("categoryId", mysql.VARCHAR(length=50), nullable=True),
    )
    op.create_foreign_key(
        "fk_question_category_id_id",
        "question",
        "question",
        ["categoryId"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_question_categoryId", "question", ["categoryId"], unique=False)
    op.drop_column("question", "categoryIndex")
    # ### end Alembic commands ###
