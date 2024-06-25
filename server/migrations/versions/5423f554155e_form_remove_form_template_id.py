"""form remove form_template_id

Revision ID: 5423f554155e
Revises: 5161a368f64c
Create Date: 2022-03-09 10:10:55.282677

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "5423f554155e"
down_revision = "5161a368f64c"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("form_ibfk_1", "form", type_="foreignkey")
    op.drop_column("form", "formTemplateId")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "form",
        sa.Column(
            "formTemplateId",
            mysql.INTEGER(display_width=11),
            autoincrement=False,
            nullable=False,
        ),
    )
    op.create_foreign_key(
        "form_ibfk_1",
        "form",
        "form_template",
        ["formTemplateId"],
        ["id"],
        ondelete="CASCADE",
    )
    # ### end Alembic commands ###
