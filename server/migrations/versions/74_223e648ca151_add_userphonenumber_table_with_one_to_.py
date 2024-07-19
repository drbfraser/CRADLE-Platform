"""Add UserPhoneNumber table with one-to-many relationship with User
Revision ID: 223e648ca151
Revises: f64d52006db0
Create Date: 2023-07-22 21:23:54.287809
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "223e648ca151"
down_revision = "f64d52006db0"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "user_phone_number",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("number", sa.String(length=20), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("number"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("user_phone_number")
    # ### end Alembic commands ###
