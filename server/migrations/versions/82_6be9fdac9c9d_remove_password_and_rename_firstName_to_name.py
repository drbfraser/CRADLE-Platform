"""
remove_password_and_rename_firstName_to_name

Revision ID: 82_6be9fdac9c9d
Revises: 9ca5f8290e19
Create Date: 2024-11-03 04:53:55.501490

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "82_6be9fdac9c9d"
down_revision = "9ca5f8290e19"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(table_name="user",
                    column_name="firstName",
                    new_column_name="name",
                    nullable=False,
                    existing_type=sa.String(length=25),
                    existing_nullable=True)
    op.drop_column("user", "password")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("user", sa.Column("password", mysql.VARCHAR(length=128), nullable=True))
    op.alter_column(table_name="user",
                    column_name="name",
                    new_column_name="firstName",
                    nullable=True,
                    existing_type=sa.String(length=25),
                    existing_nullable=False)

    # ### end Alembic commands ###
