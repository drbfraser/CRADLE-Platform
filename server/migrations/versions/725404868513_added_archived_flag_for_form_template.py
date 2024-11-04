"""
Added archived flag for Form Template

Revision ID: 725404868513
Revises: 5bd241bc95c4
Create Date: 2022-06-17 08:56:14.911152

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "725404868513"
down_revision = "5bd241bc95c4"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("form_template", sa.Column("archived", sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("form_template", "archived")
    # ### end Alembic commands ###