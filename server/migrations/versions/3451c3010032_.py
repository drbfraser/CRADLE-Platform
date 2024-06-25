"""redesign FormTemplate and create FormClassification

Revision ID: 3451c3010032
Revises: 725404868513
Create Date: 2022-06-17 03:47:55.068483

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "3451c3010032"
down_revision = "725404868513"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "form_classification",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_form_classification_name"),
        "form_classification",
        ["name"],
        unique=False,
    )
    op.add_column(
        "form_template",
        sa.Column("formClassificationId", sa.String(length=50), nullable=True),
    )
    op.drop_index("ix_form_template_name", table_name="form_template")
    op.create_foreign_key(
        None,
        "form_template",
        "form_classification",
        ["formClassificationId"],
        ["id"],
        ondelete="SET NULL",
    )
    op.drop_column("form_template", "category")
    op.drop_column("form_template", "lastEdited")
    op.drop_column("form_template", "name")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "form_template", sa.Column("name", mysql.VARCHAR(length=200), nullable=False)
    )
    op.add_column(
        "form_template",
        sa.Column(
            "lastEdited",
            mysql.BIGINT(display_width=20),
            autoincrement=False,
            nullable=False,
        ),
    )
    op.add_column("form_template", sa.Column("category", mysql.TEXT(), nullable=True))
    op.drop_constraint(None, "form_template", type_="foreignkey")
    op.create_index("ix_form_template_name", "form_template", ["name"], unique=False)
    op.drop_column("form_template", "formClassificationId")
    op.drop_index(op.f("ix_form_classification_name"), table_name="form_classification")
    op.drop_table("form_classification")
    # ### end Alembic commands ###
