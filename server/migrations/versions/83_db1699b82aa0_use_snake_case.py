"""use snake case

Revision ID: 83_db1699b82aa0
Revises: 82_6be9fdac9c9d
Create Date: 2024-11-03 05:15:45.861699

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '83_db1699b82aa0'
down_revision = '82_6be9fdac9c9d'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(table_name='user', 
                    column_name='healthFacilityName',
                    new_column_name='health_facility_name',
                    existing_type=sa.String(length=50),
                    existing_nullable=True,
                    )
    # ### end Alembic commands ###


def downgrade():
    op.alter_column(table_name='user', 
                column_name='health_facility_name',
                new_column_name='healthFacilityName',
                existing_type=sa.String(length=50),
                existing_nullable=True,
                )
    # ### end Alembic commands ###
