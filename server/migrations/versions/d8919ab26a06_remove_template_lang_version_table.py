"""remove template lang version table

Revision ID: d8919ab26a06
Revises: 8066e35980e3
Create Date: 2022-04-06 13:32:03.288725

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "d8919ab26a06"
down_revision = "8066e35980e3"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("template_lang_version")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "template_lang_version",
        sa.Column(
            "id", mysql.INTEGER(display_width=11), autoincrement=True, nullable=False
        ),
        sa.Column("lang", mysql.TEXT(), nullable=False),
        sa.Column("formTemplateId", mysql.VARCHAR(length=50), nullable=False),
        sa.ForeignKeyConstraint(
            ["formTemplateId"],
            ["form_template.id"],
            name="template_lang_version_ibfk_1",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        mysql_default_charset="utf8mb4",
        mysql_engine="InnoDB",
    )
    # ### end Alembic commands ###
