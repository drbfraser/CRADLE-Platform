"""
add question table remove question field in form and template

Revision ID: 19f48b160991
Revises: 7eafd350a1a9
Create Date: 2022-03-15 06:18:48.092314

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "19f48b160991"
down_revision = "7eafd350a1a9"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "question",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("isBlank", sa.Boolean(), nullable=False),
        sa.Column("questionIndex", sa.Integer(), nullable=False),
        sa.Column("questionId", sa.Text(), nullable=False),
        sa.Column("questionText", sa.Text(), nullable=False),
        sa.Column("questionType", sa.Text(), nullable=False),
        sa.Column("category", sa.Text(), nullable=False),
        sa.Column("required", sa.Boolean(), nullable=False),
        sa.Column("units", sa.Text(), nullable=True),
        sa.Column("visibleCondition", sa.Text(), nullable=False),
        sa.Column("mcOptions", sa.Text(), nullable=False),
        sa.Column("numMin", sa.Integer(), nullable=True),
        sa.Column("numMax", sa.Integer(), nullable=True),
        sa.Column("stringMaxLength", sa.Integer(), nullable=True),
        sa.Column("answers", sa.Text(), nullable=False),
        sa.Column("formId", sa.Integer(), nullable=True),
        sa.Column("formTemplateId", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["formId"], ["form.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["formTemplateId"],
            ["form_template.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.drop_column("form", "questions")
    op.drop_column("form_template", "questions")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("form_template", sa.Column("questions", mysql.TEXT(), nullable=False))
    op.add_column("form", sa.Column("questions", mysql.TEXT(), nullable=False))
    op.drop_table("question")
    # ### end Alembic commands ###
