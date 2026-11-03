"""
Add allowed_values column to workflow variable catalogue

Revision ID: 39_add_allowed_values
Revises: 38_995ebb85761c
"""

import sqlalchemy as sa
from alembic import op

revision = "39_add_allowed_values"
down_revision = "38_995ebb85761c"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "workflow_variable_catalogue",
        sa.Column("allowed_values", sa.JSON(), nullable=True),
    )

    bind = op.get_bind()

    bind.execute(
        sa.text(
            """
            UPDATE workflow_variable_catalogue
            SET allowed_values = :allowed_values
            WHERE tag = 'vitals[latest].traffic_color'
            """
        ),
        {"allowed_values": '["GREEN", "YELLOW", "RED"]'},
    )

    bind.execute(
        sa.text(
            """
            UPDATE workflow_variable_catalogue
            SET allowed_values = :allowed_values
            WHERE tag = 'vitals[latest].traffic_arrow'
            """
        ),
        {"allowed_values": '["UP", "DOWN"]'},
    )


def downgrade():
    op.drop_column(
        "workflow_variable_catalogue",
        "allowed_values",
    )
