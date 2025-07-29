"""Add start_date column to workflow_instance_step

Revision ID: 14_ba9e8dbc95de
Revises: 13_b6ff0a713e0e
Create Date: 2025-07-29 07:42:05.664927

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '14_ba9e8dbc95de'
down_revision = '13_b6ff0a713e0e'
branch_labels = None
depends_on = None


def upgrade():
    # add column with server default for existing rows
    op.add_column('workflow_instance_step', 
                  sa.Column('start_date', sa.BigInteger(), nullable=False, 
                           server_default='0'))  # or use current timestamp
    
    # update existing rows with actual values
    op.execute("UPDATE workflow_instance_step SET start_date = last_edited WHERE start_date = 0")
    
    # remove server default 
    op.alter_column('workflow_instance_step', 'start_date', server_default=None)
    # ### end Alembic commands ###


def downgrade():
    # drop column
    op.drop_column('workflow_instance_step', 'start_date')
    # ### end Alembic commands ###
