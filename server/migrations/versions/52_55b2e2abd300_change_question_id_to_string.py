"""change question id to string

Revision ID: 52_55b2e2abd300
Revises: 51_34a86324fdb4
Create Date: 2022-03-22 06:43:53.868389

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "52_55b2e2abd300"
down_revision = "51_34a86324fdb4"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "question",
        "id",
        existing_type=mysql.INTEGER(display_width=11),
        type_=sa.String(length=50),
        existing_nullable=False,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "question",
        "id",
        existing_type=sa.String(length=50),
        type_=mysql.INTEGER(display_width=11),
        existing_nullable=False,
        autoincrement=True,
    )
    # ### end Alembic commands ###
