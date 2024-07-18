"""add template and question lang version table

Revision ID: 57_e6f5494b9217
Revises: 56_66296a0f5d6f
Create Date: 2022-04-06 09:21:10.752587

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "57_e6f5494b9217"
down_revision = "56_66296a0f5d6f"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "template_lang_version",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("lang", sa.Text(), nullable=False),
        sa.Column("formTemplateId", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(
            ["formTemplateId"], ["form_template.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "question_lang_version",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("lang", sa.Text(), nullable=False),
        sa.Column("questionText", sa.Text(), nullable=False),
        sa.Column("mcOptions", sa.Text(), nullable=False),
        sa.Column("qid", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(["qid"], ["question.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("question_lang_version")
    op.drop_table("template_lang_version")
    # ### end Alembic commands ###
