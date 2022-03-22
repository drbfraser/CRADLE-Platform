"""Change followup id to string

Revision ID: c91d7f81c853
Revises: 3d4134e04df9
Create Date: 2022-03-21 01:14:48.360133

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = "c91d7f81c853"
down_revision = "3d4134e04df9"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "followup",
        "id",
        existing_type=mysql.INTEGER(display_width=11),
        type_=sa.String(length=50),
        existing_nullable=False,
    )

    connection = op.get_bind()
    results = connection.execute("SELECT id FROM followup")
    for (existing_id,) in results:
        new_id = str(uuid.uuid4())
        results = connection.execute(
            f"UPDATE followup SET id='{new_id}' WHERE id='{existing_id}'"
        )


def downgrade():
    connection = op.get_bind()
    new_id = 1
    results = connection.execute("SELECT id FROM followup")
    for (existing_id,) in results:
        results = connection.execute(
            f"UPDATE followup SET id='{new_id}' WHERE id='{existing_id}'"
        )
        new_id += 1

    op.alter_column(
        "followup",
        "id",
        existing_type=sa.String(length=50),
        type_=mysql.INTEGER(display_width=11),
        existing_nullable=False,
    )
