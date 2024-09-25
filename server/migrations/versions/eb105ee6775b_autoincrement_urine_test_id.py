"""
autoincrement urine test id

Revision ID: eb105ee6775b
Revises: a1913287ffaf
Create Date: 2020-07-25 23:43:14.758599

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "eb105ee6775b"
down_revision = "a1913287ffaf"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("urine_test", "Id")
    op.add_column("urine_test", sa.Column("id", sa.Integer(), nullable=False))
    op.drop_constraint("urine_test_ibfk_1", "urine_test", type_="foreignkey")
    op.create_foreign_key(
        None, "urine_test", "reading", ["readingId"], ["readingId"], ondelete="CASCADE",
    )
    op.execute(
        """
        ALTER TABLE urine_test
        ADD CONSTRAINT urine_test_pk PRIMARY KEY (id)
        """,
    )
    op.execute(
        """
        ALTER TABLE urine_test
        MODIFY id INTEGER NOT NULL AUTO_INCREMENT
        """,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("urine_test", "id")
    op.drop_constraint("urine_test_ibfk_1", "urine_test", type_="foreignkey")
    op.add_column(
        "urine_test",
        sa.Column(
            "Id",
            sa.VARCHAR(50),
            nullable=False,
        ),
    )
    op.create_foreign_key(
        "urine_test_ibfk_1", "urine_test", "reading", ["readingId"], ["readingId"],
    )
    # ### end Alembic commands ###
