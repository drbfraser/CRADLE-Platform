"""Change referral id to string

Revision ID: 3d4134e04df9
Revises: 276237440825
Create Date: 2022-03-21 00:32:22.851157

"""
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '3d4134e04df9'
down_revision = '276237440825'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('referral', 'id',
               existing_type=mysql.INTEGER(display_width=11),
               type_=sa.String(length=50),
               existing_nullable=False)

    connection = op.get_bind()
    results = connection.execute("SELECT id FROM referral")
    for existing_id, in results:
        new_id = str(uuid.uuid4())
        results = connection.execute(f"UPDATE referral SET id=\'{new_id}\' WHERE id=\'{existing_id}\'")


def downgrade():
    connection = op.get_bind()
    new_id = 1
    results = connection.execute("SELECT id FROM referral")
    for existing_id, in results:
        results = connection.execute(f"UPDATE referral SET id=\'{new_id}\' WHERE id=\'{existing_id}\'")
        new_id += 1

    op.alter_column('referral', 'id',
               existing_type=sa.String(length=50),
               type_=mysql.INTEGER(display_width=11),
               existing_nullable=False)
    
